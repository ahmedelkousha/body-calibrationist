"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Service } from "@/lib/types";
import { formatPrice, safeImage } from "@/lib/utils";
import { ArrowLeftIcon } from "@/components/icons";

const inputClass =
  "w-full rounded-xl border border-sand bg-white/70 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink-soft/60 focus:border-teal focus:bg-white";

const timeOptions = [
  "Morning · 9am – 12pm",
  "Afternoon · 12pm – 3pm",
  "Late afternoon · 3pm – 6pm",
  "Any time",
];

type Props = {
  service: Service;
  stripeConfigured: boolean;
  canceled: boolean;
};

export default function ServiceCheckoutForm({ service, stripeConfigured, canceled }: Props) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: timeOptions[0],
    notes: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  async function startPayment(event: React.FormEvent) {
    event.preventDefault();
    if (status === "sending") return;

    setStatus("sending");
    setError("");

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "service",
          serviceId: service.id,
          customer: { name: form.name, email: form.email, phone: form.phone },
          preferredDate: [form.date, form.time].filter(Boolean).join(" · "),
          notes: form.notes,
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
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Reserve &amp; pay</p>
          <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">Book your treatment</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Pay securely now to hold your place. We&apos;ll confirm the exact time by email within one
            business day.
          </p>
        </div>
        <Link
          href={`/treatments/${service.slug}`}
          className="group/link hidden items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-teal hover:text-ink sm:inline-flex"
        >
          <ArrowLeftIcon className="h-3 w-3 transition-transform group-hover/link:-translate-x-0.5" />
          <span>Treatment details</span>
        </Link>
      </div>

      {canceled && (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Payment was cancelled and nothing was charged. Your details are still here whenever you are
          ready.
        </div>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <form onSubmit={startPayment} className="lg:col-span-7">
          <div className="rounded-[2rem] border border-sand/70 bg-white/60 p-6 sm:p-8">
            <h2 className="font-display text-2xl text-ink">Your details</h2>
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

            <h2 className="mt-8 font-display text-2xl text-ink">Preferred time</h2>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">
              This is a preference, not a confirmed booking. The studio will email to agree the exact
              time.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <input
                type="date"
                min={today}
                value={form.date}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
                className={inputClass}
                aria-label="Preferred date"
              />
              <select
                value={form.time}
                onChange={(event) => setForm({ ...form, time: event.target.value })}
                className={inputClass}
                aria-label="Preferred time"
              >
                {timeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <textarea
                rows={3}
                placeholder="Anything we should know? Skin concerns, pregnancy, injuries, or a note for Shelley."
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                className={`${inputClass} sm:col-span-2`}
              />
            </div>

            <h2 className="mt-8 font-display text-2xl text-ink">Payment</h2>
            <div className="mt-4 rounded-2xl border border-sand/70 bg-cream-deep/40 p-5">
              <p className="text-sm font-medium text-ink">Secure card payment by Stripe</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                You&apos;ll finish payment on Stripe&apos;s secure page. Apple Pay and Google Pay appear
                automatically when your device supports them. The treatment is charged in full today to
                hold your appointment.
              </p>
            </div>

            {!stripeConfigured && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
                Online payment is not connected yet. Add <code>STRIPE_SECRET_KEY</code> to{" "}
                <code>.env.local</code> and restart the server, or{" "}
                <Link href="/contact" className="underline underline-offset-2">
                  contact the studio
                </Link>{" "}
                to reserve a time.
              </div>
            )}

            {error && <p className="mt-4 text-xs leading-relaxed text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={status === "sending" || !stripeConfigured}
              className="mt-6 w-full rounded-full bg-teal py-3.5 text-[11px] uppercase tracking-[0.2em] text-cream transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "sending"
                ? "Opening secure payment…"
                : `Pay & reserve · ${formatPrice(service.price)}`}
            </button>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-ink-soft">
              Need to reschedule? Just reply to your confirmation email at least 24 hours before your
              appointment.
            </p>
          </div>
        </form>

        <aside className="lg:col-span-5">
          <div className="sticky top-28 overflow-hidden rounded-[2rem] border border-sand/70 bg-cream-deep/40">
            <div className="relative aspect-[4/3] bg-cream">
              <Image
                src={safeImage(service.image, "/images/service-massage.webp")}
                alt={service.name}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
            <div className="p-6 sm:p-8">
              <p className="text-[10px] uppercase tracking-[0.28em] text-gold">Treatment</p>
              <h2 className="mt-2 font-display text-2xl text-ink">{service.name}</h2>
              <p className="mt-1 font-display text-lg italic text-teal">{service.tagline}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/70 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-ink">
                  {service.duration} minutes
                </span>
                <span className="rounded-full bg-white/70 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-ink">
                  One-to-one
                </span>
              </div>
              <div className="mt-5 flex items-baseline justify-between border-t border-sand/70 pt-4">
                <span className="text-sm text-ink-soft">Total today</span>
                <span className="font-display text-2xl text-ink">{formatPrice(service.price)}</span>
              </div>
              <p className="mt-4 text-[11px] leading-relaxed text-ink-soft">
                All prices in AUD and include GST. Payment is processed by Stripe; the studio never sees
                your card details.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
