"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetDataButton() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "working" | "done">("idle");

  async function reset() {
    if (!window.confirm("Restore all demo content? Anything you have added or edited will be replaced.")) return;
    setState("working");
    await fetch("/api/seed", { method: "POST" });
    setState("done");
    router.refresh();
    window.setTimeout(() => setState("idle"), 3000);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <button
        onClick={reset}
        disabled={state === "working"}
        className="rounded-full border border-sand bg-white/70 px-5 py-2.5 text-[11px] uppercase tracking-[0.14em] text-ink transition hover:border-rose-300 hover:text-rose-600 disabled:opacity-60"
      >
        {state === "working" ? "Restoring…" : state === "done" ? "Demo content restored" : "Restore demo content"}
      </button>
      <p className="text-[11px] text-ink-soft">Resets blogs, products, services, events, stories and inquiries.</p>
    </div>
  );
}
