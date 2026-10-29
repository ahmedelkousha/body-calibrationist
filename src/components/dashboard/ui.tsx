import Link from "next/link";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { label: string; href?: string; onClick?: () => void };
}) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="text-[10px] uppercase tracking-[0.28em] text-gold">{eyebrow}</p>}
        <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">{description}</p>}
      </div>
      {action &&
        (action.href ? (
          <Link
            href={action.href}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-teal px-5 py-2.5 text-[11px] uppercase tracking-[0.16em] text-cream transition hover:bg-ink"
          >
            {action.label}
          </Link>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-teal px-5 py-2.5 text-[11px] uppercase tracking-[0.16em] text-cream">
            {action.label}
          </span>
        ))}
    </div>
  );
}

const toneMap: Record<string, string> = {
  new: "bg-sky-light text-teal",
  read: "bg-cream-deep text-ink-soft",
  replied: "bg-emerald-100 text-emerald-800",
  archived: "bg-stone-200 text-stone-600",
  published: "bg-emerald-100 text-emerald-800",
  active: "bg-emerald-100 text-emerald-800",
  upcoming: "bg-sky-light text-teal",
  draft: "bg-amber-100 text-amber-800",
  "sold-out": "bg-rose-100 text-rose-700",
  past: "bg-stone-200 text-stone-600",
  low: "bg-amber-100 text-amber-800",
  out: "bg-rose-100 text-rose-700",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em]",
        toneMap[status.toLowerCase()] ?? "bg-cream-deep text-ink-soft",
        className,
      )}
    >
      {status.replace("-", " ")}
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "cream",
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "cream" | "teal" | "sky" | "gold";
  href?: string;
}) {
  const tones = {
    cream: "bg-white/70 border-sand/60 text-ink",
    teal: "bg-teal border-teal text-cream",
    sky: "bg-sky-light/70 border-sky/40 text-ink",
    gold: "bg-gold-light/50 border-gold/40 text-ink",
  };
  const muted = tone === "teal" ? "text-cream/60" : "text-ink-soft";

  const content = (
    <div className={cn("rounded-2xl border p-5 transition", tones[tone], href && "hover:-translate-y-0.5 hover:shadow-md")}>
      <p className={cn("text-[10px] uppercase tracking-[0.2em]", muted)}>{label}</p>
      <p className="mt-3 font-display text-4xl leading-none">{value}</p>
      {hint && <p className={cn("mt-2 text-[11px]", muted)}>{hint}</p>}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-sand bg-white/40 px-6 py-16 text-center">
      <p className="font-display text-2xl text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
