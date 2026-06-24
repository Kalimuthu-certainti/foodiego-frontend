import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '../types/cart';

interface CartStore {
  items: CartItem[];
  restaurant_id: number | null;
  restaurant_name: string | null;
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      restaurant_id: null,
      restaurant_name: null,
      addItem: (item) => {
        const { items, restaurant_id } = get();
        if (restaurant_id && restaurant_id !== item.restaurant_id) {
          set({ items: [item], restaurant_id: item.restaurant_id, restaurant_name: item.restaurant_name });
          return;
        }
        const existing = items.find((i) => i.id === item.id);
        if (existing) {
          set({ items: items.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) });
        } else {
          set({ items: [...items, item], restaurant_id: item.restaurant_id, restaurant_name: item.restaurant_name });
        }
      },
      removeItem: (id) => {
        const items = get().items.filter((i) => i.id !== id);
        set({ items, restaurant_id: items.length ? get().restaurant_id : null, restaurant_name: items.length ? get().restaurant_name : null });
      },
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) { get().removeItem(id); return; }
        set({ items: get().items.map((i) => i.id === id ? { ...i, quantity } : i) });
      },
      clearCart: () => set({ items: [], restaurant_id: null, restaurant_name: null }),
      totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
      totalPrice: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
    }),
    { name: 'onroute-cart' },
  ),
);
