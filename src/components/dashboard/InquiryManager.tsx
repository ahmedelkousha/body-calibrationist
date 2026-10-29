"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Inquiry, InquiryStatus } from "@/lib/types";
import { cn, formatRelative, initials } from "@/lib/utils";
import { StatusBadge } from "./ui";

const tabs: { key: InquiryStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "read", label: "Read" },
  { key: "replied", label: "Replied" },
  { key: "archived", label: "Archived" },
];

export default function InquiryManager({ initialInquiries }: { initialInquiries: Inquiry[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialInquiries);
  const [tab, setTab] = useState<InquiryStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(initialInquiries[0]?.id ?? null);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [toast, setToast] = useState("");

  const counts = useMemo(() => {
    return {
      all: items.length,
      new: items.filter((item) => item.status === "new").length,
      read: items.filter((item) => item.status === "read").length,
      replied: items.filter((item) => item.status === "replied").length,
      archived: items.filter((item) => item.status === "archived").length,
    };
  }, [items]);

  const filtered = useMemo(() => {
    let list = items;
    if (tab !== "all") list = list.filter((item) => item.status === tab);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q) ||
          item.subject.toLowerCase().includes(q) ||
          item.message.toLowerCase().includes(q),
      );
    }
    return list;
  }, [items, tab, query]);

  const selected = items.find((item) => item.id === selectedId) ?? null;

  function select(inquiry: Inquiry) {
    setSelectedId(inquiry.id);
    setNotes(inquiry.notes);
  }

  async function updateStatus(inquiry: Inquiry, status: InquiryStatus) {
    setItems((current) => current.map((item) => (item.id === inquiry.id ? { ...item, status } : item)));
    try {
      await fetch(`/api/inquiries/${inquiry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
      setToast(`Marked as ${status}`);
      window.setTimeout(() => setToast(""), 2400);
    } catch {
      setToast("Could not update");
    }
  }

  async function saveNotes() {
    if (!selected) return;
    setSavingNotes(true);
    try {
      await fetch(`/api/inquiries/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      setItems((current) => current.map((item) => (item.id === selected.id ? { ...item, notes } : item)));
      setToast("Notes saved");
      window.setTimeout(() => setToast(""), 2400);
      router.refresh();
    } catch {
      setToast("Could not save notes");
    } finally {
      setSavingNotes(false);
    }
  }

  async function remove(inquiry: Inquiry) {
    if (!window.confirm(`Delete the message from ${inquiry.name}? This cannot be undone.`)) return;
    await fetch(`/api/inquiries/${inquiry.id}`, { method: "DELETE" });
    setItems((current) => current.filter((item) => item.id !== inquiry.id));
    if (selectedId === inquiry.id) setSelectedId(null);
    router.refresh();
  }

  return (
    <div>
      <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-sand/60 bg-white/60 p-3 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-1">
          {tabs.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={cn(
                "rounded-lg px-3 py-2 text-[11px] uppercase tracking-[0.1em] transition",
                tab === item.key ? "bg-teal text-cream" : "text-ink-soft hover:bg-cream",
              )}
            >
              {item.label}
              <span className={cn("ml-1.5 text-[10px]", tab === item.key ? "text-cream/60" : "text-ink-soft/60")}>
                {counts[item.key]}
              </span>
            </button>
          ))}
        </div>
        <div className="relative flex-1 lg:max-w-xs lg:ml-auto">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search messages…"
            className="w-full rounded-xl border border-transparent bg-transparent py-2 pl-9 pr-3 text-sm outline-none placeholder:text-ink-soft/60 focus:border-sand"
          />
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.2-5.2m0 0A7.5 7.5 0 1 0 5.2 5.2a7.5 7.5 0 0 0 10.6 10.6Z" />
          </svg>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        {/* List */}
        <div className="overflow-hidden rounded-2xl border border-sand/60 bg-white/70 lg:col-span-5">
          {filtered.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-ink-soft">No messages in this view.</p>
          ) : (
            <ul className="max-h-[70vh] divide-y divide-sand/50 overflow-y-auto">
              {filtered.map((inquiry) => (
                <li key={inquiry.id}>
                  <button
                    onClick={() => select(inquiry)}
                    className={cn(
                      "flex w-full gap-3 px-4 py-4 text-left transition",
                      selectedId === inquiry.id ? "bg-cream" : "hover:bg-cream/50",
                    )}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-light/70 font-display text-sm text-teal">
                      {initials(inquiry.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium text-ink">{inquiry.name}</span>
                        <span className="shrink-0 text-[10px] text-ink-soft">{formatRelative(inquiry.createdAt)}</span>
                      </span>
                      <span className="mt-0.5 flex items-center gap-2">
                        <span className="truncate text-xs text-ink-soft">{inquiry.subject}</span>
                        {inquiry.status === "new" && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />}
                      </span>
                      <span className="mt-1 block truncate text-[11px] text-ink-soft/70">{inquiry.message}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Detail */}
        <div className="rounded-2xl border border-sand/60 bg-white/70 lg:col-span-7">
          {!selected ? (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center px-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cream-deep">
                <svg className="h-6 w-6 text-ink-soft" fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5v13.5H3.75V5.25Zm0 1.5 8.25 6 8.25-6" />
                </svg>
              </span>
              <p className="mt-4 font-display text-xl text-ink">Select a message</p>
              <p className="mt-1 max-w-xs text-sm text-ink-soft">
                Choose an inquiry on the left to read it, reply and keep notes.
              </p>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <div className="border-b border-sand/60 px-5 py-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={selected.status} />
                      <span className="text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                        {formatRelative(selected.createdAt)}
                      </span>
                    </div>
                    <h2 className="mt-2 font-display text-2xl text-ink">{selected.subject}</h2>
                    <p className="mt-1 text-sm text-ink-soft">
                      {selected.name} ·{" "}
                      <a href={`mailto:${selected.email}`} className="text-teal hover:underline">
                        {selected.email}
                      </a>
                      {selected.phone ? ` · ${selected.phone}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => remove(selected)}
                    className="rounded-lg border border-transparent p-2 text-ink-soft transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                    title="Delete message"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.35 9m-4.78 0L9.26 9m9.97-3.21c.34.05.68.11 1.02.17m-1.02-.17-1.05 13.66a2.25 2.25 0 0 1-2.24 2.08H8.06a2.25 2.25 0 0 1-2.24-2.08L4.77 5.79m14.46 0a48.1 48.1 0 0 0-3.48-.4m-11 0c.34-.06.68-.12 1.02-.17m0 0a48.1 48.1 0 0 1 3.48-.4m7.5 0v-.92c0-1.18-.91-2.16-2.09-2.2a51.9 51.9 0 0 0-3.32 0c-1.18.04-2.09 1.02-2.09 2.2v.92m7.5 0a48.7 48.7 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">{selected.message}</p>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-ink-soft">Move to</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(["read", "replied", "archived", "new"] as InquiryStatus[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => updateStatus(selected, status)}
                        disabled={selected.status === status}
                        className={cn(
                          "rounded-full border px-3.5 py-1.5 text-[10px] uppercase tracking-[0.12em] transition",
                          selected.status === status
                            ? "border-teal bg-teal text-cream"
                            : "border-sand text-ink-soft hover:border-teal hover:text-teal",
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-ink-soft">Private notes</p>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={3}
                    placeholder="Anything to remember before replying…"
                    className="mt-2 w-full rounded-xl border border-sand bg-cream/60 px-3.5 py-2.5 text-sm outline-none focus:border-teal"
                  />
                  <button
                    onClick={saveNotes}
                    disabled={savingNotes}
                    className="mt-2 rounded-full border border-sand px-4 py-1.5 text-[10px] uppercase tracking-[0.12em] text-ink transition hover:border-teal hover:text-teal disabled:opacity-60"
                  >
                    {savingNotes ? "Saving…" : "Save note"}
                  </button>
                </div>
              </div>

              <div className="border-t border-sand/60 px-5 py-4">
                <a
                  href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`}
                  className="inline-flex w-full items-center justify-center rounded-full bg-teal px-6 py-3 text-[11px] uppercase tracking-[0.16em] text-cream transition hover:bg-ink"
                >
                  Reply by email
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[90] rounded-full bg-ink px-5 py-3 text-sm text-cream shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
