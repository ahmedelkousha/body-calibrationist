import type { NextRequest } from "next/server";
import { HttpError, requireStudioUser } from "@/lib/auth/server";
import {
  errorResponse,
  getStripe,
} from "@/lib/stripe/server";

export const runtime = "nodejs";

type RefundBody = {
  paymentIntentId?: unknown;
  amount?: unknown;
  reason?: unknown;
};

const PAYMENT_INTENT_PATTERN = /^pi_[A-Za-z0-9_]+$/;
const REASONS = new Set(["duplicate", "fraudulent", "requested_by_customer"]);

export async function POST(request: NextRequest) {
  try {
    const user = await requireStudioUser(request);
    const body = (await request.json().catch(() => null)) as RefundBody | null;

    if (!body) {
      throw new HttpError(400, "The refund request was empty.");
    }

    const paymentIntentId =
      typeof body.paymentIntentId === "string" ? body.paymentIntentId.trim() : "";

    if (!PAYMENT_INTENT_PATTERN.test(paymentIntentId)) {
      throw new HttpError(400, "That payment could not be identified.");
    }

    const reason =
      typeof body.reason === "string" && REASONS.has(body.reason)
        ? (body.reason as "duplicate" | "fraudulent" | "requested_by_customer")
        : "requested_by_customer";

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ["latest_charge"],
    });

    if (paymentIntent.metadata?.kind !== "product" && paymentIntent.metadata?.kind !== "service") {
      throw new HttpError(403, "That payment was not created by this studio.");
    }

    if (paymentIntent.status !== "succeeded") {
      throw new HttpError(409, "Only a completed payment can be refunded.");
    }

    const charge =
      typeof paymentIntent.latest_charge === "string" ? null : paymentIntent.latest_charge;

    if (!charge) {
      throw new HttpError(409, "Stripe has no charge for this payment yet.");
    }

    const refunded = charge.amount_refunded ?? 0;
    const remaining = Math.max(0, charge.amount - refunded);

    if (remaining <= 0) {
      throw new HttpError(409, "This payment has already been fully refunded.");
    }

    let amount = remaining;
    if (body.amount !== undefined) {
      const requested = Number(body.amount);
      if (!Number.isInteger(requested) || requested < 1) {
        throw new HttpError(400, "Enter a refund amount in cents.");
      }
      if (requested > remaining) {
        throw new HttpError(
          400,
          `The refundable balance is ${(remaining / 100).toFixed(2)} AUD.`,
        );
      }
      amount = requested;
    }

    if (amount < 50) {
      throw new HttpError(400, "The minimum refund is $0.50.");
    }

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount,
      reason,
      metadata: {
        refunded_by: user.email,
        refunded_by_uid: user.uid,
      },
    });

    return Response.json({
      refund: {
        id: refund.id,
        amount: refund.amount,
        status: refund.status,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
