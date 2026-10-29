"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/types";

export type CartLine = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  lastAdded: string | null;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "shelley-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off hydration from localStorage after mount
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  useEffect(() => {
    if (!lastAdded) return;
    const timeout = window.setTimeout(() => setLastAdded(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [lastAdded]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const addItem = useCallback((product: Product) => {
    setLines((current) => {
      const existing = current.find((line) => line.id === product.id);
      if (existing) {
        return current.map((line) =>
          line.id === product.id ? { ...line, quantity: Math.min(line.quantity + 1, 99) } : line,
        );
      }
      return [
        ...current,
        {
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1,
        },
      ];
    });
    setLastAdded(product.name);
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setLines((current) => current.filter((line) => line.id !== id));
  }, []);

  const setQuantity = useCallback((id: string, quantity: number) => {
    setLines((current) =>
      current
        .map((line) => (line.id === id ? { ...line, quantity: Math.max(1, Math.min(99, quantity)) } : line))
        .filter((line) => line.quantity > 0),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, line) => sum + line.quantity, 0);
    const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.price, 0);
    return {
      lines,
      count,
      subtotal,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      removeItem,
      setQuantity,
      clear,
      lastAdded,
    };
  }, [lines, isOpen, addItem, removeItem, setQuantity, clear, lastAdded]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
