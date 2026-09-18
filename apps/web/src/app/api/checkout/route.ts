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

    // Sanitize base API URL to remove trailing slashes or duplicate /api prefixes
    let baseUrl = (
      process.env.NEXT_PUBLIC_API_URL || "https://foodorax-2vgu.onrender.com"
    ).replace(/\/$/, "");

    // Ensure base URL ends with /api cleanly
    if (!baseUrl.endsWith("/api")) {
      baseUrl = `${baseUrl}/api`;
    }

    // Target endpoint: https://foodorax-2vgu.onrender.com/api/orders
    const targetUrl = `${baseUrl}/orders`;

    // Forward request to NestJS backend on Render
    const response = await fetch(targetUrl, {
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

    // Return exact response payload from NestJS backend
    return NextResponse.json(
      {
        success: true,
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