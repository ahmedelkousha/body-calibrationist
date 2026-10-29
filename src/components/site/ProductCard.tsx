"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice, safeImage } from "@/lib/utils";
import { useCart } from "@/components/cart/CartProvider";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const outOfStock = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 10;

  return (
    <article className="group flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-cream-deep">
        <Link href={`/store/${product.slug}`} aria-label={product.name} className="absolute inset-0">
          <Image
            src={safeImage(product.image, "/images/product-oil.webp")}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        </Link>
        <div className="absolute left-4 top-4 flex flex-col gap-2">
          {product.compareAtPrice && (
            <span className="rounded-full bg-gold px-3 py-1 text-[9px] uppercase tracking-[0.16em] text-ink">
              On offer
            </span>
          )}
          {lowStock && (
            <span className="rounded-full bg-cream/90 px-3 py-1 text-[9px] uppercase tracking-[0.16em] text-ink">
              Low stock
            </span>
          )}
          {outOfStock && (
            <span className="rounded-full bg-ink px-3 py-1 text-[9px] uppercase tracking-[0.16em] text-cream">
              Sold out
            </span>
          )}
        </div>
        <button
          type="button"
          disabled={outOfStock}
          onClick={() => addItem(product)}
          className="absolute inset-x-4 bottom-4 translate-y-3 rounded-full bg-cream/95 py-2.5 text-[11px] uppercase tracking-[0.18em] text-ink opacity-0 backdrop-blur transition-all duration-300 hover:bg-teal hover:text-cream disabled:cursor-not-allowed disabled:opacity-60 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100"
        >
          {outOfStock ? "Sold out" : "Add to bag"}
        </button>
      </div>
      <div className="mt-4 flex flex-1 flex-col">
        <p className="text-[10px] uppercase tracking-[0.24em] text-ink-soft">{product.category}</p>
        <h3 className="mt-1 font-display text-xl leading-tight text-ink">
          <Link href={`/store/${product.slug}`} className="hover:text-teal">
            {product.name}
          </Link>
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-sm text-ink">{formatPrice(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-xs text-ink-soft line-through">{formatPrice(product.compareAtPrice)}</span>
          )}
        </div>
      </div>
    </article>
  );
}
