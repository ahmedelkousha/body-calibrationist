"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/login/actions";

export type SidebarUser = {
  email: string | null;
  name: string | null;
};

const navigation = [
  { name: "Overview", href: "/dashboard", icon: "M3.75 12 12 3.75 20.25 12M5.25 10.5V20.25h5.25v-5.25h3v5.25h5.25V10.5" },
  { name: "Blog", href: "/dashboard/blogs", icon: "M4.5 5.25h15M4.5 9.75h9.75M4.5 14.25h15M4.5 18.75h9.75" },
  { name: "Products", href: "/dashboard/products", icon: "M3.75 7.5 12 3l8.25 4.5v9L12 21l-8.25-4.5v-9Zm0 0L12 12m8.25-4.5L12 12m0 9v-9" },
  { name: "Inquiries", href: "/dashboard/inquiries", icon: "M3.75 5.25h16.5v13.5H3.75V5.25Zm0 1.5 8.25 6 8.25-6" },
  { name: "Services", href: "/dashboard/services", icon: "M12 3.75v16.5M3.75 12h16.5" },
  { name: "Events", href: "/dashboard/events", icon: "M6.75 3.75v3M17.25 3.75v3M3.75 8.25h16.5m-16.5 0v11.25h16.5V8.25M8.25 12.75h3v3h-3v-3Z" },
  { name: "Stories", href: "/dashboard/stories", icon: "M12 3.75l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17.15 6.8 19.85l1-5.8-4.3-4.1 5.9-.9L12 3.75Z" },
];

const secondary = [
  { name: "View website", href: "/", icon: "M13.5 6H17.25m0 0v3.75M17.25 6l-4.5 4.5M10.5 18H6.75m0 0v-3.75M6.75 18l4.5-4.5" },
  { name: "Settings", href: "/dashboard/settings", icon: "M10.5 3.75h3l.4 2.2 2 .8 2-1.1 2.1 2.1-1.1 2 .8 2 2.2.4v3l-2.2.4-.8 2 1.1 2-2.1 2.1-2-1.1-2 .8-.4 2.2h-3l-.4-2.2-2-.8-2 1.1-2.1-2.1 1.1-2-.8-2-2.2-.4v-3l2.2-.4.8-2-1.1-2 2.1-2.1 2 1.1 2-.8.4-2.2Z" },
];

export default function Sidebar({
  newInquiries = 0,
  user,
}: {
  newInquiries?: number;
  user: SidebarUser;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const displayName = user.name || user.email?.split("@")[0] || "Studio";
  const initial = (displayName[0] || "S").toUpperCase();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-full bg-teal p-2.5 text-cream shadow-lg lg:hidden"
        aria-label="Open dashboard menu"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-teal text-cream transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-cream/10 px-6 py-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="relative h-10 w-10 overflow-hidden rounded-full ring-1 ring-cream/25">
              <Image src="/logo.jpg" alt="Shelley's" fill sizes="40px" className="object-cover" />
            </span>
            <span>
              <span className="block font-display text-xl leading-none">Shelley&apos;s</span>
              <span className="mt-1 block text-[8px] uppercase tracking-[0.28em] text-cream/50">Studio manager</span>
            </span>
          </Link>
          <button onClick={() => setOpen(false)} className="p-1 text-cream/60 lg:hidden" aria-label="Close menu">
            ✕
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="px-3 pb-2 text-[9px] uppercase tracking-[0.28em] text-cream/40">Manage</p>
          <ul className="space-y-1">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                      active
                        ? "bg-cream text-teal shadow-sm"
                        : "text-cream/70 hover:bg-cream/10 hover:text-cream",
                    )}
                  >
                    <svg className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    <span className="flex-1">{item.name}</span>
                    {item.name === "Inquiries" && newInquiries > 0 && (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium",
                          active ? "bg-teal text-cream" : "bg-gold text-ink",
                        )}
                      >
                        {newInquiries}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <p className="mt-7 px-3 pb-2 text-[9px] uppercase tracking-[0.28em] text-cream/40">Studio</p>
          <ul className="space-y-1">
            {secondary.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-cream/70 transition hover:bg-cream/10 hover:text-cream"
                >
                  <svg className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-cream/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream/15 font-display text-sm uppercase">
              {initial}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm capitalize text-cream">{displayName}</p>
              <p className="truncate text-[10px] text-cream/50">{user.email || "Signed in"}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <Link
              href="/"
              className="text-[10px] uppercase tracking-[0.14em] text-cream/50 transition hover:text-cream"
            >
              View site
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-full border border-cream/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-cream/70 transition hover:border-cream/50 hover:text-cream"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
