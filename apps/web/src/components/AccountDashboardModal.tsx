'use client';

import React, { useState } from 'react';
import { 
  X, 
  Package, 
  MapPin, 
  CreditCard, 
  RotateCcw, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { 
  UserProfile, 
  HistoricalOrder, 
  SavedAddress, 
  SavedPaymentMethod 
} from '@/types/user';

interface AccountDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReorder?: (items: HistoricalOrder['items']) => void;
}

// Initial mock state
const initialUserData: UserProfile = {
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  phone: "+1 (555) 019-2834",
  addresses: [
    {
      id: "addr-1",
      label: "Home",
      street: "742 Evergreen Terrace",
      city: "Springfield",
      zipCode: "97477",
      isDefault: true,
    },
    {
      id: "addr-2",
      label: "Work",
      street: "100 Industrial Parkway, Suite 400",
      city: "Springfield",
      zipCode: "97477",
      isDefault: false,
    },
  ],
  paymentMethods: [
    {
      id: "pay-1",
      cardBrand: "Visa",
      last4: "4242",
      expiry: "12/28",
      isDefault: true,
    },
    {
      id: "pay-2",
      cardBrand: "Mastercard",
      last4: "8888",
      expiry: "09/26",
      isDefault: false,
    },
  ],
};

const mockOrderHistory: HistoricalOrder[] = [
  {
    id: "ORD-9482",
    date: "2026-03-12T18:30:00Z",
    restaurantName: "Burger & Co.",
    totalAmount: 28.50,
    status: "Delivered",
    deliveryAddress: "742 Evergreen Terrace, Springfield",
    paymentMethod: "Visa ending in 4242",
    items: [
      { id: "item-1", name: "Classic Cheeseburger", price: 12.99, quantity: 2, isVeg: false },
      { id: "item-2", name: "French Fries", price: 4.50, quantity: 1, isVeg: true },
    ],
  },
  {
    id: "ORD-8311",
    date: "2026-03-08T12:15:00Z",
    restaurantName: "Green Bowl Salads",
    totalAmount: 18.20,
    status: "Delivered",
    deliveryAddress: "100 Industrial Parkway, Suite 400",
    paymentMethod: "Mastercard ending in 8888",
    items: [
      { id: "item-3", name: "Avocado & Grain Bowl", price: 14.50, quantity: 1, isVeg: true },
    ],
  },
];

export default function AccountDashboardModal({
  isOpen,
  onClose,
  onReorder,
}: AccountDashboardModalProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'payments'>('orders');
  const [userData, setUserData] = useState<UserProfile>(initialUserData);
  const [orders, setOrders] = useState<HistoricalOrder[]>(mockOrderHistory);
  const [reorderSuccessId, setReorderSuccessId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleReorderClick = (order: HistoricalOrder) => {
    if (onReorder) {
      onReorder(order.items);
      setReorderSuccessId(order.id);
      setTimeout(() => setReorderSuccessId(null), 3000);
    }
  };

  const handleSetDefaultAddress = (id: string) => {
    setUserData((prev) => ({
      ...prev,
      addresses: prev.addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      })),
    }));
  };

  const handleDeleteAddress = (id: string) => {
    setUserData((prev) => ({
      ...prev,
      addresses: prev.addresses.filter((addr) => addr.id !== id),
    }));
  };

  const handleSetDefaultPayment = (id: string) => {
    setUserData((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map((pm) => ({
        ...pm,
        isDefault: pm.id === id,
      })),
    }));
  };

  const handleDeletePayment = (id: string) => {
    setUserData((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.filter((pm) => pm.id !== id),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{userData.name}</h2>
            <p className="text-sm text-gray-500">{userData.email} • {userData.phone}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b bg-gray-50 px-6">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
              activeTab === 'orders'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Package className="h-4 w-4" />
            Order History
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
              activeTab === 'addresses'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <MapPin className="h-4 w-4" />
            Saved Addresses
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
              activeTab === 'payments'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            Payment Methods
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* TAB 1: ORDER HISTORY */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <Package className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-2 text-base font-medium">No past orders found</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                          {order.id}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {order.restaurantName || "Food Express Order"}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {new Date(order.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            order.status === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {order.status === 'Delivered' && <CheckCircle2 className="h-3 w-3" />}
                          {order.status === 'In Progress' && <Clock className="h-3 w-3" />}
                          {order.status === 'Cancelled' && <AlertCircle className="h-3 w-3" />}
                          {order.status}
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="my-3 space-y-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm text-gray-600">
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t pt-3">
                      <p className="text-xs text-gray-400">
                        Delivered to: <span className="text-gray-600">{order.deliveryAddress}</span>
                      </p>
                      
                      <button
                        onClick={() => handleReorderClick(order)}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                          reorderSuccessId === order.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {reorderSuccessId === order.id ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Added to Cart!
                          </>
                        ) : (
                          <>
                            <RotateCcw className="h-3.5 w-3.5" />
                            Reorder
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: SAVED ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition">
                  <Plus className="h-4 w-4" /> Add New Address
                </button>
              </div>

              {userData.addresses.map((address: SavedAddress) => (
                <div
                  key={address.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{address.label}</span>
                      {address.isDefault && (
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{address.street}</p>
                    <p className="text-xs text-gray-400">
                      {address.city}, {address.zipCode}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefaultAddress(address.id)}
                        className="text-xs font-medium text-emerald-600 hover:underline"
                      >
                        Make Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                      title="Delete address"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: PAYMENT METHODS */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition">
                  <Plus className="h-4 w-4" /> Add Payment Method
                </button>
              </div>

              {userData.paymentMethods.map((pm: SavedPaymentMethod) => (
                <div
                  key={pm.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-12 items-center justify-center rounded border bg-gray-50 font-bold text-gray-700">
                      {pm.cardBrand}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">•••• •••• •••• {pm.last4}</span>
                        {pm.isDefault && (
                          <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">Expires {pm.expiry}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!pm.isDefault && (
                      <button
                        onClick={() => handleSetDefaultPayment(pm.id)}
                        className="text-xs font-medium text-emerald-600 hover:underline"
                      >
                        Make Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletePayment(pm.id)}
                      className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                      title="Delete payment method"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}