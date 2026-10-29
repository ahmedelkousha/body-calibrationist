"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { Story } from "@/lib/types";
import StarRating from "./StarRating";
import { cn, safeImage } from "@/lib/utils";

export default function StoryCarousel({ stories }: { stories: Story[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = stories.length;

  const go = useCallback(
    (next: number) => {
      if (total === 0) return;
      setIndex(((next % total) + total) % total);
    },
    [total],
  );

  useEffect(() => {
    if (paused || total < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % total);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [paused, total]);

  if (total === 0) return null;
  const story = stories[index];

  return (
    <div
      className="grid items-center gap-10 lg:grid-cols-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative lg:col-span-5">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-cream-deep">
          {stories.map((item, i) => (
            <Image
              key={item.id}
              src={safeImage(item.image, "/images/story-1.webp")}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className={cn(
                "object-cover transition-all duration-1000",
                i === index ? "scale-100 opacity-100" : "scale-105 opacity-0",
              )}
            />
          ))}
        </div>
        <div className="absolute -bottom-5 -right-4 rounded-2xl bg-cream px-5 py-4 shadow-[0_20px_50px_-30px_rgba(22,48,60,0.5)] sm:-right-6">
          <p className="font-display text-3xl text-ink">{story.rating}.0</p>
          <StarRating rating={story.rating} className="mt-1 flex gap-1" />
          <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-ink-soft">Client rating</p>
        </div>
      </div>

      <div className="lg:col-span-7 lg:pl-8">
        <p className="text-[10px] uppercase tracking-[0.32em] text-gold">Transformation stories</p>
        <blockquote className="mt-5 font-display text-3xl leading-[1.35] text-ink sm:text-4xl">
          “{story.quote}”
        </blockquote>
        <div className="mt-7 flex items-center gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-light font-display text-lg text-teal">
            {story.name.charAt(0)}
          </span>
          <div>
            <p className="text-sm font-medium text-ink">{story.name}</p>
            <p className="text-xs text-ink-soft">{story.headline} · {story.service}</p>
          </div>
        </div>

        <div className="mt-10 flex items-center gap-4">
          <div className="flex gap-2">
            {stories.map((item, i) => (
              <button
                key={item.id}
                onClick={() => go(i)}
                aria-label={`Show story from ${item.name}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === index ? "w-8 bg-teal" : "w-3 bg-sand hover:bg-gold",
                )}
              />
            ))}
          </div>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => go(index - 1)}
              aria-label="Previous story"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-sand text-ink-soft transition hover:border-teal hover:text-teal"
            >
              ←
            </button>
            <button
              onClick={() => go(index + 1)}
              aria-label="Next story"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-sand text-ink-soft transition hover:border-teal hover:text-teal"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
