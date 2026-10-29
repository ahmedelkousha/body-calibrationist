import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { readDb } from "@/lib/db";
import { formatDate, safeImage } from "@/lib/utils";
import BlogExplorer from "@/components/site/BlogExplorer";
import Reveal from "@/components/site/Reveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Journal",
  description:
    "Practical notes on skin, rest and slow care from the treatment room at Shelley's studio.",
};

export default async function BlogPage() {
  const db = await readDb();
  const published = db.blogs
    .filter((post) => post.status === "published")
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  const [lead, ...rest] = published;

  return (
    <>
      <section className="border-b border-sand/60 bg-cream-deep/40">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <p className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-gold">
            <span className="h-px w-10 bg-gold/70" />
            The journal
          </p>
          <div className="mt-6 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <h1 className="max-w-2xl font-display text-5xl leading-[1.02] text-ink sm:text-6xl">
              Notes from the treatment room.
            </h1>
            <p className="max-w-sm text-[15px] leading-relaxed text-ink-soft">
              What seems to help, what does not, and the small rituals worth keeping. Written between
              appointments, with no miracle claims.
            </p>
          </div>
        </div>
      </section>

      {lead && (
        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <Reveal>
            <Link
              href={`/blog/${lead.slug}`}
              className="group grid overflow-hidden rounded-[2.5rem] border border-sand/60 bg-white/50 lg:grid-cols-2"
            >
              <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[420px]">
                <Image
                  src={safeImage(lead.image, "/images/blog-1.webp")}
                  alt={lead.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col justify-center p-8 sm:p-12">
                <p className="text-[10px] uppercase tracking-[0.28em] text-gold">
                  Featured · {lead.category}
                </p>
                <h2 className="mt-4 font-display text-3xl leading-tight text-ink sm:text-4xl">
                  {lead.title}
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">{lead.excerpt}</p>
                <div className="mt-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-ink-soft">
                  <span>{formatDate(lead.publishedAt)}</span>
                  <span className="h-1 w-1 rounded-full bg-gold" />
                  <span>{lead.readMinutes} min read</span>
                </div>
                <span className="mt-7 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-teal">
                  Read the article
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </div>
            </Link>
          </Reveal>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <BlogExplorer posts={rest.length > 0 ? rest : published} />
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <Reveal>
          <div className="rounded-[2rem] bg-sky-light/60 px-8 py-12 text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-teal/70">The quiet letter</p>
            <h2 className="mx-auto mt-4 max-w-xl font-display text-3xl text-ink sm:text-4xl">
              One note a month. Nothing else.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-ink-soft">
              What is in season, what is new, and one thing worth slowing down for. Unsubscribe any time.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex rounded-full bg-teal px-8 py-3 text-[11px] uppercase tracking-[0.18em] text-cream hover:bg-ink"
            >
              Join the letter
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
