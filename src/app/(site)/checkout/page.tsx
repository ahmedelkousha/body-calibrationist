import type { Metadata } from "next";
import CheckoutForm from "./CheckoutForm";
import { isStripeConfigured } from "@/lib/stripe/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Securely complete your order from Shelley's Skin & Body Studio.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string }>;
}) {
  const params = await searchParams;

  return (
    <CheckoutForm
      stripeConfigured={isStripeConfigured}
      canceled={params.canceled === "1"}
    />
  );
}
