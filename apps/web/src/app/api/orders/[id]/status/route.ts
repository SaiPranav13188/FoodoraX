// app/api/orders/[id]/status/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@foodorax/database";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status, driverId } = await request.json();

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(driverId !== undefined && { driverId }),
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}