'use client';

import React from 'react';

interface OrderSuccessModalProps {
  isOpen: boolean;
  orderId: string;
  onClose: () => void;
  onTrackOrder: () => void;
}

export function OrderSuccessModal({
  isOpen,
  orderId,
  onClose,
  onTrackOrder,
}: OrderSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-success-title"
    >
      <div 
        className="w-full max-w-[420px] rounded-[20px] bg-[#1E1E24] border border-[#2E2E38] p-6 sm:p-8 text-center text-white shadow-2xl transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Icon */}
        <div className="text-5xl mb-3 select-none">🎉</div>

        {/* Modal Title */}
        <h3 
          id="order-success-title" 
          className="text-xl sm:text-2xl font-bold tracking-tight mb-2 text-white"
        >
          Order Placed Successfully!
        </h3>

        <p className="text-sm text-gray-400 mb-4">
          Your order reference number is:
        </p>

        {/* Order Reference Box */}
        <div className="bg-[#0D0D11] border border-[#2E2E38] py-2.5 px-4 rounded-xl font-mono text-base font-bold text-amber-400 mb-6 tracking-wide select-all">
          #{orderId}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onTrackOrder}
            className="flex-1 py-3 px-4 bg-[#FF5A36] hover:bg-[#e04d2c] text-white font-bold rounded-xl transition duration-200 shadow-md active:scale-95 cursor-pointer"
          >
            Track Order 🛵
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-[#2E2E38] hover:bg-[#3E3E4A] text-white font-bold rounded-xl transition duration-200 active:scale-95 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}