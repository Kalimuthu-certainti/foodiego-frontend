import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      count: 0,
      total: 0,
      restaurantId: null,

      addItem: (item) => {
        const { items, restaurantId } = get();
        let newItems;

        if (restaurantId && restaurantId !== item.restaurantId) {
          newItems = [{ ...item, quantity: 1 }];
        } else {
          const existing = items.find((i) => i.id === item.id);
          if (existing) {
            newItems = items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
            );
          } else {
            newItems = [...items, { ...item, quantity: 1 }];
          }
        }

        set({
          items: newItems,
          restaurantId: item.restaurantId,
          count: newItems.reduce((s, i) => s + i.quantity, 0),
          total: newItems.reduce((s, i) => s + i.price * i.quantity, 0),
        });
      },

      removeItem: (id) => {
        const items = get().items.filter((i) => i.id !== id);
        set({
          items,
          count: items.reduce((s, i) => s + i.quantity, 0),
          total: items.reduce((s, i) => s + i.price * i.quantity, 0),
          restaurantId: items.length ? get().restaurantId : null,
        });
      },

      updateQuantity: (id, qty) => {
        if (qty <= 0) { get().removeItem(id); return; }
        const items = get().items.map((i) => (i.id === id ? { ...i, quantity: qty } : i));
        set({
          items,
          count: items.reduce((s, i) => s + i.quantity, 0),
          total: items.reduce((s, i) => s + i.price * i.quantity, 0),
        });
      },

      clearCart: () => set({ items: [], count: 0, total: 0, restaurantId: null }),

      getCount: () => get().count,
    }),
    { name: 'foodiego-cart' },
  ),
);
