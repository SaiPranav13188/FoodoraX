// apps/web/src/components/ReviewModal.tsx
"use client";

import { useState } from "react";

interface ReviewModalProps {
  orderId: string;
  hasDriver: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export default function ReviewModal({
  orderId,
  hasDriver,
  onClose,
  onSubmitSuccess,
}: ReviewModalProps) {
  const [restaurantRating, setRestaurantRating] = useState(5);
  const [restaurantHover, setRestaurantHover] = useState(0);
  const [restaurantReview, setRestaurantReview] = useState("");

  const [driverRating, setDriverRating] = useState(5);
  const [driverHover, setDriverHover] = useState(0);
  const [driverReview, setDriverReview] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          restaurantRating,
          restaurantReview: restaurantReview.trim() || null,
          driverRating: hasDriver ? driverRating : null,
          driverReview: hasDriver ? driverReview.trim() || null : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      onSubmitSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to submit review:", error);
      setErrorMessage(error.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full space-y-5 text-zinc-100 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 className="text-xl font-bold tracking-tight">Rate Your Experience</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 text-lg font-bold p-1 rounded-md transition"
          >
            ✕
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 text-xs bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Restaurant Rating */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-orange-400 block">
              Food Quality & Restaurant
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= (restaurantHover || restaurantRating);
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRestaurantRating(star)}
                    onMouseEnter={() => setRestaurantHover(star)}
                    onMouseLeave={() => setRestaurantHover(0)}
                    className={`text-2xl transition-colors ${
                      isFilled ? "text-amber-400" : "text-zinc-700 hover:text-zinc-500"
                    }`}
                  >
                    ★
                  </button>
                );
              })}
            </div>
            <textarea
              placeholder="How was the food quality and packaging?"
              value={restaurantReview}
              onChange={(e) => setRestaurantReview(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-200 focus:outline-none focus:border-orange-500/50 transition placeholder:text-zinc-600"
              rows={2}
            />
          </div>

          {/* Driver Rating */}
          {hasDriver && (
            <div className="space-y-2 pt-3 border-t border-zinc-800">
              <label className="text-sm font-semibold text-blue-400 block">
                Delivery Partner
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= (driverHover || driverRating);
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setDriverRating(star)}
                      onMouseEnter={() => setDriverHover(star)}
                      onMouseLeave={() => setDriverHover(0)}
                      className={`text-2xl transition-colors ${
                        isFilled ? "text-amber-400" : "text-zinc-700 hover:text-zinc-500"
                      }`}
                    >
                      ★
                    </button>
                  );
                })}
              </div>
              <textarea
                placeholder="How was the delivery speed and service?"
                value={driverReview}
                onChange={(e) => setDriverReview(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50 transition placeholder:text-zinc-600"
                rows={2}
              />
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg transition"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-lg shadow transition disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}