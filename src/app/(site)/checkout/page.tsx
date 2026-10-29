"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice, safeImage } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-sand bg-white/70 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink-soft/60 focus:border-teal focus:bg-white";

export default function CheckoutPage() {
  const { lines, subtotal, clear, count } = useCart();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postcode: "",
    card: "",
    expiry: "",
    cvc: "",
    method: "card",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [orderRef, setOrderRef] = useState("");

  const shipping = subtotal === 0 || subtotal >= 120 ? 0 : 9.5;
  const total = subtotal + shipping;

  async function placeOrder(event: React.FormEvent) {
    event.preventDefault();
    if (lines.length === 0) return;
    setStatus("sending");
    try {
      const reference = `SH-${Date.now().toString(36).toUpperCase().slice(-6)}`;
      const summary = lines
        .map((line) => `${line.quantity} × ${line.name} (${formatPrice(line.price)})`)
        .join(", ");
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: `Store order ${reference}`,
          message: `Order ${reference}\n\n${summary}\n\nTotal: ${formatPrice(total)}\nShip to: ${form.address}, ${form.city} ${form.postcode}\nPayment: ${form.method === "apple" ? "Apple Pay (demo)" : "Card (demo)"}`,
          status: "new",
          notes: `Store order · ${count} item(s) · ${formatPrice(total)}`,
        }),
      });
      if (!response.ok) throw new Error("failed");
      setOrderRef(reference);
      setStatus("done");
      clear();
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <section className="mx-auto max-w-2xl px-5 py-24 text-center sm:px-8">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sky-light">
          <svg className="h-9 w-9 text-teal" fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="mt-6 font-display text-4xl text-ink">Thank you, it&apos;s in.</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          Order <span className="font-medium text-ink">{orderRef}</span> has been received. A confirmation is
          on its way to your inbox, and we&apos;ll have it packed within two business days.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/store" className="rounded-full bg-teal px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-cream hover:bg-ink">
            Continue shopping
          </Link>
          <Link href="/" className="rounded-full border border-sand px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-ink hover:border-teal hover:text-teal">
            Back home
          </Link>
        </div>
        <p className="mt-8 text-[11px] text-ink-soft">
          Demo checkout — connect a Stripe account to take live payments.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Checkout</p>
          <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">Finish your order</h1>
        </div>
        <Link href="/store" className="text-[11px] uppercase tracking-[0.16em] text-teal hover:text-ink">
          ← Keep shopping
        </Link>
      </div>

      {lines.length === 0 ? (
        <div className="mt-10 rounded-[2rem] border border-dashed border-sand py-20 text-center">
          <p className="font-display text-2xl text-ink">Your bag is empty</p>
          <p className="mt-2 text-sm text-ink-soft">Add something small and good, then come back.</p>
          <Link href="/store" className="mt-6 inline-flex rounded-full bg-teal px-7 py-3 text-[11px] uppercase tracking-[0.16em] text-cream hover:bg-ink">
            Browse the store
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <form onSubmit={placeOrder} className="lg:col-span-7">
            <div className="rounded-[2rem] border border-sand/70 bg-white/60 p-6 sm:p-8">
              <h2 className="font-display text-2xl text-ink">Contact</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
                <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
                <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={`${inputClass} sm:col-span-2`} />
              </div>

              <h2 className="mt-8 font-display text-2xl text-ink">Shipping</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <input required placeholder="Street address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={`${inputClass} sm:col-span-2`} />
                <input required placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} />
                <input required placeholder="Postcode" value={form.postcode} onChange={(e) => setForm({ ...form, postcode: e.target.value })} className={inputClass} />
              </div>

              <h2 className="mt-8 font-display text-2xl text-ink">Payment</h2>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, method: "card" })}
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm transition ${form.method === "card" ? "border-teal bg-teal/5 text-ink" : "border-sand text-ink-soft"}`}
                >
                  Card
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, method: "apple" })}
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm transition ${form.method === "apple" ? "border-teal bg-teal/5 text-ink" : "border-sand text-ink-soft"}`}
                >
                   Pay
                </button>
              </div>

              {form.method === "card" ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-4">
                  <input placeholder="Card number" value={form.card} onChange={(e) => setForm({ ...form, card: e.target.value })} className={`${inputClass} sm:col-span-4`} inputMode="numeric" />
                  <input placeholder="MM / YY" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} className={`${inputClass} sm:col-span-2`} />
                  <input placeholder="CVC" value={form.cvc} onChange={(e) => setForm({ ...form, cvc: e.target.value })} className={`${inputClass} sm:col-span-2`} />
                </div>
              ) : (
                <p className="mt-4 rounded-xl bg-cream-deep/60 px-4 py-3 text-sm text-ink-soft">
                  Apple Pay would open here. This demo logs the order so it appears in the studio dashboard.
                </p>
              )}

              {status === "error" && <p className="mt-4 text-xs text-red-600">Something went wrong. Please try again.</p>}

              <button
                type="submit"
                disabled={status === "sending"}
                className="mt-6 w-full rounded-full bg-teal py-3.5 text-[11px] uppercase tracking-[0.2em] text-cream transition hover:bg-ink disabled:opacity-60"
              >
                {status === "sending" ? "Placing order…" : `Place order · ${formatPrice(total)}`}
              </button>
              <p className="mt-3 text-center text-[11px] text-ink-soft">
                Demo checkout. No card is charged — orders land in the dashboard for follow-up.
              </p>
            </div>
          </form>

          <aside className="lg:col-span-5">
            <div className="sticky top-28 rounded-[2rem] border border-sand/70 bg-cream-deep/40 p-6 sm:p-8">
              <h2 className="font-display text-2xl text-ink">Your order</h2>
              <ul className="mt-5 space-y-4">
                {lines.map((line) => (
                  <li key={line.id} className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-cream">
                      <Image src={safeImage(line.image, "/images/product-oil.webp")} alt={line.name} fill sizes="64px" className="object-cover" />
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
                Free shipping over $120. All prices in AUD. Returns accepted within 30 days on unopened
                products.
              </p>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
