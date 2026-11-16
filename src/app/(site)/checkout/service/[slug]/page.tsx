import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBySlug } from "@/lib/firebase/data";
import { isStripeConfigured } from "@/lib/stripe/server";
import ServiceCheckoutForm from "./ServiceCheckoutForm";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ canceled?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getBySlug("services", slug);

  return {
    title: service ? `Book ${service.name}` : "Book a treatment",
    description: service?.description ?? "Reserve a treatment at Shelley's Skin & Body Studio.",
    robots: { index: false, follow: false },
  };
}

export default async function ServiceCheckoutPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;
  const service = await getBySlug("services", slug);

  if (!service) notFound();

  return (
    <ServiceCheckoutForm
      service={service}
      stripeConfigured={isStripeConfigured}
      canceled={query.canceled === "1"}
    />
  );
}
