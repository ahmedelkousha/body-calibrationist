"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Event } from "@/lib/types";
import { formatDate, formatPrice, safeImage } from "@/lib/utils";

type Props = { events: Event[] };

export default function EventsList({ events }: Props) {
  const [items, setItems] = useState(events);
  const [selected, setSelected] = useState<Event | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const upcoming = useMemo(
    () => items.filter((event) => event.status !== "past"),
    [items],
  );

  function openBooking(event: Event) {
    setSelected(event);
    setStatus("idle");
    setForm({ name: "", email: "", phone: "", message: "" });
  }

  async function submitBooking(submitEvent: React.FormEvent) {
    submitEvent.preventDefault();
    if (!selected) return;
    setStatus("sending");
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: `Workshop booking — ${selected.title}`,
          message:
            form.message ||
            `Please reserve a place at ${selected.title} on ${formatDate(selected.date)} (${selected.time}).`,
          status: "new",
          notes: `Booking request · ${selected.title}`,
          eventId: selected.id,
        }),
      });
      if (!response.ok) throw new Error("failed");

      setItems((current) =>
        current.map((event) =>
          event.id === selected.id
            ? { ...event, booked: Math.min(event.booked + 1, event.capacity) }
            : event,
        ),
      );
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <div className="space-y-5">
        {upcoming.map((event) => {
          const remaining = event.capacity - event.booked;
          const percent = Math.min(100, Math.round((event.booked / event.capacity) * 100));
          const date = new Date(event.date);
          return (
            <article
              key={event.id}
              className="group grid overflow-hidden rounded-[2rem] border border-sand/60 bg-white/60 transition hover:border-teal/20 hover:shadow-[0_30px_70px_-50px_rgba(22,48,60,0.6)] md:grid-cols-12"
            >
              <div className="relative aspect-[16/10] md:col-span-4 md:aspect-auto">
                <Image
                  src={safeImage(event.image, "/images/workshop.webp")}
                  alt={event.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute left-4 top-4 rounded-2xl bg-cream/95 px-4 py-3 text-center backdrop-blur">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-ink-soft">
                    {date.toLocaleDateString("en-AU", { month: "short" })}
                  </p>
                  <p className="font-display text-3xl leading-none text-ink">{date.getDate()}</p>
                </div>
              </div>
              <div className="flex flex-col p-6 md:col-span-8 md:p-8">
                <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                  <span>{event.time}</span>
                  <span className="h-1 w-1 rounded-full bg-gold" />
                  <span>{event.location}</span>
                </div>
                <h3 className="mt-3 font-display text-3xl leading-tight text-ink">{event.title}</h3>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">{event.description}</p>

                <div className="mt-6 flex flex-wrap items-center gap-6">
                  <div className="min-w-[180px] flex-1">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-deep">
                      <div
                        className="h-full rounded-full bg-teal/70 transition-all duration-700"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="mt-2 text-[11px] text-ink-soft">
                      {remaining > 0 ? `${remaining} of ${event.capacity} places left` : "Fully booked"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-display text-2xl text-ink">{formatPrice(event.price)}</span>
                    <button
                      onClick={() => openBooking(event)}
                      disabled={remaining <= 0}
                      className="rounded-full bg-teal px-6 py-2.5 text-[11px] uppercase tracking-[0.16em] text-cream transition hover:bg-ink disabled:cursor-not-allowed disabled:bg-ink/30"
                    >
                      {remaining <= 0 ? "Waitlist" : "Reserve a place"}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-[2rem] bg-cream shadow-2xl">
            <div className="flex items-start justify-between border-b border-sand/70 px-6 py-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-gold">Reserve your place</p>
                <h3 className="mt-1 font-display text-2xl text-ink">{selected.title}</h3>
                <p className="mt-1 text-xs text-ink-soft">
                  {formatDate(selected.date)} · {selected.time} · {formatPrice(selected.price)}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1 text-ink-soft hover:text-ink" aria-label="Close">
                ✕
              </button>
            </div>

            {status === "done" ? (
              <div className="px-6 py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-light">
                  <svg className="h-6 w-6 text-teal" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <p className="mt-4 font-display text-2xl text-ink">Your place is requested</p>
                <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
                  We&apos;ve received your request and will confirm by email within one business day. Payment is
                  taken when we confirm.
                </p>
                <button
                  onClick={() => setSelected(null)}
                  className="mt-6 rounded-full bg-teal px-6 py-2.5 text-xs uppercase tracking-[0.16em] text-cream hover:bg-ink"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={submitBooking} className="space-y-3 px-6 py-5">
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="Full name"
                  className="w-full rounded-xl border border-sand bg-white/70 px-4 py-3 text-sm outline-none focus:border-teal"
                />
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  placeholder="Email address"
                  className="w-full rounded-xl border border-sand bg-white/70 px-4 py-3 text-sm outline-none focus:border-teal"
                />
                <input
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  placeholder="Phone (optional)"
                  className="w-full rounded-xl border border-sand bg-white/70 px-4 py-3 text-sm outline-none focus:border-teal"
                />
                <textarea
                  value={form.message}
                  onChange={(event) => setForm({ ...form, message: event.target.value })}
                  placeholder="Anything we should know?"
                  rows={3}
                  className="w-full rounded-xl border border-sand bg-white/70 px-4 py-3 text-sm outline-none focus:border-teal"
                />
                {status === "error" && (
                  <p className="text-xs text-red-600">Something went wrong. Please try again.</p>
                )}
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full rounded-full bg-teal py-3 text-xs uppercase tracking-[0.18em] text-cream transition hover:bg-ink disabled:opacity-60"
                >
                  {status === "sending" ? "Sending…" : "Request a place"}
                </button>
                <p className="text-center text-[11px] text-ink-soft">
                  No payment now. We confirm availability first.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
