"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";
import { cn } from "@/lib/utils";

export default function StoreGrid({ products }: { products: Product[] }) {
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((product) => product.category)))],
    [products],
  );
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = products.filter((product) => product.status !== "archived");
    if (category !== "All") list = list.filter((product) => product.category === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (product) =>
          product.name.toLowerCase().includes(q) || product.description.toLowerCase().includes(q),
      );
    }
    switch (sort) {
      case "price-asc":
        return [...list].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...list].sort((a, b) => b.price - a.price);
      case "newest":
        return [...list].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      default:
        return [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
    }
  }, [products, category, sort, query]);

  return (
    <div>
      <div className="flex flex-col gap-6 border-y border-sand/60 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={cn(
                "rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.14em] transition",
                category === item
                  ? "border-teal bg-teal text-cream"
                  : "border-sand text-ink-soft hover:border-teal/40 hover:text-ink",
              )}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products"
              className="w-full rounded-full border border-sand bg-white/60 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-teal sm:w-56"
            />
            <svg
              className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.4}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.2-5.2m0 0A7.5 7.5 0 1 0 5.2 5.2a7.5 7.5 0 0 0 10.6 10.6Z" />
            </svg>
          </div>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="rounded-full border border-sand bg-white/60 px-4 py-2.5 text-sm outline-none focus:border-teal"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
      </div>

      <p className="mt-6 text-[11px] uppercase tracking-[0.18em] text-ink-soft">
        {filtered.length} {filtered.length === 1 ? "product" : "products"}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-10 rounded-3xl border border-dashed border-sand py-16 text-center">
          <p className="font-display text-2xl text-ink">Nothing matches that search</p>
          <p className="mt-2 text-sm text-ink-soft">Try a different word, or browse all products.</p>
          <button
            onClick={() => {
              setQuery("");
              setCategory("All");
            }}
            className="mt-5 rounded-full bg-teal px-6 py-2.5 text-[11px] uppercase tracking-[0.16em] text-cream hover:bg-ink"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
