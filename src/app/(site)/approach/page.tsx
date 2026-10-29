import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/site/Reveal";

export const metadata: Metadata = {
  title: "Our Approach",
  description:
    "Shelley's philosophy: fewer products, slower appointments, and care that treats skin as part of a whole person.",
};

const principles = [
  {
    number: "01",
    title: "Listen before treating",
    body: "Every appointment opens with a conversation. Skin, sleep, stress and season are not separate systems, and treating them as though they are is why so many routines fail.",
  },
  {
    number: "02",
    title: "Support the barrier first",
    body: "Almost every concern we see — acne, redness, sensitivity, premature lines — improves once the skin barrier is intact. Actives come second, and only when the skin can carry them.",
  },
  {
    number: "03",
    title: "Prescribe less",
    body: "A routine you can follow on a bad week beats a perfect one you abandon. Most clients leave with three or four products, not ten, and a written plan that fits their actual life.",
  },
  {
    number: "04",
    title: "Measure, then adjust",
    body: "We photograph, note and review. If something is not working after six weeks, we change it rather than asking you to be patient for a year.",
  },
];

const timeline = [
  { year: "2012", title: "A treatment room by the sea", body: "Shelley begins practising from a single room above a bakery, seeing six clients a week." },
  { year: "2016", title: "Advanced skin training", body: "Three years of clinical study in dermal science, focused on pigmentation and barrier repair." },
  { year: "2019", title: "The studio opens", body: "A two-room studio on Marine Parade, built around longer appointments and fewer clients per day." },
  { year: "2023", title: "Made in small batches", body: "The product line begins — four formulas, blended by hand, made for the treatments we already use." },
];

export default function ApproachPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-sand/60 bg-cream-deep/40">
        <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-sky-light/50 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:py-24">
          <div className="lg:col-span-7">
            <p className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-gold">
              <span className="h-px w-10 bg-gold/70" />
              Our approach
            </p>
            <h1 className="mt-6 font-display text-5xl leading-[1.02] text-ink sm:text-6xl lg:text-7xl">
              Slow is not a luxury.
              <br />
              It is the <span className="italic text-teal">method</span>.
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ink-soft">
              Shelley&apos;s began in a single room with one rule: never rush a person. Fifteen years later,
              that is still the whole philosophy. Fewer clients, longer appointments, and products that do
              one job properly.
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-cream-deep">
              <Image
                src="/images/about.webp"
                alt="A treatment room prepared for a session"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold">The principles</p>
              <h2 className="mt-4 font-display text-4xl leading-tight text-ink">
                Four rules we do not bend.
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
                These are not marketing lines. They decide what treatments we offer, what we stock, and how
                long each appointment runs.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:col-span-8">
              {principles.map((principle, index) => (
                <Reveal key={principle.number} delay={index * 70}>
                  <div className="border-t border-sand pt-5">
                    <p className="font-display text-2xl text-gold">{principle.number}</p>
                    <h3 className="mt-2 font-display text-2xl text-ink">{principle.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{principle.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="bg-teal text-cream">
        <div className="mx-auto max-w-5xl px-5 py-20 text-center sm:px-8">
          <p className="font-display text-3xl leading-snug sm:text-4xl">
            “I am not interested in giving someone a new face. I am interested in giving them a face that
            feels like theirs, on a good day.”
          </p>
          <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-cream/60">Shelley · Founder</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <Reveal>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold">The story</p>
          <h2 className="mt-4 font-display text-4xl leading-tight text-ink">How we got here.</h2>
        </Reveal>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {timeline.map((item, index) => (
            <Reveal key={item.year} delay={index * 80}>
              <div>
                <p className="font-display text-4xl text-teal/30">{item.year}</p>
                <div className="mt-3 h-px w-full bg-sand" />
                <h3 className="mt-4 font-display text-xl text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <Reveal>
          <div className="grid items-center gap-8 rounded-[2.5rem] bg-cream-deep/60 p-8 sm:p-12 lg:grid-cols-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold">What this means for you</p>
              <h2 className="mt-4 font-display text-3xl leading-tight text-ink sm:text-4xl">
                Come as you are. Leave with a plan.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
                No membership, no package pressure, no products you did not ask about. Just an honest hour
                and something useful to take home.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Link
                href="/treatments"
                className="rounded-full bg-teal px-7 py-3.5 text-center text-[11px] uppercase tracking-[0.18em] text-cream hover:bg-ink"
              >
                See treatments
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-sand px-7 py-3.5 text-center text-[11px] uppercase tracking-[0.18em] text-ink hover:border-teal hover:text-teal"
              >
                Ask a question
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
