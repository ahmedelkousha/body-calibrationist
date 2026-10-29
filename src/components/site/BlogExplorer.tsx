"use client";

import { useMemo, useState } from "react";
import type { BlogPost } from "@/lib/types";
import BlogCard from "./BlogCard";
import { cn } from "@/lib/utils";

export default function BlogExplorer({ posts }: { posts: BlogPost[] }) {
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(posts.map((post) => post.category)))],
    [posts],
  );
  const [category, setCategory] = useState("All");

  const filtered = category === "All" ? posts : posts.filter((post) => post.category === category);

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-y border-sand/60 py-5">
        {categories.map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            className={cn(
              "rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.14em] transition",
              category === item
                ? "border-teal bg-teal text-cream"
                : "border-sand text-ink-soft hover:border-teal/40 hover:text-ink",
            )}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-10 grid gap-x-10 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((post) => (
          <BlogCard key={post.id} post={post} compact />
        ))}
      </div>
    </div>
  );
}
