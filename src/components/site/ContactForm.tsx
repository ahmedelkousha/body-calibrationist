"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const subjects = [
  "New client enquiry",
  "Booking a treatment",
  "Skin consultation",
  "Product question",
  "Workshop or private event",
  "Something else",
];

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: subjects[0],
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status: "new", notes: "" }),
      });
      if (!response.ok) throw new Error("failed");
      setStatus("done");
      setForm({ name: "", email: "", phone: "", subject: subjects[0], message: "" });
    } catch {
      setStatus("error");
    }
  }

  const inputClass =
    "w-full rounded-xl border border-sand bg-white/70 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink-soft/60 focus:border-teal focus:bg-white";

  if (status === "done") {
    return (
      <div className="rounded-[2rem] border border-sand/70 bg-white/70 p-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-light">
          <svg className="h-7 w-7 text-teal" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="mt-5 font-display text-3xl text-ink">Thank you — it&apos;s with us now</h3>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
          Shelley reads every message herself. Expect a reply within one business day, Tuesday to Saturday.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 rounded-full border border-sand px-6 py-2.5 text-[11px] uppercase tracking-[0.16em] text-ink transition hover:border-teal hover:text-teal"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-[2rem] border border-sand/70 bg-white/70 p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-ink-soft">
            Your name *
          </label>
          <input
            id="name"
            required
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className={inputClass}
            placeholder="Charlotte Hayes"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-ink-soft">
            Email *
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            className={inputClass}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="phone" className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-ink-soft">
            Phone
          </label>
          <input
            id="phone"
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            className={inputClass}
            placeholder="+61 400 000 000"
          />
        </div>
        <div>
          <label htmlFor="subject" className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-ink-soft">
            What is this about?
          </label>
          <select
            id="subject"
            value={form.subject}
            onChange={(event) => setForm({ ...form, subject: event.target.value })}
            className={cn(inputClass, "appearance-none")}
          >
            {subjects.map((subject) => (
              <option key={subject}>{subject}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-4">
        <label htmlFor="message" className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-ink-soft">
          Your message *
        </label>
        <textarea
          id="message"
          required
          rows={5}
          value={form.message}
          onChange={(event) => setForm({ ...form, message: event.target.value })}
          className={inputClass}
          placeholder="Tell us what you are looking for, and anything we should know before we reply."
        />
      </div>
      {status === "error" && (
        <p className="mt-3 text-xs text-red-600">Something went wrong. Please try again or email us directly.</p>
      )}
      <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xs text-[11px] leading-relaxed text-ink-soft">
          Your details stay with us. No lists, no forwarding, no noise.
        </p>
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-full bg-teal px-8 py-3 text-[11px] uppercase tracking-[0.18em] text-cream transition hover:bg-ink disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
