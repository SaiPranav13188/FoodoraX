import { NextResponse } from "next/server";

// Verify if your backend expects /api/orders or /orders
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://foodorax-2vgu.onrender.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get("authorization");

    // Change to `${API_URL}/api/orders` or `${API_URL}/order` depending on your NestJS setup
    const res = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to place order" },
      { status: 500 }
    );
  }
}