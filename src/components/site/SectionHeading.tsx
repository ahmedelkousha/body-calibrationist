import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center sm:text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && (
          <p className="mb-3 flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-gold">
            <span className="h-px w-8 bg-gold/70" />
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-4xl leading-[1.1] text-ink sm:text-5xl">{title}</h2>
        {description && <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">{description}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex shrink-0 items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-ink transition hover:text-teal"
        >
          {action.label}
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      )}
    </div>
  );
}
