import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/site/ContactForm";
import Reveal from "@/components/site/Reveal";

export const metadata: Metadata = {
  title: "Reach Us",
  description:
    "Contact Shelley's studio by the sea — ask about treatments, products, workshops or a private event.",
};

const details = [
  {
    label: "The studio",
    lines: ["14 Marine Parade, Studio 2", "By appointment only"],
  },
  {
    label: "Hours",
    lines: ["Tuesday – Friday, 9am – 6pm", "Saturday, 9am – 3pm"],
  },
  {
    label: "Email",
    lines: ["hello@shelleys.studio"],
    href: "mailto:hello@shelleys.studio",
  },
  {
    label: "Phone",
    lines: ["+61 400 218 664"],
    href: "tel:+61400218664",
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-sand/60 bg-cream-deep/40">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-sky-light/50 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:py-20">
          <div className="lg:col-span-7">
            <p className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-gold">
              <span className="h-px w-10 bg-gold/70" />
              Reach us
            </p>
            <h1 className="mt-6 font-display text-5xl leading-[1.02] text-ink sm:text-6xl">
              Tell us where you are starting from.
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-soft">
              Whether you have a specific treatment in mind or no idea where to begin, write to us. Shelley
              reads every message herself and replies within one business day.
            </p>
          </div>
          <div className="lg:col-span-5 lg:pt-14">
            <div className="rounded-2xl border border-sand/70 bg-cream/80 p-6">
              <p className="text-[10px] uppercase tracking-[0.24em] text-gold">A note on replies</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                The studio is closed on Sundays and Mondays. Messages sent then are answered first thing
                Tuesday morning.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Reveal>
            <ContactForm />
          </Reveal>
        </div>

        <aside className="lg:col-span-5">
          <Reveal delay={100}>
            <div className="grid gap-8 sm:grid-cols-2">
              {details.map((detail) => (
                <div key={detail.label}>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-gold">{detail.label}</p>
                  <div className="mt-2 space-y-1 text-sm text-ink-soft">
                    {detail.lines.map((line) =>
                      detail.href ? (
                        <a key={line} href={detail.href} className="block hover:text-teal">
                          {line}
                        </a>
                      ) : (
                        <p key={line}>{line}</p>
                      ),
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 overflow-hidden rounded-[2rem] border border-sand/70 bg-sky-light/50">
              <div className="relative h-56 bg-[radial-gradient(circle_at_30%_40%,#d8e8f2,transparent_60%),radial-gradient(circle_at_75%_65%,#e6d3ac,transparent_55%)]">
                <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(#c2a06a33_1px,transparent_1px),linear-gradient(90deg,#c2a06a33_1px,transparent_1px)] [background-size:36px_36px]" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal text-cream shadow-lg">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  </span>
                  <p className="mt-2 rounded-full bg-cream/90 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-ink">
                    Marine Parade
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <p className="text-xs text-ink-soft">Free 2-hour parking after 5pm · 2 min from the beach</p>
                <Link href="/workshops" className="shrink-0 text-[10px] uppercase tracking-[0.16em] text-teal">
                  Visit us →
                </Link>
              </div>
            </div>

            <div className="mt-8 rounded-[1.5rem] bg-cream-deep/60 p-6">
              <p className="font-display text-xl text-ink">Looking to book a workshop?</p>
              <p className="mt-1 text-sm text-ink-soft">
                Places are limited to twelve. You can reserve directly on the workshops page.
              </p>
              <Link
                href="/workshops"
                className="mt-4 inline-flex rounded-full border border-teal/30 px-5 py-2.5 text-[10px] uppercase tracking-[0.16em] text-teal hover:bg-cream"
              >
                See upcoming dates
              </Link>
            </div>
          </Reveal>
        </aside>
      </section>
    </>
  );
}
