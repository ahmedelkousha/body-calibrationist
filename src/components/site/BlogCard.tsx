import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/lib/types";
import { formatDate, safeImage } from "@/lib/utils";

export default function BlogCard({ post, compact = false }: { post: BlogPost; compact?: boolean }) {
  return (
    <article className="group flex flex-col">
      <Link
        href={`/blog/${post.slug}`}
        className="relative block overflow-hidden rounded-[1.75rem] bg-cream-deep"
        style={{ aspectRatio: compact ? "16 / 10" : "4 / 3" }}
      >
        <Image
          src={safeImage(post.image, "/images/blog-1.webp")}
          alt={post.title}
          fill
          sizes={compact ? "(max-width: 768px) 100vw, 33vw" : "(max-width: 768px) 100vw, 50vw"}
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-cream/90 px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-ink backdrop-blur">
          {post.category}
        </span>
      </Link>
      <div className="mt-5 flex flex-1 flex-col">
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-ink-soft">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          <span className="h-1 w-1 rounded-full bg-gold" />
          <span>{post.readMinutes} min read</span>
        </div>
        <h3 className={compact ? "mt-2 font-display text-xl leading-snug text-ink" : "mt-2 font-display text-2xl leading-snug text-ink"}>
          <Link href={`/blog/${post.slug}`} className="transition hover:text-teal">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">{post.excerpt}</p>
      </div>
    </article>
  );
}
