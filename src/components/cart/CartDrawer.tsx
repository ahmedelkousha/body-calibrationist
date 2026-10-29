"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { formatPrice, safeImage } from "@/lib/utils";

export default function CartDrawer() {
  const { lines, isOpen, closeCart, removeItem, setQuantity, subtotal, count, clear } = useCart();

  return (
    <>
      <div
        aria-hidden={!isOpen}
        onClick={closeCart}
        className={`fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed right-0 top-0 z-[61] flex h-full w-full max-w-md flex-col bg-cream shadow-2xl transition-transform duration-400 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Shopping bag"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div className="flex items-center justify-between border-b border-sand/70 px-6 py-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-ink-soft">Your bag</p>
            <h2 className="font-display text-2xl text-ink">
              {count} {count === 1 ? "item" : "items"}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="rounded-full p-2 text-ink-soft transition hover:bg-cream-deep hover:text-ink"
            aria-label="Close cart"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-light/60">
                <svg className="h-7 w-7 text-teal" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
                </svg>
              </div>
              <p className="font-display text-xl text-ink">Your bag is empty</p>
              <p className="mt-2 max-w-[240px] text-sm text-ink-soft">
                Small-batch oils, balms and kits — made the same way we use them in the studio.
              </p>
              <Link
                href="/store"
                onClick={closeCart}
                className="mt-6 rounded-full bg-teal px-6 py-2.5 text-sm font-medium text-cream transition hover:bg-ink"
              >
                Browse the store
              </Link>
            </div>
          ) : (
            <ul className="space-y-5">
              {lines.map((line) => (
                <li key={line.id} className="flex gap-4">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-cream-deep">
                    <Image src={safeImage(line.image, "/images/product-oil.webp")} alt={line.name} fill sizes="80px" className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <Link
                          href={`/store/${line.slug}`}
                          onClick={closeCart}
                          className="font-display text-lg leading-tight text-ink hover:text-teal"
                        >
                          {line.name}
                        </Link>
                        <button
                          onClick={() => removeItem(line.id)}
                          className="text-xs text-ink-soft underline-offset-2 hover:text-teal hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-ink-soft">{formatPrice(line.price)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-sand">
                        <button
                          onClick={() => setQuantity(line.id, line.quantity - 1)}
                          className="px-3 py-1 text-ink-soft hover:text-ink"
                          aria-label={`Decrease quantity of ${line.name}`}
                        >
                          −
                        </button>
                        <span className="min-w-6 text-center text-sm">{line.quantity}</span>
                        <button
                          onClick={() => setQuantity(line.id, line.quantity + 1)}
                          className="px-3 py-1 text-ink-soft hover:text-ink"
                          aria-label={`Increase quantity of ${line.name}`}
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-medium text-ink">
                        {formatPrice(line.price * line.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-sand/70 px-6 py-5">
            <div className="flex items-center justify-between text-sm text-ink-soft">
              <span>Subtotal</span>
              <span className="font-medium text-ink">{formatPrice(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-ink-soft">
              Shipping and taxes calculated at checkout. Free shipping over $120.
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="mt-4 flex w-full items-center justify-center rounded-full bg-teal px-6 py-3 text-sm font-medium text-cream transition hover:bg-ink"
            >
              Continue to checkout
            </Link>
            <div className="mt-3 flex items-center justify-between text-xs text-ink-soft">
              <button onClick={clear} className="hover:text-ink">Clear bag</button>
              <button onClick={closeCart} className="hover:text-ink">Keep shopping</button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
