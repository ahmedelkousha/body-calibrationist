import Stripe from "stripe";
import type { NextRequest } from "next/server";
import { HttpError } from "@/lib/auth/server";

export { HttpError };
export { requireStudioUser } from "@/lib/auth/server";
export type { StudioUser } from "@/lib/auth/server";
export { toStudioOrder } from "./orders";

/**
 * Server-only Stripe helpers.
 *
 * The secret key is never imported by a client component. All Stripe calls
 * happen in route handlers or server components, which keeps the key out of
 * the browser bundle and away from Firebase entirely.
 */

export const isStripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new HttpError(
      503,
      "Stripe is not configured. Add STRIPE_SECRET_KEY to .env.local and restart the server.",
    );
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      appInfo: { name: "Shelley's Studio", version: "1.0.0" },
    });
  }

  return stripeClient;
}

export function errorResponse(error: unknown): Response {
  if (error instanceof HttpError) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof Stripe.errors.StripeError) {
    console.error("Stripe request failed:", error.message);

    if (error.type === "StripeAuthenticationError") {
      return Response.json(
        { error: "Stripe rejected the configured secret key. Check STRIPE_SECRET_KEY." },
        { status: 502 },
      );
    }

    return Response.json(
      { error: "Stripe could not complete that request. Please try again." },
      { status: 502 },
    );
  }

  console.error("Unexpected payments error:", error);
  return Response.json(
    { error: "Something went wrong. Please try again." },
    { status: 500 },
  );
}

/** Public origin used for Stripe redirects. */
export function siteOrigin(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  return configured || request.nextUrl.origin;
}
