// app/api/orders/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@foodorax/database";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        driver: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}