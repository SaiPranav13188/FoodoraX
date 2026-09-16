import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, address } = body;

    if (!items || items.length === 0 || !address) {
      return NextResponse.json(
        { message: "Missing required order fields" },
        { status: 400 }
      );
    }

    // Determine backend URL from environment or fall back to live Render API
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://foodorax-2vgu.onrender.com";

    // Forward payload to NestJS backend /orders route
    const response = await fetch(`${backendUrl}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(req.headers.get("authorization")
          ? { authorization: req.headers.get("authorization")! }
          : {}),
      },
      body: JSON.stringify(body),
    });

    // Safely parse JSON or fall back to text error handling
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text || "Backend request failed" };
    }

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to process checkout via API" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("API ROUTE ERROR:", err);
    return NextResponse.json(
      { message: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}