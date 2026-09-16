'use client';

export interface Meal {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

interface MealCardProps {
  meal: Meal;
  onAddToCart: (meal: Meal) => void;
}

export default function MealCard({ meal, onAddToCart }: MealCardProps) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition bg-white flex flex-col justify-between">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-1 rounded">
          {meal.category}
        </span>
        <h3 className="font-bold text-lg text-gray-800 mt-2">{meal.name}</h3>
        <p className="text-sm text-gray-600 mt-1">{meal.description}</p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-lg font-bold text-gray-900">${meal.price.toFixed(2)}</span>
        <button
          onClick={() => onAddToCart(meal)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm px-3 py-1.5 rounded-lg transition"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}