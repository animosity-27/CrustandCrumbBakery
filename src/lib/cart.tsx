import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartItem, Product } from '@/lib/supabase';

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (product: Product, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  isOpen: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'cc_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore quota errors */
    }
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const add = (product: Product, qty = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.product_id === product.id);
        if (existing) {
          return prev.map((i) =>
            i.product_id === product.id ? { ...i, quantity: i.quantity + qty } : i,
          );
        }
        return [
          ...prev,
          {
            product_id: product.id,
            name: product.name,
            price: Number(product.price),
            image: product.image,
            quantity: qty,
          },
        ];
      });
      setIsOpen(true);
    };

    const remove = (productId: string) => {
      setItems((prev) => {
        const newItems = prev.filter((i) => i.product_id !== productId);
        // FIX: If cart becomes empty, close the drawer automatically
        if (newItems.length === 0) {
          setIsOpen(false);
        }
        return newItems;
      });
    };

    const setQty = (productId: string, qty: number) => {
      setItems((prev) => {
        if (qty <= 0) {
          const newItems = prev.filter((i) => i.product_id !== productId);
          // FIX: If cart becomes empty, close the drawer automatically
          if (newItems.length === 0) {
            setIsOpen(false);
          }
          return newItems;
        }
        return prev.map((i) => (i.product_id === productId ? { ...i, quantity: qty } : i));
      });
    };

    const clear = () => {
      setItems([]);
      // FIX: Close drawer when clearing cart
      setIsOpen(false);
    };

    const count = items.reduce((s, i) => s + i.quantity, 0);
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

    return {
      items,
      count,
      subtotal,
      add,
      remove,
      setQty,
      clear,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      isOpen,
    };
  }, [items, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}