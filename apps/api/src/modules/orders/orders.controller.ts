import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { prisma, OrderStatus } from '@foodorax/database';

export interface CreateOrderDto {
  items: Array<{
    id?: string;
    menuItemId?: string;
    name: string;
    price: number | string;
    quantity: number;
  }>;
  address?: string;
  totalAmount?: number | string;
  userId?: string;
}

@Controller('orders')
export class OrdersController {
  @Post()
  @HttpCode(HttpStatus.CREATED)
  // Added : Promise<any> return type annotation below
  async createOrder(@Body() body: CreateOrderDto): Promise<any> {
    console.log('Received order payload:', body);

    const { items, totalAmount, userId } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    try {
      let targetUserId = userId;

      if (!targetUserId) {
        let guestRole = await prisma.role.findUnique({
          where: { name: 'CUSTOMER' },
        });

        if (!guestRole) {
          guestRole = await prisma.role.create({
            data: { name: 'CUSTOMER', description: 'Customer role' },
          });
        }

        let guestUser = await prisma.user.findFirst({
          where: { email: 'guest@foodorax.com' },
        });

        if (!guestUser) {
          guestUser = await prisma.user.create({
            data: {
              email: 'guest@foodorax.com',
              passwordHash: 'guest_hashed_password',
              firstName: 'Guest',
              lastName: 'Customer',
              roleId: guestRole.id,
            },
          });
        }

        targetUserId = guestUser.id;
      }

      const orderItemsData = [];

      for (const item of items) {
        const itemIdentifier = item.menuItemId || item.id;
        let menuItem = null;

        if (itemIdentifier) {
          menuItem = await prisma.menuItem.findUnique({
            where: { id: itemIdentifier },
          });
        }

        if (!menuItem) {
          menuItem = await prisma.menuItem.create({
            data: {
              name: item.name || 'Food Item',
              price: Number(item.price) || 0,
            },
          });
        }

        orderItemsData.push({
          menuItemId: menuItem.id,
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || Number(menuItem.price) || 0,
        });
      }

      const order = await prisma.order.create({
        data: {
          userId: targetUserId,
          status: OrderStatus.RECEIVED,
          total: Number(totalAmount) || 0,
          orderItems: {
            create: orderItemsData,
          },
        },
        include: {
          orderItems: {
            include: {
              menuItem: true,
            },
          },
        },
      });

      return {
        success: true,
        message: 'Order placed successfully',
        orderId: order.id,
        data: order,
      };
    } catch (error) {
      console.error('Supabase write error:', error);
      throw new InternalServerErrorException(
        'Failed to save order to database',
      );
    }
  }
}