export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const FALLBACK_IMAGE = "/images/hero.webp";

/** Keeps user-entered image paths safe for next/image. */
export function safeImage(src: unknown, fallback = FALLBACK_IMAGE): string {
  if (typeof src !== "string") return fallback;
  const trimmed = src.trim();
  if (trimmed.startsWith("/") || trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    return trimmed;
  }
  return fallback;
}

export function formatPrice(value: number): string {
  if (value === 0) return "Free";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateShort(value: string): string {
  return new Date(value).toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatRelative(value: string): string {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDateShort(value);
}

export function timeAgoLabel(value: string): string {
  return formatRelative(value);
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
