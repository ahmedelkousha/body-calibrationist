import Image from "next/image";
import Link from "next/link";
import type { Service } from "@/lib/types";
import { formatPrice, safeImage } from "@/lib/utils";

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-sand/60 bg-white/60 transition duration-500 hover:-translate-y-1 hover:border-teal/20 hover:shadow-[0_24px_60px_-30px_rgba(22,48,60,0.35)]">
      <Link href={`/treatments/${service.slug}`} className="relative block aspect-[4/3] overflow-hidden">
        <Image
          src={safeImage(service.image, "/images/service-massage.webp")}
          alt={service.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-cream/85 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-ink backdrop-blur">
          {service.duration} min
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-2xl leading-tight text-ink">
            <Link href={`/treatments/${service.slug}`} className="hover:text-teal">
              {service.name}
            </Link>
          </h3>
          <span className="shrink-0 text-sm text-ink-soft">{formatPrice(service.price)}</span>
        </div>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{service.description}</p>
        <Link
          href={`/treatments/${service.slug}`}
          className="mt-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-teal"
        >
          Explore treatment
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </article>
  );
}
