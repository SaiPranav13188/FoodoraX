"use client";

import { useEffect, useState } from "react";
import ReviewModal from "@/components/ReviewModal";

type Order = {
  id: string;
  status: string;
  driverId?: string;
  rating?: any;
};

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeReviewOrder, setActiveReviewOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    const res = await fetch("/api/orders");
    if (res.ok) {
      const data: Order[] = await res.json();
      setOrders(data);

      // Auto-trigger review prompt for newly delivered orders missing a rating
      const newlyDelivered = data.find(
        (o) => o.status === "DELIVERED" && !o.rating
      );
      if (newlyDelivered && !activeReviewOrder) {
        setActiveReviewOrder(newlyDelivered);
      }
    }
  };

  useEffect(() => {
    fetchOrders();
    const eventSource = new EventSource("/api/orders/sse");
    eventSource.onmessage = () => fetchOrders();
    return () => eventSource.close();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Your Orders</h1>
      {/* Order Cards Rendering Loop Here */}

      {activeReviewOrder && (
        <ReviewModal
          orderId={activeReviewOrder.id}
          hasDriver={Boolean(activeReviewOrder.driverId)}
          onClose={() => setActiveReviewOrder(null)}
          onSubmitSuccess={fetchOrders}
        />
      )}
    </div>
  );
}