import type { Metadata } from "next";
import Link from "next/link";
import { readDb } from "@/lib/db";
import EventsList from "@/components/site/EventsList";
import Reveal from "@/components/site/Reveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Workshops & Events",
  description:
    "Small-group workshops and open studio mornings at Shelley's — breathwork, skin literacy and seasonal resets.",
};

export default async function WorkshopsPage() {
  const db = await readDb();
  const events = db.events
    .filter((event) => event.status !== "past")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <>
      <section className="border-b border-sand/60 bg-cream-deep/40">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <p className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-gold">
            <span className="h-px w-10 bg-gold/70" />
            Workshops &amp; events
          </p>
          <div className="mt-6 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <h1 className="max-w-2xl font-display text-5xl leading-[1.02] text-ink sm:text-6xl">
              Learn something, slowly.
            </h1>
            <p className="max-w-sm text-[15px] leading-relaxed text-ink-soft">
              Small groups, no slideshows that run over time, and always tea. Reserve a place and we will
              confirm by email — payment only once your spot is held.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <EventsList events={events} />
      </section>

      <section className="border-y border-sand/60 bg-white/50">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2">
          <Reveal>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Private events</p>
              <h2 className="mt-4 font-display text-4xl leading-tight text-ink">
                Bring your people.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
                We host private workshops for teams, birthdays and small celebrations — from six to fourteen
                people. Choose a breathwork session, a skin literacy class, or something built for your group.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-ink-soft">
                {[
                  "Weekday evenings or Saturday mornings",
                  "Tea, blankets and materials included",
                  "Take-home ritual cards for every guest",
                  "From $65 per person",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-0.5 text-gold">✦</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className="mt-7 inline-flex rounded-full bg-teal px-7 py-3 text-[11px] uppercase tracking-[0.16em] text-cream hover:bg-ink"
              >
                Enquire about a private event
              </Link>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="rounded-[2rem] border border-sand/70 bg-cream p-8">
              <h3 className="font-display text-2xl text-ink">Good to know</h3>
              <div className="mt-5 divide-y divide-sand/70">
                {[
                  {
                    q: "Do I need experience?",
                    a: "None. Every workshop is designed for complete beginners, and you are never asked to perform or share more than you want to.",
                  },
                  {
                    q: "What should I bring?",
                    a: "Comfortable clothing and water. Mats, bolsters, blankets, tea and everything else are provided.",
                  },
                  {
                    q: "What if I need to cancel?",
                    a: "Full refund up to 72 hours before. Inside 72 hours we can move you to another date or issue a credit.",
                  },
                  {
                    q: "Is there parking?",
                    a: "There is free two-hour parking on Marine Parade after 5pm, and a paid car park two minutes away.",
                  },
                ].map((item) => (
                  <details key={item.q} className="group py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg text-ink">
                      {item.q}
                      <span className="text-gold transition group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
