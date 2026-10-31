"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { Database } from "@/lib/types";
import { readAllContent } from "@/lib/firebase/data";
import { formatDateShort, formatPrice, formatRelative, initials, safeImage } from "@/lib/utils";
import { StatCard, StatusBadge } from "./ui";

function buildWeeklySeries(inquiries: { createdAt: string }[]) {
  const now = Date.now();
  return Array.from({ length: 6 }).map((_, index) => {
    const start = new Date(now - (5 - index) * 7 * 86400000);
    const end = new Date(now - (4 - index) * 7 * 86400000);
    const count = inquiries.filter((inquiry) => {
      const created = new Date(inquiry.createdAt).getTime();
      return created >= start.getTime() && created < end.getTime();
    }).length;
    return {
      label: start.toLocaleDateString("en-AU", { day: "numeric", month: "short" }),
      count,
    };
  });
}

export default function DashboardOverview() {
  const [data, setData] = useState<Database | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    readAllContent()
      .then((database) => {
        if (!cancelled) setData(database);
      })
      .catch(() => {
        if (!cancelled) {
          setError(
            "Could not load the studio data. Check that you are signed in and that firestore.rules is deployed.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-10 text-center">
        <p className="font-display text-2xl text-ink">The dashboard is signed in, but Firestore refused the read.</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
        <span className="h-1 w-32 overflow-hidden rounded-full bg-sand/70">
          <span className="block h-full w-1/2 animate-pulse rounded-full bg-teal/60" />
        </span>
        <p className="mt-4 text-[10px] uppercase tracking-[0.24em] text-ink-soft">Reading the studio…</p>
      </div>
    );
  }

  const weekly = buildWeeklySeries(data.inquiries);
  const maxWeekly = Math.max(1, ...weekly.map((week) => week.count));

  const newInquiries = data.inquiries.filter((inquiry) => inquiry.status === "new");
  const recentInquiries = [...data.inquiries]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  const lowStock = data.products.filter((product) => product.stock <= 10);
  const inventoryValue = data.products.reduce((sum, product) => sum + product.stock * product.price, 0);
  const publishedBlogs = data.blogs.filter((blog) => blog.status === "published");
  const drafts = data.blogs.filter((blog) => blog.status === "draft");
  const nextEvent = data.events
    .filter((event) => event.status === "upcoming")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-gold">Studio overview</p>
          <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">Good to see you, Shelley.</h1>
          <p className="mt-2 text-sm text-ink-soft">
            {newInquiries.length > 0
              ? `${newInquiries.length} new ${newInquiries.length === 1 ? "message" : "messages"} waiting, and ${publishedBlogs.length} articles live.`
              : "Everything is answered. The studio is quiet today."}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/blogs"
            className="rounded-full border border-sand bg-white/60 px-4 py-2.5 text-[11px] uppercase tracking-[0.14em] text-ink transition hover:border-teal hover:text-teal"
          >
            Write an article
          </Link>
          <Link
            href="/dashboard/products"
            className="rounded-full bg-teal px-4 py-2.5 text-[11px] uppercase tracking-[0.14em] text-cream transition hover:bg-ink"
          >
            Add a product
          </Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="New inquiries"
          value={String(newInquiries.length)}
          hint={`${data.inquiries.length} total messages`}
          tone="teal"
          href="/dashboard/inquiries"
        />
        <StatCard
          label="Published articles"
          value={String(publishedBlogs.length)}
          hint={`${drafts.length} draft${drafts.length === 1 ? "" : "s"} waiting`}
          href="/dashboard/blogs"
        />
        <StatCard
          label="Live products"
          value={String(data.products.filter((product) => product.status === "active").length)}
          hint={`${data.products.reduce((sum, product) => sum + product.stock, 0)} units in stock`}
          href="/dashboard/products"
        />
        <StatCard
          label="Inventory value"
          value={formatPrice(inventoryValue)}
          hint={`${lowStock.length} low-stock item${lowStock.length === 1 ? "" : "s"}`}
          tone="gold"
          href="/dashboard/products"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        {/* Chart */}
        <section className="rounded-2xl border border-sand/60 bg-white/70 p-5 lg:col-span-7">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl text-ink">Inquiry volume</h2>
              <p className="text-[11px] text-ink-soft">Last six weeks, from the website forms</p>
            </div>
            <span className="rounded-full bg-cream-deep px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-ink-soft">
              {weekly.reduce((sum, week) => sum + week.count, 0)} total
            </span>
          </div>
          <div className="mt-6 flex h-44 items-end gap-3">
            {weekly.map((week) => (
              <div key={week.label} className="group flex flex-1 flex-col items-center gap-2">
                <span className="text-[10px] text-ink-soft opacity-0 transition group-hover:opacity-100">
                  {week.count}
                </span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-teal/70 to-sky/70 transition-all duration-500 hover:from-teal hover:to-sky"
                  style={{ height: `${Math.max(6, (week.count / maxWeekly) * 130)}px` }}
                />
                <span className="text-[10px] text-ink-soft">{week.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Attention */}
        <section className="rounded-2xl border border-sand/60 bg-white/70 p-5 lg:col-span-5">
          <h2 className="font-display text-xl text-ink">Needs your attention</h2>
          <div className="mt-4 space-y-3">
            <Link
              href="/dashboard/inquiries"
              className="flex items-start gap-3 rounded-xl border border-sand/60 bg-cream/50 p-3 transition hover:border-teal/30"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-light text-sm text-teal">
                {newInquiries.length}
              </span>
              <span>
                <span className="block text-sm text-ink">{newInquiries.length} unread messages</span>
                <span className="block text-[11px] text-ink-soft">Reply within one business day</span>
              </span>
            </Link>

            {lowStock.length > 0 && (
              <Link
                href="/dashboard/products"
                className="flex items-start gap-3 rounded-xl border border-sand/60 bg-cream/50 p-3 transition hover:border-teal/30"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-light/70 text-sm text-ink">
                  {lowStock.length}
                </span>
                <span>
                  <span className="block text-sm text-ink">Low stock</span>
                  <span className="block text-[11px] text-ink-soft">
                    {lowStock.map((product) => product.name).slice(0, 2).join(", ")}
                    {lowStock.length > 2 ? ` +${lowStock.length - 2} more` : ""}
                  </span>
                </span>
              </Link>
            )}

            {drafts.length > 0 && (
              <Link
                href="/dashboard/blogs"
                className="flex items-start gap-3 rounded-xl border border-sand/60 bg-cream/50 p-3 transition hover:border-teal/30"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-deep text-sm text-ink-soft">
                  {drafts.length}
                </span>
                <span>
                  <span className="block text-sm text-ink">Draft articles</span>
                  <span className="block truncate text-[11px] text-ink-soft">{drafts[0]?.title}</span>
                </span>
              </Link>
            )}

            {nextEvent && (
              <Link
                href="/dashboard/events"
                className="flex items-start gap-3 rounded-xl border border-sand/60 bg-cream/50 p-3 transition hover:border-teal/30"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal/10 text-sm text-teal">
                  {nextEvent.capacity - nextEvent.booked}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm text-ink">{nextEvent.title}</span>
                  <span className="block text-[11px] text-ink-soft">
                    {formatDateShort(nextEvent.date)} · {nextEvent.booked}/{nextEvent.capacity} booked
                  </span>
                </span>
              </Link>
            )}
          </div>
        </section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        {/* Recent inquiries */}
        <section className="overflow-hidden rounded-2xl border border-sand/60 bg-white/70 lg:col-span-7">
          <div className="flex items-center justify-between border-b border-sand/60 px-5 py-4">
            <h2 className="font-display text-xl text-ink">Latest messages</h2>
            <Link href="/dashboard/inquiries" className="text-[10px] uppercase tracking-[0.14em] text-teal">
              View all →
            </Link>
          </div>
          <ul className="divide-y divide-sand/50">
            {recentInquiries.map((inquiry) => (
              <li key={inquiry.id}>
                <Link
                  href="/dashboard/inquiries"
                  className="flex items-start gap-3 px-5 py-3.5 transition hover:bg-cream/50"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-light/70 font-display text-xs text-teal">
                    {initials(inquiry.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm text-ink">{inquiry.name}</span>
                      <span className="shrink-0 text-[10px] text-ink-soft">{formatRelative(inquiry.createdAt)}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-ink-soft">
                      {inquiry.subject} — {inquiry.message}
                    </span>
                  </span>
                  <StatusBadge status={inquiry.status} className="shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Journal */}
        <section className="overflow-hidden rounded-2xl border border-sand/60 bg-white/70 lg:col-span-5">
          <div className="flex items-center justify-between border-b border-sand/60 px-5 py-4">
            <h2 className="font-display text-xl text-ink">The journal</h2>
            <Link href="/dashboard/blogs" className="text-[10px] uppercase tracking-[0.14em] text-teal">
              Manage →
            </Link>
          </div>
          <ul className="divide-y divide-sand/50">
            {data.blogs.slice(0, 4).map((blog) => (
              <li key={blog.id} className="flex items-center gap-3 px-5 py-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-cream-deep">
                  <Image src={safeImage(blog.image, "/images/blog-1.webp")} alt="" fill sizes="40px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink">{blog.title}</p>
                  <p className="text-[10px] text-ink-soft">
                    {formatDateShort(blog.publishedAt)} · {blog.readMinutes} min
                  </p>
                </div>
                <StatusBadge status={blog.status} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <p className="mt-8 text-center text-[10px] uppercase tracking-[0.2em] text-ink-soft/60">
        Shelley&apos;s Studio Manager · live data in Cloud Firestore
      </p>
    </>
  );
}
