"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Treatments", href: "/treatments" },
  { name: "Store", href: "/store" },
  { name: "Journal", href: "/blog" },
  { name: "Our Approach", href: "/approach" },
  { name: "Workshops", href: "/workshops" },
  { name: "Stories", href: "/stories" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { count, openCart } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-sand/60 bg-cream/90 backdrop-blur-md"
          : "border-b border-transparent bg-cream",
      )}
    >
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8" aria-label="Main">
        <Link href="/" className="group flex items-center gap-3">
          <span className="relative h-11 w-11 overflow-hidden rounded-full ring-1 ring-sand/80">
            <Image src="/logo.jpg" alt="Shelley's" fill sizes="44px" className="object-cover" priority />
          </span>
          <span className="leading-none">
            <span className="block font-display text-2xl tracking-wide text-ink">Shelley&apos;s</span>
            <span className="mt-1 block text-[9px] uppercase tracking-[0.34em] text-ink-soft">
              Skin &amp; Body Studio
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {navigation.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative text-[12px] uppercase tracking-[0.16em] transition-colors",
                  active ? "text-ink" : "text-ink-soft hover:text-ink",
                )}
              >
                {item.name}
                <span
                  className={cn(
                    "absolute -bottom-1.5 left-0 h-px bg-gold transition-all duration-300",
                    active ? "w-full" : "w-0",
                  )}
                />
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            title="Management dashboard"
            className="hidden rounded-full p-2 text-ink-soft transition hover:bg-cream-deep hover:text-ink sm:block"
          >
            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
            </svg>
          </Link>
          <button
            onClick={openCart}
            className="relative rounded-full p-2 text-ink-soft transition hover:bg-cream-deep hover:text-ink"
            aria-label="Open shopping bag"
          >
            <svg className="h-[19px] w-[19px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-ink">
                {count}
              </span>
            )}
          </button>
          <Link
            href="/contact"
            className="hidden rounded-full bg-teal px-6 py-2.5 text-[12px] uppercase tracking-[0.14em] text-cream transition hover:bg-ink md:inline-flex"
          >
            Book a visit
          </Link>
          <button
            type="button"
            className="-mr-2 p-2 text-ink lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 7.5h16.5M3.75 12h16.5m-16.5 4.5h16.5" />
            </svg>
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[70] animate-fade-up bg-cream lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="flex h-20 items-center justify-between px-5">
            <span className="font-display text-2xl">Shelley&apos;s</span>
            <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" className="p-2">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col gap-1 px-5 pt-6">
            {[{ name: "Home", href: "/" }, ...navigation, { name: "Contact", href: "/contact" }].map(
              (item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="animate-fade-up border-b border-sand/60 py-4 font-display text-3xl text-ink"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  {item.name}
                </Link>
              ),
            )}
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-6 text-sm uppercase tracking-[0.16em] text-ink-soft"
            >
              Management dashboard →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
