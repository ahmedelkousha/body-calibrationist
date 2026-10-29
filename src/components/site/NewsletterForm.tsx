"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email) return;
    setState("loading");
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Newsletter subscriber",
          email,
          phone: "",
          subject: "Newsletter signup",
          message: "Please add me to the monthly quiet letter.",
          status: "new",
          notes: "",
        }),
      });
      if (!response.ok) throw new Error("failed");
      setState("done");
      setEmail("");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="mt-5 rounded-2xl border border-cream/20 bg-cream/10 px-4 py-3 text-sm text-cream">
        You&apos;re on the list. The next letter lands at the start of the month.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-5">
      <div className="flex items-center gap-2 rounded-full border border-cream/25 bg-cream/5 px-2 py-1.5">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Your email"
          aria-label="Email address"
          className="min-w-0 flex-1 bg-transparent px-3 py-1.5 text-sm text-cream outline-none placeholder:text-cream/40"
          required
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="rounded-full bg-cream px-4 py-1.5 text-xs font-medium text-teal transition hover:bg-gold-light disabled:opacity-60"
        >
          {state === "loading" ? "…" : "Join"}
        </button>
      </div>
      {state === "error" && <p className="mt-2 text-xs text-gold-light">Something went wrong. Please try again.</p>}
    </form>
  );
}
