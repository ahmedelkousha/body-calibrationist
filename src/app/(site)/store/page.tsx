import type { Metadata } from "next";
import { readDb } from "@/lib/db";
import StoreGrid from "@/components/site/StoreGrid";
import Reveal from "@/components/site/Reveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Store",
  description:
    "Small-batch body oils, barrier serums, balms and ritual kits made the same way they are used in the studio.",
};

const pledges = [
  { title: "Small batches", body: "Blended in runs of 200, so nothing sits on a shelf losing potency." },
  { title: "Barrier-first", body: "No fragrance where it does not belong, no acids where they are not needed." },
  { title: "Sent with care", body: "Recycled packaging, hand-written notes, free shipping over $120." },
];

export default async function StorePage() {
  const db = await readDb();
  const products = db.products.filter((product) => product.status === "active");

  return (
    <>
      <section className="border-b border-sand/60 bg-cream-deep/40">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <p className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-gold">
            <span className="h-px w-10 bg-gold/70" />
            The store
          </p>
          <div className="mt-6 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <h1 className="max-w-2xl font-display text-5xl leading-[1.02] text-ink sm:text-6xl">
              Small bottles, made slowly.
            </h1>
            <p className="max-w-sm text-[15px] leading-relaxed text-ink-soft">
              The same oils, balms and serums used in the treatment room. Nothing here promises a new face —
              they simply make the daily ritual a little better.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <StoreGrid products={products} />
      </section>

      <section className="border-t border-sand/60 bg-white/50">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 md:grid-cols-3">
          {pledges.map((pledge, index) => (
            <Reveal key={pledge.title} delay={index * 80}>
              <div>
                <p className="font-display text-2xl text-ink">{pledge.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{pledge.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
