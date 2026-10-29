import Link from "next/link";
import Image from "next/image";
import NewsletterForm from "@/components/site/NewsletterForm";

const columns = [
  {
    title: "Visit",
    links: [
      { name: "Treatments & Services", href: "/treatments" },
      { name: "Store", href: "/store" },
      { name: "Workshops & Events", href: "/workshops" },
      { name: "Transformation Stories", href: "/stories" },
    ],
  },
  {
    title: "Read",
    links: [
      { name: "Journal", href: "/blog" },
      { name: "Our Approach", href: "/approach" },
      { name: "Reach Us", href: "/contact" },
      { name: "Dashboard", href: "/dashboard" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-sand/60 bg-teal text-cream">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <span className="relative h-12 w-12 overflow-hidden rounded-full ring-1 ring-cream/30">
                <Image src="/logo.jpg" alt="Shelley's" fill sizes="48px" className="object-cover" />
              </span>
              <div>
                <p className="font-display text-3xl">Shelley&apos;s</p>
                <p className="text-[9px] uppercase tracking-[0.34em] text-cream/60">Skin &amp; Body Studio</p>
              </div>
            </div>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-cream/70">
              A small studio for unhurried care — holistic massage, bespoke facials and advanced skin
              therapy, with products made in small batches.
            </p>
            <div className="mt-6 space-y-1 text-sm text-cream/70">
              <p>14 Marine Parade, Studio 2</p>
              <p>Tue – Sat, 9am – 6pm</p>
              <a href="mailto:hello@shelleys.studio" className="underline decoration-cream/30 underline-offset-4 hover:text-cream">
                hello@shelleys.studio
              </a>
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title} className="md:col-span-2">
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-cream/50">{column.title}</h3>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-cream/80 transition hover:text-cream">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="md:col-span-3">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-cream/50">The quiet letter</h3>
            <p className="mt-5 text-sm text-cream/70">
              A short note once a month: what is in season, what is new in the studio, and one thing worth
              slowing down for.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-cream/15 pt-6 text-xs text-cream/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Shelley&apos;s Skin &amp; Body Studio. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <span>Payments by Stripe · Apple Pay accepted</span>
            <Link href="/dashboard" className="hover:text-cream">Studio login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
