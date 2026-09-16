// app/api/orders/sse/route.ts
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      const interval = setInterval(() => {
        sendEvent(JSON.stringify({ type: "ping" }));
      }, 15000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}