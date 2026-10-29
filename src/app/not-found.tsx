import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      <p className="text-[10px] uppercase tracking-[0.32em] text-gold">404</p>
      <h1 className="mt-5 font-display text-5xl text-ink sm:text-6xl">This page has wandered off.</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
        The link may be old, or the page may have moved. Everything else is exactly where you left it.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="rounded-full bg-teal px-7 py-3 text-[11px] uppercase tracking-[0.18em] text-cream hover:bg-ink">
          Back home
        </Link>
        <Link href="/treatments" className="rounded-full border border-sand px-7 py-3 text-[11px] uppercase tracking-[0.18em] text-ink hover:border-teal hover:text-teal">
          Browse treatments
        </Link>
      </div>
    </div>
  );
}
