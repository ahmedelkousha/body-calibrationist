import Image from "next/image";
import Link from "next/link";
import { readDb } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/utils";
import Reveal from "@/components/site/Reveal";
import SectionHeading from "@/components/site/SectionHeading";
import ServiceCard from "@/components/site/ServiceCard";
import ProductCard from "@/components/site/ProductCard";
import BlogCard from "@/components/site/BlogCard";
import StoryCarousel from "@/components/site/StoryCarousel";
import StarRating from "@/components/site/StarRating";

export const dynamic = "force-dynamic";

const values = [
  "Unhurried appointments",
  "Small-batch products",
  "Barrier-first skin care",
  "One therapist, every visit",
  "No upselling, ever",
  "Made by hand, by the sea",
];

export default async function HomePage() {
  const db = await readDb();
  const services = db.services.filter((service) => service.featured).slice(0, 3);
  const products = db.products
    .filter((product) => product.status === "active" && product.featured)
    .slice(0, 4);
  const posts = db.blogs.filter((post) => post.status === "published").slice(0, 2);
  const stories = db.stories.filter((story) => story.featured);
  const nextEvent = db.events
    .filter((event) => event.status === "upcoming")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-cream">
        <div className="pointer-events-none absolute -right-32 -top-24 h-[520px] w-[520px] rounded-full bg-sky-light/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-1/3 h-[420px] w-[420px] rounded-full bg-cream-deep blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-12 lg:gap-8 lg:pb-24 lg:pt-16">
          <div className="lg:col-span-6">
            <p className="animate-fade-up flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-gold">
              <span className="h-px w-10 bg-gold/70" />
              Skin &amp; body studio · est. 2018
            </p>
            <h1
              className="animate-fade-up mt-6 font-display text-[3.4rem] leading-[0.98] text-ink sm:text-7xl lg:text-[5.2rem]"
              style={{ animationDelay: "80ms" }}
            >
              Care that moves
              <br />
              at <span className="italic text-teal">your</span> pace.
            </h1>
            <p
              className="animate-fade-up mt-7 max-w-md text-[15px] leading-relaxed text-ink-soft"
              style={{ animationDelay: "160ms" }}
            >
              Holistic massage, bespoke facials and advanced skin therapy — in a small studio where
              nothing is rushed and no one is sold something they don&apos;t need.
            </p>
            <div
              className="animate-fade-up mt-9 flex flex-col gap-3 sm:flex-row"
              style={{ animationDelay: "240ms" }}
            >
              <Link
                href="/treatments"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-teal px-8 py-3.5 text-[11px] uppercase tracking-[0.2em] text-cream transition hover:bg-ink"
              >
                Explore treatments
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/store"
                className="inline-flex items-center justify-center rounded-full border border-sand px-8 py-3.5 text-[11px] uppercase tracking-[0.2em] text-ink transition hover:border-teal hover:text-teal"
              >
                Visit the store
              </Link>
            </div>

            <div
              className="animate-fade-up mt-12 flex flex-wrap items-center gap-8"
              style={{ animationDelay: "320ms" }}
            >
              <div>
                <p className="font-display text-3xl text-ink">12<span className="text-teal">+</span></p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-ink-soft">Years by the sea</p>
              </div>
              <span className="h-10 w-px bg-sand" />
              <div>
                <p className="font-display text-3xl text-ink">4.9</p>
                <div className="mt-1 flex items-center gap-2">
                  <StarRating rating={5} />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-ink-soft">210 reviews</span>
                </div>
              </div>
              <span className="h-10 w-px bg-sand" />
              <div>
                <p className="font-display text-3xl text-ink">2.4k</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-ink-soft">Treatments given</p>
              </div>
            </div>
          </div>

          <div className="relative lg:col-span-6">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-lg overflow-hidden rounded-[12rem_12rem_2rem_2rem] bg-cream-deep shadow-[0_50px_100px_-60px_rgba(22,48,60,0.6)]">
              <Image
                src="/images/hero.webp"
                alt="A calm treatment room with soft natural light"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-cover"
              />
            </div>
            <div className="animate-floaty absolute -bottom-6 left-0 w-60 rounded-2xl border border-sand/60 bg-cream/95 p-5 shadow-[0_30px_60px_-40px_rgba(22,48,60,0.7)] backdrop-blur sm:left-4">
              <p className="text-[9px] uppercase tracking-[0.26em] text-gold">Next workshop</p>
              <p className="mt-2 font-display text-xl leading-tight text-ink">
                {nextEvent ? nextEvent.title : "Winter Reset"}
              </p>
              <p className="mt-1 text-[11px] text-ink-soft">
                {nextEvent ? formatDate(nextEvent.date) : "Coming soon"} ·{" "}
                {nextEvent ? formatPrice(nextEvent.price) : ""}
              </p>
              <Link
                href="/workshops"
                className="mt-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-teal"
              >
                Reserve a place →
              </Link>
            </div>
            <div className="absolute -right-2 top-8 hidden rounded-full border border-gold/40 bg-cream/80 px-4 py-2 text-[9px] uppercase tracking-[0.2em] text-ink backdrop-blur sm:block">
              Tue – Sat · by appointment
            </div>
          </div>
        </div>
      </section>

      {/* Values marquee */}
      <div className="overflow-hidden border-y border-sand/60 bg-cream-deep/60 py-4">
        <div className="flex animate-[marquee_38s_linear_infinite] gap-10 whitespace-nowrap [animation-play-state:running]">
          {[...values, ...values].map((value, index) => (
            <span
              key={`${value}-${index}`}
              className="flex items-center gap-10 text-[10px] uppercase tracking-[0.28em] text-ink-soft"
            >
              {value}
              <span className="h-1 w-1 rounded-full bg-gold" />
            </span>
          ))}
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      </div>

      {/* Services */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Treatments & services"
            title="Three ways to be looked after."
            description="Each appointment begins with a conversation and ends with a plan — never a sales pitch. Choose the pace that fits the week you've had."
            action={{ label: "All treatments", href: "/treatments" }}
          />
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Reveal key={service.id} delay={index * 90}>
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Approach */}
      <section className="bg-teal text-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:py-28">
          <Reveal>
            <div className="relative">
              <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem]">
                <Image
                  src="/images/approach.webp"
                  alt="A treatment room prepared for a guest"
                  fill
                  sizes="(max-width: 1024px) 90vw, 45vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-3 rounded-2xl bg-cream p-5 text-ink shadow-xl sm:right-6">
                <p className="font-display text-4xl leading-none">1:1</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-ink-soft">Only ever you</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <p className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-gold-light">
              <span className="h-px w-10 bg-gold-light/60" />
              Our approach
            </p>
            <h2 className="mt-5 font-display text-4xl leading-tight sm:text-5xl">
              Fewer things, done properly.
            </h2>
            <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-cream/75">
              We work slowly, in small batches and short lists. One therapist sees you each time, so your
              history stays in the room — not in a file nobody reads.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "A real conversation before any treatment begins",
                "Products chosen for your barrier, not the latest trend",
                "A written plan you can actually follow at home",
                "Room to change your mind, pause, or simply rest",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-cream/85">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-cream/30 text-[10px]">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/approach"
              className="mt-9 inline-flex items-center gap-2 rounded-full border border-cream/30 px-7 py-3 text-[11px] uppercase tracking-[0.18em] text-cream transition hover:bg-cream hover:text-teal"
            >
              Read our philosophy
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="The store"
            title="Made for the space between visits."
            description="Oils, balms and serums blended in small batches — the same ones we reach for in the treatment room."
            action={{ label: "Shop all products", href: "/store" }}
          />
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {products.map((product, index) => (
            <Reveal key={product.id} delay={index * 70}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Stories */}
      <section className="bg-cream-deep/60">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <Reveal>
            <StoryCarousel stories={stories} />
          </Reveal>
        </div>
      </section>

      {/* Journal */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="The journal"
            title="Notes on skin, rest and doing less."
            description="Practical writing from the treatment room — no miracle claims, just what actually seems to help."
            action={{ label: "Read the journal", href: "/blog" }}
          />
        </Reveal>
        <div className="mt-12 grid gap-10 md:grid-cols-2">
          {posts.map((post, index) => (
            <Reveal key={post.id} delay={index * 100}>
              <BlogCard post={post} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:pb-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-sky-light/70 px-6 py-16 text-center sm:px-16">
            <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-cream/60 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-cream/50 blur-3xl" />
            <p className="relative text-[10px] uppercase tracking-[0.32em] text-teal/70">Start here</p>
            <h2 className="relative mx-auto mt-5 max-w-2xl font-display text-4xl leading-tight text-ink sm:text-5xl">
              Not sure where to begin? Tell us what your week feels like.
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-[15px] text-ink-soft">
              Shelley answers every enquiry herself, usually within a day. No call scripts, no pressure —
              just a recommendation you can trust.
            </p>
            <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="rounded-full bg-teal px-8 py-3.5 text-[11px] uppercase tracking-[0.2em] text-cream transition hover:bg-ink"
              >
                Ask a question
              </Link>
              <Link
                href="/workshops"
                className="rounded-full border border-teal/30 px-8 py-3.5 text-[11px] uppercase tracking-[0.2em] text-teal transition hover:bg-cream/60"
              >
                See workshops
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
