import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBySlug, readDb } from "@/lib/db";
import { formatDate, safeImage } from "@/lib/utils";
import Markdown from "@/lib/markdown";
import BlogCard from "@/components/site/BlogCard";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBySlug("blogs", slug);
  if (!post || post.status !== "published") return { title: "Article not found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      images: [safeImage(post.image, "/images/blog-1.webp")],
      publishedTime: post.publishedAt,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBySlug("blogs", slug);
  if (!post || post.status !== "published") notFound();

  const db = await readDb();
  const more = db.blogs
    .filter((item) => item.id !== post.id && item.status === "published")
    .slice(0, 3);

  return (
    <article>
      <div className="mx-auto max-w-3xl px-5 pt-10 sm:px-8">
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-ink-soft">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-ink">Journal</Link>
          <span>/</span>
          <span className="truncate text-ink">{post.category}</span>
        </nav>

        <div className="mt-8 flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-gold">
          <span>{post.category}</span>
          <span className="h-1 w-1 rounded-full bg-gold" />
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          <span className="h-1 w-1 rounded-full bg-gold" />
          <span>{post.readMinutes} min read</span>
        </div>

        <h1 className="mt-5 font-display text-4xl leading-[1.08] text-ink sm:text-6xl">{post.title}</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">{post.excerpt}</p>

        <div className="mt-8 flex items-center gap-3 border-y border-sand/60 py-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-light font-display text-lg text-teal">
            {post.author.charAt(0)}
          </span>
          <div>
            <p className="text-sm font-medium text-ink">{post.author}</p>
            <p className="text-[11px] text-ink-soft">Skin &amp; body therapist · Shelley&apos;s Studio</p>
          </div>
          <span className="ml-auto text-[10px] uppercase tracking-[0.18em] text-ink-soft">Share · ↗</span>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-5xl px-5 sm:px-8">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[2rem] bg-cream-deep">
          <Image
            src={safeImage(post.image, "/images/blog-1.webp")}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
          />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <Markdown content={post.content} />

        <div className="mt-12 rounded-[2rem] border border-sand/70 bg-cream-deep/40 p-8 text-center">
          <p className="text-[10px] uppercase tracking-[0.28em] text-gold">A note from Shelley</p>
          <p className="mt-3 font-display text-2xl leading-snug text-ink">
            If something here sounds like your skin, you are welcome to ask about it.
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
            Every enquiry is read and answered by Shelley, usually within one business day.
          </p>
          <Link
            href="/contact"
            className="mt-5 inline-flex rounded-full bg-teal px-7 py-3 text-[11px] uppercase tracking-[0.16em] text-cream hover:bg-ink"
          >
            Ask a question
          </Link>
        </div>
      </div>

      {more.length > 0 && (
        <section className="border-t border-sand/60 bg-white/40">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-display text-3xl text-ink">Keep reading</h2>
              <Link href="/blog" className="text-[11px] uppercase tracking-[0.16em] text-teal">
                All articles →
              </Link>
            </div>
            <div className="mt-8 grid gap-10 md:grid-cols-3">
              {more.map((item) => (
                <BlogCard key={item.id} post={item} compact />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
