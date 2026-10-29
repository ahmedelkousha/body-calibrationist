"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { useCart } from "@/components/cart/CartProvider";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const outOfStock = product.stock <= 0;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex items-center rounded-full border border-sand bg-white/60">
        <button
          onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          className="px-4 py-3 text-ink-soft transition hover:text-ink"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="min-w-8 text-center text-sm">{quantity}</span>
        <button
          onClick={() => setQuantity((value) => Math.min(10, value + 1))}
          className="px-4 py-3 text-ink-soft transition hover:text-ink"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <button
        type="button"
        disabled={outOfStock}
        onClick={() => {
          for (let i = 0; i < quantity; i += 1) addItem(product);
        }}
        className="flex-1 rounded-full bg-teal px-8 py-3.5 text-[11px] uppercase tracking-[0.2em] text-cream transition hover:bg-ink disabled:cursor-not-allowed disabled:bg-ink/30"
      >
        {outOfStock ? "Sold out" : "Add to bag"}
      </button>
    </div>
  );
}
