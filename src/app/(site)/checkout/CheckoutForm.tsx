"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice, safeImage } from "@/lib/utils";
import { ArrowLeftIcon } from "@/components/icons";

const inputClass =
  "w-full rounded-xl border border-sand bg-white/70 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink-soft/60 focus:border-teal focus:bg-white";

type Props = {
  stripeConfigured: boolean;
  canceled: boolean;
};

export default function CheckoutForm({ stripeConfigured, canceled }: Props) {
  const { lines, subtotal, count } = useCart();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");

  const shipping = subtotal === 0 || subtotal >= 120 ? 0 : 9.5;
  const total = subtotal + shipping;

  async function startPayment(event: React.FormEvent) {
    event.preventDefault();
    if (lines.length === 0 || status === "sending") return;

    setStatus("sending");
    setError("");

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "product",
          items: lines.map((line) => ({ id: line.id, quantity: line.quantity })),
          customer: form,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Could not start the secure payment. Please try again.");
      }

      window.location.assign(data.url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not start the payment.");
      setStatus("error");
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Checkout</p>
          <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">Finish your order</h1>
        </div>
        <Link
          href="/store"
          className="group/link inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-teal hover:text-ink"
        >
          <ArrowLeftIcon className="h-3 w-3 transition-transform group-hover/link:-translate-x-0.5" />
          <span>Keep shopping</span>
        </Link>
      </div>

      {canceled && (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Payment was cancelled and nothing was charged. Your bag is still here whenever you are ready.
        </div>
      )}

      {lines.length === 0 ? (
        <div className="mt-10 rounded-[2rem] border border-dashed border-sand py-20 text-center">
          <p className="font-display text-2xl text-ink">Your bag is empty</p>
          <p className="mt-2 text-sm text-ink-soft">Add something small and good, then come back.</p>
          <Link
            href="/store"
            className="mt-6 inline-flex rounded-full bg-teal px-7 py-3 text-[11px] uppercase tracking-[0.16em] text-cream hover:bg-ink"
          >
            Browse the store
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <form onSubmit={startPayment} className="lg:col-span-7">
            <div className="rounded-[2rem] border border-sand/70 bg-white/60 p-6 sm:p-8">
              <h2 className="font-display text-2xl text-ink">Contact</h2>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                Your receipt and tracking updates go to this address.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <input
                  required
                  autoComplete="name"
                  placeholder="Full name"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className={`${inputClass} sm:col-span-2`}
                />
                <input
                  required
                  type="email"
                  autoComplete="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className={inputClass}
                />
                <input
                  autoComplete="tel"
                  placeholder="Phone (optional)"
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  className={inputClass}
                />
              </div>

              <h2 className="mt-8 font-display text-2xl text-ink">Payment &amp; delivery</h2>
              <div className="mt-4 rounded-2xl border border-sand/70 bg-cream-deep/40 p-5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal/10 text-teal">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 10.5V7.5a4.5 4.5 0 0 0-9 0v3m-.75 0h10.5a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5H6.75a1.5 1.5 0 0 1-1.5-1.5v-6a1.5 1.5 0 0 1 1.5-1.5Z"
                      />
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">Secure card payment by Stripe</p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                      You&apos;ll finish payment on Stripe&apos;s secure page. Card details never touch this
                      site. Apple Pay and Google Pay appear automatically when your device supports them.
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                      Your delivery address is collected there too. Free shipping on orders over $120.
                    </p>
                  </div>
                </div>
              </div>

              {!stripeConfigured && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
                  Online payment is not connected yet. Add <code>STRIPE_SECRET_KEY</code> to{" "}
                  <code>.env.local</code> and restart the server, or{" "}
                  <Link href="/contact" className="underline underline-offset-2">
                    contact the studio
                  </Link>{" "}
                  to order.
                </div>
              )}

              {error && <p className="mt-4 text-xs leading-relaxed text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={status === "sending" || !stripeConfigured}
                className="mt-6 w-full rounded-full bg-teal py-3.5 text-[11px] uppercase tracking-[0.2em] text-cream transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "sending" ? "Opening secure payment…" : `Pay securely · ${formatPrice(total)}`}
              </button>
              <p className="mt-3 text-center text-[11px] leading-relaxed text-ink-soft">
                By paying you agree to the studio&apos;s returns policy. Unopened products can be returned
                within 30 days.
              </p>
            </div>
          </form>

          <aside className="lg:col-span-5">
            <div className="sticky top-28 rounded-[2rem] border border-sand/70 bg-cream-deep/40 p-6 sm:p-8">
              <h2 className="font-display text-2xl text-ink">Your order</h2>
              <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-ink-soft">
                {count} {count === 1 ? "item" : "items"}
              </p>
              <ul className="mt-5 space-y-4">
                {lines.map((line) => (
                  <li key={line.id} className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-cream">
                      <Image
                        src={safeImage(line.image, "/images/product-oil.webp")}
                        alt={line.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-display text-lg leading-tight text-ink">{line.name}</p>
                      <p className="text-xs text-ink-soft">Qty {line.quantity}</p>
                    </div>
                    <span className="text-sm text-ink">{formatPrice(line.price * line.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 space-y-2 border-t border-sand/70 pt-5 text-sm">
                <div className="flex justify-between text-ink-soft">
                  <span>Subtotal</span>
                  <span className="text-ink">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-ink-soft">
                  <span>Shipping</span>
                  <span className="text-ink">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between border-t border-sand/70 pt-3 font-display text-xl text-ink">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              <p className="mt-5 text-[11px] leading-relaxed text-ink-soft">
                All prices in AUD. Shipping is free over $120 and $9.50 below it. Returns accepted within
                30 days on unopened products.
              </p>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
