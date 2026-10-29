"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { ResourceConfig, FieldConfig } from "@/lib/resource-config";
import { cn, formatDateShort, formatPrice, safeImage } from "@/lib/utils";
import { StatusBadge } from "./ui";

type Item = Record<string, unknown> & { id: string; slug: string; createdAt?: string };

function formatMeta(value: unknown, format?: string): string {
  if (value === undefined || value === null || value === "") return "—";
  if (format === "price" && typeof value === "number") return formatPrice(value);
  if (format === "date" && typeof value === "string") return formatDateShort(value);
  return String(value);
}

export default function ResourceManager({
  config,
  initialItems,
}: {
  config: ResourceConfig;
  initialItems: Item[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>(initialItems);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<Item | "new" | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<Item | null>(null);
  const [toast, setToast] = useState("");

  const filtered = useMemo(() => {
    let list = items;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((item) =>
        config.searchKeys.some((key) => String(item[key] ?? "").toLowerCase().includes(q)),
      );
    }
    if (filter !== "all" && config.filterKey) {
      list = list.filter((item) => String(item[config.filterKey!]) === filter);
    }
    return list;
  }, [items, query, filter, config]);

  function openNew() {
    setForm({ ...config.defaults });
    setError("");
    setEditing("new");
  }

  function openEdit(item: Item) {
    const next: Record<string, unknown> = {};
    for (const field of config.fields) {
      const value = item[field.name];
      if (field.type === "tags") {
        next[field.name] = Array.isArray(value) ? value.join(", ") : String(value ?? "");
      } else if (field.type === "date" && typeof value === "string") {
        next[field.name] = value.slice(0, 10);
      } else {
        next[field.name] = value ?? "";
      }
    }
    setForm(next);
    setError("");
    setEditing(item);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload: Record<string, unknown> = {};
    for (const field of config.fields) {
      let value = form[field.name];
      if (field.type === "number") value = value === "" || value === undefined ? 0 : Number(value);
      if (field.type === "checkbox") value = Boolean(value);
      if (field.type === "tags") {
        value = String(value ?? "")
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean);
      }
      if (field.name === "compareAtPrice" && (value === 0 || value === "" || value === undefined)) {
        value = undefined;
      }
      payload[field.name] = value;
    }

    try {
      const isNew = editing === "new";
      const url = isNew ? `/api/${config.key}` : `/api/${config.key}/${(editing as Item).id}`;
      const response = await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Request failed");
      const saved = (await response.json()) as Item;

      setItems((current) =>
        isNew ? [saved, ...current] : current.map((item) => (item.id === saved.id ? saved : item)),
      );
      setEditing(null);
      setToast(isNew ? `${config.singular} created` : `${config.singular} updated`);
      window.setTimeout(() => setToast(""), 3000);
      router.refresh();
    } catch {
      setError("Could not save. Please check the fields and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!deleting) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/${config.key}/${deleting.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("failed");
      setItems((current) => current.filter((item) => item.id !== deleting.id));
      setDeleting(null);
      setToast(`${config.singular} deleted`);
      window.setTimeout(() => setToast(""), 3000);
      router.refresh();
    } catch {
      setError("Could not delete this item.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-sand/60 bg-white/60 p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${config.plural.toLowerCase()}…`}
            className="w-full rounded-xl border border-transparent bg-transparent py-2 pl-9 pr-3 text-sm outline-none placeholder:text-ink-soft/60 focus:border-sand"
          />
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.2-5.2m0 0A7.5 7.5 0 1 0 5.2 5.2a7.5 7.5 0 0 0 10.6 10.6Z" />
          </svg>
        </div>
        {config.filterKey && config.filterOptions && (
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="rounded-xl border border-sand/70 bg-white/70 px-3 py-2 text-sm outline-none focus:border-teal"
          >
            <option value="all">All {config.filterKey === "status" ? "statuses" : "categories"}</option>
            {config.filterOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={openNew}
          className="rounded-xl bg-teal px-4 py-2.5 text-[11px] uppercase tracking-[0.14em] text-cream transition hover:bg-ink"
        >
          + New {config.singular}
        </button>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-sand/60 bg-white/70">
        <div className="hidden grid-cols-12 gap-4 border-b border-sand/60 px-5 py-3 text-[10px] uppercase tracking-[0.16em] text-ink-soft md:grid">
          <span className="col-span-6">Item</span>
          <span className="col-span-2">Status</span>
          {config.meta.map((meta) => (
            <span key={meta.key} className="col-span-1">
              {meta.label}
            </span>
          ))}
          <span className="col-span-2 text-right">Actions</span>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="font-display text-xl text-ink">Nothing here yet</p>
            <p className="mt-1 text-sm text-ink-soft">
              {query || filter !== "all"
                ? "No matches for these filters."
                : `Create your first ${config.singular} to see it on the website.`}
            </p>
            <button onClick={openNew} className="mt-4 rounded-full bg-teal px-5 py-2.5 text-[11px] uppercase tracking-[0.14em] text-cream">
              + New {config.singular}
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-sand/50">
            {filtered.map((item) => {
              const title = String(item[config.titleKey] ?? "Untitled");
              const subtitle = config.subtitleKey ? String(item[config.subtitleKey] ?? "") : "";
              const rawImage = config.imageKey ? String(item[config.imageKey] ?? "") : "";
              const image = rawImage ? safeImage(rawImage) : "";
              const status = config.statusKey ? String(item[config.statusKey] ?? "") : "";
              return (
                <li key={item.id} className="grid grid-cols-1 gap-4 px-4 py-4 transition hover:bg-cream/40 md:grid-cols-12 md:items-center md:px-5">
                  <div className="col-span-6 flex min-w-0 items-center gap-3">
                    {image ? (
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-cream-deep">
                        <Image src={image} alt="" fill sizes="48px" className="object-cover" />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cream-deep font-display text-ink-soft">
                        {title.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{title}</p>
                      <p className="truncate text-xs text-ink-soft">{subtitle}</p>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center gap-2">
                    {status ? <StatusBadge status={status} /> : <span className="text-xs text-ink-soft">—</span>}
                    {config.key === "products" && Number(item.stock) <= 10 && (
                      <StatusBadge status={Number(item.stock) === 0 ? "out" : "low"} />
                    )}
                  </div>

                  {config.meta.map((meta) => (
                    <div key={meta.key} className="col-span-1 flex items-center gap-2 text-sm text-ink-soft md:block">
                      <span className="text-[10px] uppercase tracking-[0.14em] text-ink-soft/60 md:hidden">
                        {meta.label}
                      </span>
                      <span className="text-ink">{formatMeta(item[meta.key], meta.format)}</span>
                    </div>
                  ))}

                  <div className="col-span-2 flex items-center gap-2 md:justify-end">
                    {config.publicBase && (
                      <Link
                        href={config.detailPage === false ? config.publicBase : `${config.publicBase}/${item.slug}`}
                        target="_blank"
                        title="View on website"
                        className="rounded-lg border border-sand/70 p-2 text-ink-soft transition hover:border-teal hover:text-teal"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H17.25m0 0v3.75M17.25 6l-4.5 4.5M10.5 18H6.75m0 0v-3.75M6.75 18l4.5-4.5" />
                        </svg>
                      </Link>
                    )}
                    <button
                      onClick={() => openEdit(item)}
                      className="rounded-lg border border-sand/70 px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-ink transition hover:border-teal hover:text-teal"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleting(item)}
                      className="rounded-lg border border-transparent p-2 text-ink-soft transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                      title="Delete"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.35 9m-4.78 0L9.26 9m9.97-3.21c.34.05.68.11 1.02.17m-1.02-.17-1.05 13.66a2.25 2.25 0 0 1-2.24 2.08H8.06a2.25 2.25 0 0 1-2.24-2.08L4.77 5.79m14.46 0a48.1 48.1 0 0 0-3.48-.4m-11 0c.34-.06.68-.12 1.02-.17m0 0a48.1 48.1 0 0 1 3.48-.4m7.5 0v-.92c0-1.18-.91-2.16-2.09-2.2a51.9 51.9 0 0 0-3.32 0c-1.18.04-2.09 1.02-2.09 2.2v.92m7.5 0a48.7 48.7 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <p className="mt-3 text-[11px] text-ink-soft">
        Showing {filtered.length} of {items.length} {config.plural.toLowerCase()}
      </p>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[90] rounded-full bg-ink px-5 py-3 text-sm text-cream shadow-xl">
          {toast}
        </div>
      )}

      {/* Editor modal */}
      {editing && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto p-4 sm:p-8">
          <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative z-10 my-4 w-full max-w-3xl overflow-hidden rounded-[1.75rem] bg-cream shadow-2xl">
            <div className="flex items-start justify-between border-b border-sand/70 px-6 py-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-gold">
                  {editing === "new" ? "Create" : "Edit"}
                </p>
                <h2 className="mt-1 font-display text-2xl text-ink">
                  {editing === "new" ? `New ${config.singular}` : String((editing as Item)[config.titleKey])}
                </h2>
              </div>
              <button onClick={() => setEditing(null)} className="p-1 text-ink-soft hover:text-ink" aria-label="Close">
                ✕
              </button>
            </div>

            <form onSubmit={save}>
              <div className="grid max-h-[65vh] gap-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
                {config.fields.map((field) => (
                  <FieldInput
                    key={field.name}
                    field={field}
                    value={form[field.name]}
                    onChange={(value) => setForm((current) => ({ ...current, [field.name]: value }))}
                  />
                ))}
              </div>
              {error && <p className="px-6 text-xs text-rose-600">{error}</p>}
              <div className="flex flex-col-reverse gap-3 border-t border-sand/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="text-[11px] uppercase tracking-[0.14em] text-ink-soft hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-teal px-7 py-3 text-[11px] uppercase tracking-[0.16em] text-cream transition hover:bg-ink disabled:opacity-60"
                >
                  {saving ? "Saving…" : editing === "new" ? `Create ${config.singular}` : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {deleting && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setDeleting(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-[1.5rem] bg-cream p-6 shadow-2xl">
            <p className="font-display text-2xl text-ink">Delete this {config.singular}?</p>
            <p className="mt-2 text-sm text-ink-soft">
              “{String(deleting[config.titleKey])}” will be removed from the website. This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleting(null)} className="px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-ink-soft">
                Keep it
              </button>
              <button
                onClick={remove}
                disabled={saving}
                className="rounded-full bg-rose-600 px-5 py-2.5 text-[11px] uppercase tracking-[0.14em] text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {saving ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const base =
    "w-full rounded-xl border border-sand bg-white/70 px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-soft/50 focus:border-teal focus:bg-white";

  return (
    <div className={cn(field.full && "sm:col-span-2")}>
      <label className="mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-ink-soft">
        <span>
          {field.label}
          {field.required && <span className="text-gold"> *</span>}
        </span>
        {field.help && <span className="hidden text-[9px] normal-case tracking-normal text-ink-soft/60 sm:inline">{field.help}</span>}
      </label>

      {field.type === "textarea" ? (
        <textarea
          required={field.required}
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          rows={field.name === "content" || field.name === "longDescription" || field.name === "details" ? 9 : 3}
          placeholder={field.placeholder}
          className={cn(base, "resize-y leading-relaxed")}
        />
      ) : field.type === "select" ? (
        <select
          required={field.required}
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          className={base}
        >
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : field.type === "checkbox" ? (
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-sand bg-white/60 px-3.5 py-2.5">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => onChange(event.target.checked)}
            className="h-4 w-4 accent-teal"
          />
          <span className="text-sm text-ink-soft">Yes, show this prominently</span>
        </label>
      ) : field.type === "image" ? (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {field.options?.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onChange(option)}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-lg border-2 transition",
                  value === option ? "border-teal ring-2 ring-teal/20" : "border-transparent hover:border-sand",
                )}
              >
                <Image src={option} alt="" fill sizes="100px" className="object-cover" />
              </button>
            ))}
          </div>
          <input
            value={String(value ?? "")}
            onChange={(event) => onChange(event.target.value)}
            placeholder="/images/your-image.webp"
            className={base}
          />
        </div>
      ) : field.type === "tags" ? (
        <input
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Deep rest, Better sleep, Release of tension"
          className={base}
        />
      ) : (
        <input
          type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
          required={field.required}
          min={field.min}
          max={field.max}
          step={field.step}
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          className={base}
        />
      )}
    </div>
  );
}
