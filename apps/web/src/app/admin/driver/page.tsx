// app/admin/driver/page.tsx
"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string;
  status: string;
  driverId: string | null;
  user: { firstName: string; lastName: string };
};

export default function DriverPortal() {
  const [orders, setOrders] = useState<Order[]>([]);
  const currentDriverId = "driver-user-id-here"; // Swap with your actual authenticated driver ID

  const fetchOrders = async () => {
    const res = await fetch("/api/orders");
    if (res.ok) {
      const data = await res.json();
      setOrders(data);
    }
  };

  useEffect(() => {
    fetchOrders();
    const eventSource = new EventSource("/api/orders/sse");
    eventSource.onmessage = () => fetchOrders();
    return () => eventSource.close();
  }, []);

  const updateDelivery = async (id: string, status: string, claim = false) => {
    await fetch(`/api/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        ...(claim && { driverId: currentDriverId }),
      }),
    });
    fetchOrders();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Driver Delivery Dashboard</h1>
      <div className="space-y-4">
        {orders
          .filter((o) => o.status === "READY_FOR_PICKUP" || o.driverId === currentDriverId)
          .map((order) => (
            <div key={order.id} className="p-4 border rounded shadow flex justify-between items-center">
              <div>
                <p className="font-semibold">Order #{order.id.slice(-5)} - {order.user?.firstName} {order.user?.lastName}</p>
                <p className="text-sm font-medium">Status: <span className="uppercase text-purple-600">{order.status}</span></p>
              </div>
              <div className="space-x-2">
                {!order.driverId && order.status === "READY_FOR_PICKUP" && (
                  <button onClick={() => updateDelivery(order.id, "OUT_FOR_DELIVERY", true)} className="px-3 py-1 bg-indigo-600 text-white rounded">Claim & Pick Up</button>
                )}
                {order.driverId === currentDriverId && order.status === "OUT_FOR_DELIVERY" && (
                  <button onClick={() => updateDelivery(order.id, "DELIVERED")} className="px-3 py-1 bg-green-600 text-white rounded">Mark Delivered</button>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}