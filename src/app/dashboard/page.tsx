import Link from "next/link";
import Image from "next/image";
import { readDb } from "@/lib/db";
import { formatDateShort, formatPrice, formatRelative, initials, safeImage } from "@/lib/utils";
import { StatCard, StatusBadge } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export const metadata = { title: "Overview | Dashboard" };

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

export default async function DashboardPage() {
  const db = await readDb();

  const weekly = buildWeeklySeries(db.inquiries);
  const maxWeekly = Math.max(1, ...weekly.map((week) => week.count));

  const newInquiries = db.inquiries.filter((inquiry) => inquiry.status === "new");
  const recentInquiries = [...db.inquiries]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  const lowStock = db.products.filter((product) => product.stock <= 10);
  const inventoryValue = db.products.reduce((sum, product) => sum + product.stock * product.price, 0);
  const publishedBlogs = db.blogs.filter((blog) => blog.status === "published");
  const drafts = db.blogs.filter((blog) => blog.status === "draft");
  const nextEvent = db.events
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
          hint={`${db.inquiries.length} total messages`}
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
          value={String(db.products.filter((product) => product.status === "active").length)}
          hint={`${db.products.reduce((sum, product) => sum + product.stock, 0)} units in stock`}
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
            {db.blogs.slice(0, 4).map((blog) => (
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
