import type Stripe from "stripe";
import type { OrderKind, OrderStatus, StudioOrder } from "./types";

/**
 * Builds the dashboard order shape from a Stripe Checkout Session.
 * `line_items` and `payment_intent.latest_charge` should be expanded.
 */
export function toStudioOrder(session: Stripe.Checkout.Session): StudioOrder {
  const paymentIntent =
    typeof session.payment_intent === "string" ? null : session.payment_intent;
  const charge =
    paymentIntent && typeof paymentIntent.latest_charge !== "string"
      ? paymentIntent.latest_charge
      : null;

  const kind: OrderKind = session.metadata?.kind === "service" ? "service" : "product";
  const amountTotal = session.amount_total ?? 0;
  const amountRefunded = charge?.amount_refunded ?? 0;
  const amountRemaining = Math.max(0, (charge?.amount ?? amountTotal) - amountRefunded);

  let status: OrderStatus = "pending";
  if (amountRefunded >= amountTotal && amountTotal > 0) {
    status = "refunded";
  } else if (amountRefunded > 0) {
    status = "partially_refunded";
  } else if (session.payment_status === "paid") {
    status = "paid";
  }

  const shippingDetails = session.collected_information?.shipping_details ?? null;
  const shippingAddress = shippingDetails?.address;

  const items = (session.line_items?.data ?? []).map((line) => ({
    name: line.description || "Item",
    quantity: line.quantity ?? 1,
    unitAmount: line.price?.unit_amount ?? 0,
    amountTotal: line.amount_total ?? 0,
  }));

  const paymentIntentId = paymentIntent?.id ?? "";
  const dashboardUrl = paymentIntentId
    ? `https://dashboard.stripe.com${session.livemode ? "" : "/test"}/payments/${paymentIntentId}`
    : `https://dashboard.stripe.com${session.livemode ? "" : "/test"}/checkout/sessions/${session.id}`;

  return {
    id: session.id,
    kind,
    createdAt: new Date(session.created * 1000).toISOString(),
    customerName:
      session.customer_details?.name || session.metadata?.customer_name || "Guest",
    customerEmail:
      session.customer_details?.email || session.metadata?.customer_email || "",
    customerPhone:
      session.customer_details?.phone || session.metadata?.customer_phone || "",
    amountTotal,
    amountRefunded,
    amountRemaining,
    currency: session.currency ?? "aud",
    status,
    paymentIntentId,
    items,
    shipping: shippingAddress
      ? {
          name: shippingDetails?.name || "",
          line1: shippingAddress.line1 || "",
          line2: shippingAddress.line2 || "",
          city: shippingAddress.city || "",
          state: shippingAddress.state || "",
          postalCode: shippingAddress.postal_code || "",
          country: shippingAddress.country || "",
        }
      : null,
    preferredDate: session.metadata?.preferred_date || "",
    notes: session.metadata?.notes || "",
    receiptUrl: charge?.receipt_url || "",
    dashboardUrl,
  };
}

