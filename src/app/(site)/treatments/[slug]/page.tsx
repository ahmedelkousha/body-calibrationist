import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBySlug, readDb } from "@/lib/db";
import { formatPrice, safeImage } from "@/lib/utils";
import Markdown from "@/lib/markdown";
import ServiceCard from "@/components/site/ServiceCard";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getBySlug("services", slug);
  if (!service) return { title: "Treatment not found" };
  return {
    title: service.name,
    description: service.description,
    openGraph: { title: service.name, description: service.description, images: [service.image] },
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = await getBySlug("services", slug);
  if (!service) notFound();

  const db = await readDb();
  const others = db.services.filter((item) => item.id !== service.id).slice(0, 3);

  return (
    <>
      <div className="mx-auto max-w-7xl px-5 pt-8 sm:px-8">
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-ink-soft">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span>/</span>
          <Link href="/treatments" className="hover:text-ink">Treatments</Link>
          <span>/</span>
          <span className="text-ink">{service.name}</span>
        </nav>
      </div>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-12 lg:gap-14 lg:py-14">
        <div className="lg:col-span-6">
          <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] bg-cream-deep">
            <Image
              src={safeImage(service.image, "/images/service-massage.webp")}
              alt={service.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
        <div className="lg:col-span-6 lg:pt-4">
          <p className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-gold">
            <span className="h-px w-8 bg-gold/70" />
            Treatment
          </p>
          <h1 className="mt-5 font-display text-4xl leading-[1.05] text-ink sm:text-5xl">{service.name}</h1>
          <p className="mt-4 font-display text-xl italic text-teal">{service.tagline}</p>
          <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">{service.description}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full bg-cream-deep px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-ink">
              {service.duration} minutes
            </span>
            <span className="rounded-full bg-cream-deep px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-ink">
              {formatPrice(service.price)}
            </span>
            <span className="rounded-full bg-sky-light/70 px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-teal">
              One-to-one
            </span>
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {service.benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2 text-sm text-ink-soft">
                <span className="mt-0.5 text-gold">✦</span>
                {benefit}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="rounded-full bg-teal px-8 py-3.5 text-center text-[11px] uppercase tracking-[0.18em] text-cream transition hover:bg-ink"
            >
              Enquire about this treatment
            </Link>
            <Link
              href="/workshops"
              className="rounded-full border border-sand px-8 py-3.5 text-center text-[11px] uppercase tracking-[0.18em] text-ink transition hover:border-teal hover:text-teal"
            >
              See workshops
            </Link>
          </div>
          <p className="mt-4 text-[11px] text-ink-soft">
            Payment by card or Apple Pay at the studio, or in advance when we confirm your time.
          </p>
        </div>
      </section>

      <section className="border-t border-sand/60 bg-white/50">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="font-display text-3xl text-ink">About this treatment</h2>
            <p className="mt-3 text-sm text-ink-soft">
              Everything that happens, and what it is best suited to.
            </p>
          </div>
          <div className="lg:col-span-8">
            <Markdown content={service.longDescription} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl text-ink sm:text-4xl">You may also like</h2>
          <Link href="/treatments" className="text-[11px] uppercase tracking-[0.16em] text-teal">
            All treatments →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {others.map((item) => (
            <ServiceCard key={item.id} service={item} />
          ))}
        </div>
      </section>
    </>
  );
}
