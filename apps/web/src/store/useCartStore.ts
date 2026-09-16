import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName?: string;
  isVeg?: boolean;
  description?: string;
}

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,

      addItem: (newItem) => {
        const { items, restaurantId } = get();

        // Clear cart if ordering from a different restaurant
        if (restaurantId && restaurantId !== newItem.restaurantId) {
          set({
            items: [{ ...newItem, quantity: 1 }],
            restaurantId: newItem.restaurantId,
          });
          return;
        }

        const existingIndex = items.findIndex((i) => i.id === newItem.id);
        if (existingIndex > -1) {
          const updated = [...items];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + 1,
          };
          set({ items: updated });
        } else {
          set({
            items: [...items, { ...newItem, quantity: 1 }],
            restaurantId: newItem.restaurantId,
          });
        }
      },

      updateQuantity: (id, delta) => {
        const { items, restaurantId } = get();
        const updated = items
          .map((item) => {
            if (item.id === id) {
              const newQuantity = item.quantity + delta;
              return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
            }
            return item;
          })
          .filter((item): item is CartItem => item !== null);

        set({
          items: updated,
          restaurantId: updated.length === 0 ? null : restaurantId,
        });
      },

      removeItem: (id) => {
        const updated = get().items.filter((i) => i.id !== id);
        set({
          items: updated,
          restaurantId: updated.length === 0 ? null : get().restaurantId,
        });
      },

      clearCart: () => set({ items: [], restaurantId: null }),

      getTotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'foodorax-cart',
    }
  )
);