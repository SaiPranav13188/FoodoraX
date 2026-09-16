'use client';

import { useState } from 'react';

export interface Meal {
  id: string;
  name: string;
  description: string;
  price: number;
  category?: string;
}

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (meal: Meal) => void;
}

export function AiAssistantModal({ isOpen, onClose, onAddToCart }: AiAssistantModalProps) {
  const [prompt, setPrompt] = useState('Find me Vegetarian Greek food under $15');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAskAi = () => {
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setMeals([]);
    let accumulatedText = '';

    // Connect to NestJS SSE endpoint
    const eventSource = new EventSource(
      `http://localhost:3001/ai/recommend?prompt=${encodeURIComponent(prompt)}`
    );

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        
        // Extract incoming text chunk
        const chunk = parsed?.text ?? (typeof parsed === 'string' ? parsed : event.data);
        accumulatedText += chunk;
      } catch {
        // Fallback for raw text string payloads
        accumulatedText += event.data;
      }

      // Try parsing the accumulated text string into structured meals data
      try {
        const parsedJson = JSON.parse(accumulatedText);
        if (parsedJson?.meals && Array.isArray(parsedJson.meals)) {
          setMeals(parsedJson.meals);
        }
      } catch {
        // Ignore JSON parse errors while stream chunk is incomplete
      }
    };

    eventSource.onerror = (err) => {
      console.log('Stream finished or disconnected:', err);
      eventSource.close();
      setLoading(false);

      // Final attempt to parse complete response payload on stream end
      try {
        const parsedJson = JSON.parse(accumulatedText);
        if (parsedJson?.meals && Array.isArray(parsedJson.meals)) {
          setMeals(parsedJson.meals);
        }
      } catch (e) {
        console.error('Could not parse final JSON array:', e);
      }
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#18181b] border border-amber-500/40 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
            ✨ AI Food Assistant
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">✕</button>
        </div>

        <p className="text-sm text-gray-400 mb-4">
          Ask me for recommendations across our 80 restaurants and 1,600 varieties!
        </p>

        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
          className="w-full bg-[#09090b] border border-gray-700 rounded-lg p-3 text-white mb-4 focus:outline-none focus:border-amber-500"
          placeholder="What are you craving?"
        />

        <button
          onClick={handleAskAi}
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-lg transition disabled:opacity-50 cursor-pointer mb-4"
        >
          {loading ? 'Thinking...' : 'Ask AI'}
        </button>

        {/* Formatted Meal Cards Display */}
        {meals.length > 0 && (
          <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
            {meals.map((meal) => (
              <div 
                key={meal.id} 
                className="p-3 bg-[#09090b] border border-gray-800 rounded-xl flex justify-between items-center gap-3"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-sm">{meal.name}</h4>
                  <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{meal.description}</p>
                  <span className="text-sm font-bold text-amber-400 mt-1 block">${meal.price?.toFixed(2)}</span>
                </div>
                {onAddToCart && (
                  <button
                    onClick={() => onAddToCart(meal)}
                    className="bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs px-3 py-2 rounded-lg transition shrink-0 cursor-pointer"
                  >
                    + Add
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}