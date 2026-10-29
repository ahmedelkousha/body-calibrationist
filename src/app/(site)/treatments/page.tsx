import type { Metadata } from "next";
import Link from "next/link";
import { readDb } from "@/lib/db";
import ServiceCard from "@/components/site/ServiceCard";
import Reveal from "@/components/site/Reveal";
import SectionHeading from "@/components/site/SectionHeading";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Treatments & Services",
  description:
    "Holistic massage, bespoke facials, advanced skin therapy and seasonal rituals at Shelley's studio by the sea.",
};

const steps = [
  {
    number: "01",
    title: "A conversation",
    body: "Ten minutes over tea before anything begins. What has changed, what you have tried, what your body has been holding.",
  },
  {
    number: "02",
    title: "The treatment",
    body: "Hands-on work at a pace your nervous system can follow. Pressure, scent and warmth guided entirely by you.",
  },
  {
    number: "03",
    title: "A plan",
    body: "You leave with something written: what to do at home, what to skip, and when to come back — if at all.",
  },
];

export default async function TreatmentsPage() {
  const db = await readDb();
  const services = db.services;

  return (
    <>
      <section className="relative overflow-hidden border-b border-sand/60 bg-cream-deep/40">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
          <p className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-gold">
            <span className="h-px w-10 bg-gold/70" />
            Treatments &amp; services
          </p>
          <h1 className="mt-6 max-w-3xl font-display text-5xl leading-[1.02] text-ink sm:text-6xl lg:text-7xl">
            Time set aside, entirely for you.
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ink-soft">
            Four treatments, each with a different pace. All appointments are one-to-one with Shelley, and
            every one begins with a proper conversation.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <div className="grid gap-6 md:grid-cols-2">
          {services.map((service, index) => (
            <Reveal key={service.id} delay={index * 80}>
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-sand/60 bg-white/50">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="How it works"
              title="Nothing unexpected."
              description="The same three-part rhythm, whether it is your first visit or your fiftieth."
            />
          </Reveal>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <Reveal key={step.number} delay={index * 90}>
                <div className="border-t border-sand pt-6">
                  <p className="font-display text-3xl text-gold">{step.number}</p>
                  <h3 className="mt-3 font-display text-2xl text-ink">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-20 sm:px-8">
        <Reveal>
          <SectionHeading eyebrow="Before you book" title="Questions we are asked most." align="center" />
          <div className="mt-10 divide-y divide-sand/70 border-y border-sand/70">
            {[
              {
                q: "I've never had a massage. Is that okay?",
                a: "Entirely. Around a third of our clients arrive having never had one. We talk first, you keep your comfort levels, and there is no expectation to endure anything. Pressure is always yours to set.",
              },
              {
                q: "Can I book a treatment as a gift?",
                a: "Yes. Gift vouchers are available for any treatment or value, and can be sent directly to the recipient with a note. Mention it in your enquiry and we will arrange it.",
              },
              {
                q: "Do you offer pregnancy-safe treatments?",
                a: "We do, from the second trimester onward. Please mention your stage when you enquire so we can plan the appointment properly. Our Barrier Repair Serum is also pregnancy-safe.",
              },
              {
                q: "What is your cancellation policy?",
                a: "Twenty-four hours' notice for a full change or cancellation. Within twenty-four hours we charge 50% of the treatment, as the time is hard to fill at short notice.",
              },
            ].map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-display text-xl text-ink marker:hidden">
                  {item.q}
                  <span className="text-gold transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">{item.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-teal px-8 py-12 text-cream sm:flex-row sm:items-center">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-cream/60">Not sure which to choose?</p>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl">Tell us about your week.</h2>
            </div>
            <Link
              href="/contact"
              className="rounded-full bg-cream px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-teal transition hover:bg-gold-light"
            >
              Ask Shelley
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
