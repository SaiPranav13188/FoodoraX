import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, OrderStatus } from '@foodorax/database';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { items, address, totalAmount, userId } = await req.json();

    if (!items || items.length === 0 || !address) {
      return NextResponse.json(
        { message: 'Missing required order fields' },
        { status: 400 }
      );
    }

    // 1. Resolve or create user with role relation
    let targetUserId = userId;
    if (!targetUserId) {
      let existingUser = await prisma.user.findFirst();
      if (!existingUser) {
        existingUser = await prisma.user.create({
          data: {
            email: 'guest@foodorax.com',
            firstName: 'Guest',
            lastName: 'User',
            passwordHash: '$2b$10$e83S7iP9/9e3M42L/O3Q4u8E4jY34hN9.q7Y0/8.uX8N',
            role: {
              connectOrCreate: {
                where: { name: 'CUSTOMER' },
                create: { name: 'CUSTOMER' },
              },
            },
          },
        });
      }
      targetUserId = existingUser.id;
    }

    // 2. Resolve order items safely
    const orderItemsData = [];
    for (const item of items) {
      let menuItemId = item.id || item.menuItemId;

      let menuItem = menuItemId
        ? await prisma.menuItem.findUnique({ where: { id: menuItemId } })
        : null;

      if (!menuItem) {
        menuItem = await prisma.menuItem.findFirst();

        if (!menuItem) {
          menuItem = await prisma.menuItem.create({
            data: {
              name: item.title || item.name || 'Sample Item',
              description: 'Auto-generated menu item',
              price: item.price || 10.0,
            },
          });
        }
      }

      orderItemsData.push({
        menuItemId: menuItem.id,
        quantity: item.quantity || 1,
        price: item.price || 10.0,
      });
    }

    // 3. Create the order
    const order = await prisma.order.create({
      data: {
        userId: targetUserId,
        status: OrderStatus.RECEIVED,
        total: totalAmount,
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: true,
      },
    });

    console.log('Successfully created order ID in DB:', order.id);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      status: order.status,
      amount: Number(order.total),
    });
  } catch (err: any) {
    console.error('FULL PRISMA ERROR:', err);
    return NextResponse.json(
      { message: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}