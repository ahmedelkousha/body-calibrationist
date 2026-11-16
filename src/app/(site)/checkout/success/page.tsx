import type { Metadata } from "next";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { getStripe } from "@/lib/stripe/server";
import ClearCart from "./ClearCart";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment complete",
  description: "Your Shelley's order or treatment payment.",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ session_id?: string }>;
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-2xl px-5 py-20 text-center sm:px-8 sm:py-24">{children}</section>
  );
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id: sessionId } = await searchParams;

  if (!sessionId) {
    return (
      <Shell>
        <h1 className="font-display text-4xl text-ink">No order to show</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          This page opens after a Stripe payment. If you have just paid, check your email for the receipt
          or contact the studio and we&apos;ll find it.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/store"
            className="rounded-full bg-teal px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-cream hover:bg-ink"
          >
            Back to the store
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-sand px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-ink hover:border-teal hover:text-teal"
          >
            Contact the studio
          </Link>
        </div>
      </Shell>
    );
  }

  let session;
  try {
    session = await getStripe().checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "payment_intent.latest_charge"],
    });
  } catch {
    return (
      <Shell>
        <h1 className="font-display text-4xl text-ink">We couldn&apos;t find that payment</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          The payment link may have expired. If money left your account, email{" "}
          <a href="mailto:hello@shelleys.studio" className="text-teal underline underline-offset-2">
            hello@shelleys.studio
          </a>{" "}
          and we&apos;ll sort it out.
        </p>
      </Shell>
    );
  }

  const kind = session.metadata?.kind === "service" ? "service" : "product";
  const paid = session.payment_status === "paid";
  const items = session.line_items?.data ?? [];
  const email = session.customer_details?.email || session.metadata?.customer_email || "";
  const preferredDate = session.metadata?.preferred_date || "";
  const shipping = session.collected_information?.shipping_details ?? null;

  if (!paid) {
    return (
      <Shell>
        <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Payment status</p>
        <h1 className="mt-3 font-display text-4xl text-ink">We&apos;re waiting on confirmation</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          Stripe has not confirmed this payment yet. This page will not update automatically; check your
          email for the receipt, or contact the studio if anything looks wrong.
        </p>
        <Link
          href={kind === "service" ? "/treatments" : "/store"}
          className="mt-8 inline-flex rounded-full bg-teal px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-cream hover:bg-ink"
        >
          {kind === "service" ? "Browse treatments" : "Back to the store"}
        </Link>
      </Shell>
    );
  }

  return (
    <Shell>
      {kind === "product" && <ClearCart />}

      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sky-light">
        <svg className="h-9 w-9 text-teal" fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </div>

      <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-gold">
        {kind === "service" ? "Treatment reserved" : "Payment received"}
      </p>
      <h1 className="mt-3 font-display text-4xl text-ink">Thank you, it&apos;s in.</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
        {kind === "service"
          ? "Your treatment is reserved and paid. Shelley will email you within one business day to confirm the exact time."
          : "Your order is paid and confirmed. We'll have it packed within two business days."}
        {email ? (
          <>
            {" "}
            A receipt is on its way to <span className="font-medium text-ink">{email}</span>.
          </>
        ) : null}
      </p>

      <div className="mt-8 rounded-[2rem] border border-sand/70 bg-white/70 p-6 text-left sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-sand/70 pb-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-ink-soft">Reference</p>
            <p className="mt-1 break-all font-mono text-[12px] text-ink">{session.id}</p>
          </div>
          <span className="rounded-full bg-sky-light/70 px-3 py-1 text-[9px] uppercase tracking-[0.14em] text-teal">
            Paid
          </span>
        </div>

        <ul className="mt-4 space-y-3">
          {items.map((line) => (
            <li key={line.id} className="flex items-start justify-between gap-4 text-sm">
              <span className="text-ink">
                {line.description || "Item"}
                {line.quantity && line.quantity > 1 ? (
                  <span className="text-ink-soft"> × {line.quantity}</span>
                ) : null}
              </span>
              <span className="whitespace-nowrap text-ink">
                {formatPrice((line.amount_total ?? 0) / 100)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex justify-between border-t border-sand/70 pt-4 font-display text-xl text-ink">
          <span>Total paid</span>
          <span>{formatPrice((session.amount_total ?? 0) / 100)}</span>
        </div>

        {kind === "service" && preferredDate && (
          <p className="mt-4 rounded-xl bg-cream-deep/60 px-4 py-3 text-sm text-ink-soft">
            Preferred time: <span className="text-ink">{preferredDate}</span>
          </p>
        )}

        {shipping && (
          <div className="mt-4 rounded-xl bg-cream-deep/60 px-4 py-3 text-sm leading-relaxed text-ink-soft">
            <p className="text-[10px] uppercase tracking-[0.16em] text-ink-soft">Shipping to</p>
            <p className="mt-1 text-ink">
              {shipping.name}
              <br />
              {shipping.address?.line1}
              {shipping.address?.line2 ? (
                <>
                  <br />
                  {shipping.address.line2}
                </>
              ) : null}
              <br />
              {[shipping.address?.city, shipping.address?.state, shipping.address?.postal_code]
                .filter(Boolean)
                .join(" ")}
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href={kind === "service" ? "/treatments" : "/store"}
          className="rounded-full bg-teal px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-cream hover:bg-ink"
        >
          {kind === "service" ? "Browse treatments" : "Continue shopping"}
        </Link>
        <Link
          href="/"
          className="rounded-full border border-sand px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-ink hover:border-teal hover:text-teal"
        >
          Back home
        </Link>
      </div>
    </Shell>
  );
}
