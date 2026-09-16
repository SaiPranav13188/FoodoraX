import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';

export interface CreateOrderDto {
  items: any[];
  address: string;
  totalAmount?: number;
}

@Controller('orders')
export class OrdersController {
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(@Body() body: CreateOrderDto) {
    console.log('Received order payload:', body);

    const { items, address } = body;

    // Basic payload validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    if (!address || typeof address !== 'string' || address.trim() === '') {
      throw new BadRequestException('Valid delivery address is required');
    }

    const orderId = `ORD-${Date.now()}`;

    return {
      success: true,
      message: 'Order placed successfully',
      orderId,
      data: {
        orderId,
        items,
        address,
        totalAmount: body.totalAmount || 0,
        createdAt: new Date().toISOString(),
      },
    };
  }
}