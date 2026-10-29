import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { readDb } from "@/lib/db";
import Reveal from "@/components/site/Reveal";
import StarRating from "@/components/site/StarRating";
import { safeImage } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Transformation Stories",
  description:
    "Real client stories from Shelley's studio — skin, sleep, stress and the small changes that held.",
};

export default async function StoriesPage() {
  const db = await readDb();
  const stories = db.stories;

  return (
    <>
      <section className="border-b border-sand/60 bg-cream-deep/40">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <p className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-gold">
            <span className="h-px w-10 bg-gold/70" />
            Transformation stories
          </p>
          <div className="mt-6 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <h1 className="max-w-2xl font-display text-5xl leading-[1.02] text-ink sm:text-6xl">
              In their own words.
            </h1>
            <div className="flex items-center gap-5">
              <div>
                <p className="font-display text-4xl text-ink">4.9</p>
                <StarRating rating={5} className="mt-1 flex gap-1" />
              </div>
              <p className="max-w-[180px] text-[11px] leading-relaxed text-ink-soft">
                From 210 verified reviews across Google and our booking system.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="space-y-16">
          {stories.map((story, index) => (
            <Reveal key={story.id}>
              <article
                className={`grid items-center gap-8 lg:grid-cols-12 ${
                  index % 2 === 1 ? "lg:[&>figure]:order-2" : ""
                }`}
              >
                <figure className="relative lg:col-span-5">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-cream-deep">
                    <Image
                      src={safeImage(story.image, "/images/story-1.webp")}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 90vw, 40vw"
                      className="object-cover"
                    />
                  </div>
                </figure>
                <div className="lg:col-span-7 lg:px-8">
                  <div className="flex items-center gap-3">
                    <StarRating rating={story.rating} />
                    <span className="text-[10px] uppercase tracking-[0.2em] text-ink-soft">{story.service}</span>
                  </div>
                  <h2 className="mt-4 font-display text-3xl leading-tight text-ink sm:text-4xl">
                    “{story.quote}”
                  </h2>
                  <div className="mt-6 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-light font-display text-teal">
                      {story.name.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ink">{story.name}</p>
                      <p className="text-xs text-ink-soft">{story.headline}</p>
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-teal text-cream">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 md:grid-cols-3">
          {[
            { value: "2,400+", label: "Treatments given since 2012" },
            { value: "92%", label: "Of clients return within 3 months" },
            { value: "1:1", label: "Every appointment, no rotating staff" },
          ].map((stat) => (
            <div key={stat.label} className="border-t border-cream/20 pt-6">
              <p className="font-display text-4xl">{stat.value}</p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-cream/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <Reveal>
          <div className="rounded-[2.5rem] bg-sky-light/60 px-8 py-14 text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-teal/70">Your turn</p>
            <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl leading-tight text-ink sm:text-5xl">
              The next story could be a quieter week.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm text-ink-soft">
              Tell us where you are starting from. We will tell you honestly what is realistic, and what is
              not.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/treatments"
                className="rounded-full bg-teal px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-cream hover:bg-ink"
              >
                Explore treatments
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-teal/30 px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-teal hover:bg-cream/60"
              >
                Start a conversation
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
