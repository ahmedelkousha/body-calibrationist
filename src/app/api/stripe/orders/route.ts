import type { NextRequest } from "next/server";
import { HttpError, requireStudioUser } from "@/lib/auth/server";
import {
  errorResponse,
  getStripe,
  toStudioOrder,
} from "@/lib/stripe/server";

export const runtime = "nodejs";

const FILTERS = new Set(["all", "product", "service"]);

export async function GET(request: NextRequest) {
  try {
    await requireStudioUser(request);

    const filter = request.nextUrl.searchParams.get("kind") ?? "all";
    if (!FILTERS.has(filter)) {
      throw new HttpError(400, "Unknown order type.");
    }

    const stripe = getStripe();
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      expand: ["data.line_items", "data.payment_intent.latest_charge"],
    });

    const orders = sessions.data
      .filter((session) => session.status === "complete" && session.payment_status === "paid")
      .filter((session) => Boolean(session.metadata?.kind))
      .filter((session) => filter === "all" || session.metadata?.kind === filter)
      .map(toStudioOrder);

    return Response.json({ orders });
  } catch (error) {
    return errorResponse(error);
  }
}
