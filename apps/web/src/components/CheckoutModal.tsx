'use client';

import { useState } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderSuccess: (orderId: string) => void;
}

export function CheckoutModal({ isOpen, onClose, cartItems, onOrderSuccess }: CheckoutModalProps) {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 2.99 : 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          address,
          totalAmount: total,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // 1. Reset local address state
        setAddress('');

        // 2. Close modal popup
        onClose();

        // 3. Trigger parent handler to clear cart state and show success UI
        onOrderSuccess(data.orderId);
      } else {
        alert(data.message || 'Checkout failed');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#18181b] border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl text-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-amber-400">Complete Your Order</h3>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-gray-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleCheckout} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">
              Delivery Address
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter street address"
              className="w-full bg-[#09090b] border border-gray-700 rounded-lg p-3 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="border-t border-b border-gray-800 py-3 my-2 space-y-1 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Delivery Fee</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-white text-base pt-1">
              <span>Total</span>
              <span className="text-amber-400">${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || cartItems.length === 0}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-lg transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
          </button>
        </form>
      </div>
    </div>
  );
}