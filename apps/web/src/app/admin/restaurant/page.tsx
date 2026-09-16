// app/admin/restaurant/page.tsx
"use client";

import { useEffect, useState } from "react";

type OrderItem = {
  id: string;
  quantity: number;
  price: number | string;
  menuItem: {
    name: string;
  };
};

type Order = {
  id: string;
  total: number | string;
  status: string;
  createdAt: string;
  user: { firstName: string; lastName: string };
  orderItems: OrderItem[];
};

export default function RestaurantPortal() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "PREPARING" | "READY">("ALL");

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const eventSource = new EventSource("/api/orders/sse");
    eventSource.onmessage = () => fetchOrders();
    return () => eventSource.close();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RECEIVED":
      case "PAID":
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">PENDING</span>;
      case "PREPARING":
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">PREPARING</span>;
      case "READY_FOR_PICKUP":
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">READY FOR PICKUP</span>;
      case "CANCELLED":
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-500/20 text-red-400 border border-red-500/30">CANCELLED</span>;
      default:
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-zinc-500/20 text-zinc-400 border border-zinc-500/30">{status}</span>;
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "PENDING") return order.status === "RECEIVED" || order.status === "PAID";
    if (filter === "PREPARING") return order.status === "PREPARING";
    if (filter === "READY") return order.status === "READY_FOR_PICKUP" || order.status === "DELIVERED";
    return true;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Kitchen Orders Dashboard</h1>
            <p className="text-sm text-zinc-400">Manage incoming orders and update kitchen progress in real-time.</p>
          </div>

          {/* Filter Controls */}
          <div className="flex items-center bg-zinc-900 p-1 rounded-lg border border-zinc-800 self-start">
            {(["ALL", "PENDING", "PREPARING", "READY"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filter === tab
                    ? "bg-orange-500 text-white shadow"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/50">
              <p className="text-zinc-400 text-sm">No orders found in this status category.</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4"
              >
                {/* Order Top Meta */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-sm font-bold text-orange-400">
                      #{order.id.slice(-5).toUpperCase()}
                    </span>
                    <span className="text-sm font-medium text-zinc-200">
                      {order.user?.firstName || "Guest"} {order.user?.lastName || ""}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(order.status)}
                    <span className="text-sm font-semibold text-zinc-100">
                      ${Number(order.total).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-1.5 bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Items</p>
                  {order.orderItems && order.orderItems.length > 0 ? (
                    order.orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-zinc-300">
                          <strong className="text-orange-400 mr-2">{item.quantity}x</strong>
                          {item.menuItem?.name || "Menu Item"}
                        </span>
                        <span className="text-zinc-500 font-mono text-xs">
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-500 italic">No item details available</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-1">
                  {(order.status === "RECEIVED" || order.status === "PAID") && (
                    <>
                      <button
                        onClick={() => updateStatus(order.id, "CANCELLED")}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition"
                      >
                        Reject Order
                      </button>
                      <button
                        onClick={() => updateStatus(order.id, "PREPARING")}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-lg shadow transition"
                      >
                        Accept & Start Preparing
                      </button>
                    </>
                  )}

                  {order.status === "PREPARING" && (
                    <button
                      onClick={() => updateStatus(order.id, "READY_FOR_PICKUP")}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow transition"
                    >
                      Mark Ready for Pickup
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}