import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, address, totalAmount } = body;

    // Validate request payload
    if (!items || items.length === 0 || !address) {
      return NextResponse.json(
        { message: "Missing required order fields (items or address)" },
        { status: 400 }
      );
    }

    // Determine target backend URL
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://foodorax-2vgu.onrender.com";

    // ✅ Forward request to /api/orders (matches setGlobalPrefix('api') + @Controller('orders'))
    const response = await fetch(`${backendUrl}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(req.headers.get("authorization")
          ? { authorization: req.headers.get("authorization")! }
          : {}),
      },
      body: JSON.stringify({
        items,
        address,
        totalAmount,
      }),
    });

    // Safely parse JSON or handle plain text/HTML error responses
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text || "Backend service error" };
    }

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to process checkout via backend API" },
        { status: response.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        orderId: data.orderId || `ORD-${Date.now()}`,
        ...data,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("CHECKOUT PROXY ERROR:", err);
    return NextResponse.json(
      { message: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}