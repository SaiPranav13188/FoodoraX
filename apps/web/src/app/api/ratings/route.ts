// apps/web/src/app/api/ratings/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@foodorax/database";

export async function POST(request: Request) {
  try {
    const { orderId, restaurantRating, restaurantReview, driverRating, driverReview } =
      await request.json();

    // 1. Basic validation for required fields
    if (!orderId || !restaurantRating) {
      return NextResponse.json(
        { error: "Missing required fields: orderId and restaurantRating are required." },
        { status: 400 }
      );
    }

    // 2. Check if the order exists and includes any existing rating
    const db = prisma as any;
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { rating: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // 3. Ensure order is in DELIVERED status before accepting reviews
    if (order.status !== "DELIVERED") {
      return NextResponse.json(
        { error: "Reviews can only be submitted for delivered orders." },
        { status: 400 }
      );
    }

    // 4. Prevent duplicate ratings for the same order
    if (order.rating) {
      return NextResponse.json(
        { error: "A review has already been submitted for this order." },
        { status: 409 }
      );
    }

    // 5. Create the rating record
    const rating = await db.rating.create({
      data: {
        orderId,
        restaurantRating: Number(restaurantRating),
        restaurantReview: restaurantReview || null,
        driverRating: driverRating ? Number(driverRating) : null,
        driverReview: driverReview || null,
      },
    });

    return NextResponse.json(rating, { status: 201 });
  } catch (error) {
    console.error("Error creating rating:", error);
    return NextResponse.json(
      { error: "Failed to submit rating. Please try again later." },
      { status: 500 }
    );
  }
}