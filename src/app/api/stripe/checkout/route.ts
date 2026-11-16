import type { NextRequest } from "next/server";
import type Stripe from "stripe";
import { HttpError } from "@/lib/auth/server";
import { getProduct, getService } from "@/lib/stripe/catalog";
import {
  errorResponse,
  getStripe,
  siteOrigin,
} from "@/lib/stripe/server";

export const runtime = "nodejs";

const ID_PATTERN = /^[A-Za-z0-9_-]{1,160}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SHIPPING_FLAT_RATE = 950; // $9.50 AUD
const FREE_SHIPPING_THRESHOLD = 12000; // $120.00 AUD

type CheckoutBody = {
  kind?: unknown;
  items?: unknown;
  serviceId?: unknown;
  customer?: unknown;
  preferredDate?: unknown;
  notes?: unknown;
};

type RequestedItem = {
  id: string;
  quantity: number;
};

function asString(value: unknown, maxLength = 200): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function parseItems(value: unknown): RequestedItem[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new HttpError(400, "Your bag is empty.");
  }

  if (value.length > 20) {
    throw new HttpError(400, "That is too many different items for one order.");
  }

  const merged = new Map<string, number>();

  for (const raw of value) {
    if (!raw || typeof raw !== "object") {
      throw new HttpError(400, "One of the bag items is invalid.");
    }

    const id = asString((raw as { id?: unknown }).id, 160);
    const quantity = Number((raw as { quantity?: unknown }).quantity);

    if (!ID_PATTERN.test(id)) {
      throw new HttpError(400, "One of the bag items is invalid.");
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new HttpError(400, "Item quantities must be between 1 and 99.");
    }

    merged.set(id, Math.min(99, (merged.get(id) ?? 0) + quantity));
  }

  return Array.from(merged, ([id, quantity]) => ({ id, quantity }));
}

function parseCustomer(value: unknown): { name: string; email: string; phone: string } {
  if (!value || typeof value !== "object") {
    throw new HttpError(400, "Add your name and email before paying.");
  }

  const input = value as Record<string, unknown>;
  const name = asString(input.name, 100);
  const email = asString(input.email, 200).toLowerCase();
  const phone = asString(input.phone, 40);

  if (name.length < 2) {
    throw new HttpError(400, "Please enter your full name.");
  }

  if (!EMAIL_PATTERN.test(email)) {
    throw new HttpError(400, "Please enter a valid email address.");
  }

  return { name, email, phone };
}

function cents(value: unknown): number {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as CheckoutBody | null;
    if (!body) {
      throw new HttpError(400, "The checkout request was empty.");
    }

    const kind = body.kind === "service" ? "service" : body.kind === "product" ? "product" : null;
    if (!kind) {
      throw new HttpError(400, "Choose what you are paying for.");
    }

    const customer = parseCustomer(body.customer);
    const stripe = getStripe();
    const origin = siteOrigin(request);

    if (kind === "product") {
      const requested = parseItems(body.items);
      const products = await Promise.all(requested.map((item) => getProduct(item.id)));

      let subtotal = 0;
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

      for (let index = 0; index < requested.length; index += 1) {
        const product = products[index];
        const quantity = requested[index].quantity;

        if (!product || product.status !== "active") {
          throw new HttpError(409, "One of the products is no longer available.");
        }

        if (product.stock <= 0) {
          throw new HttpError(409, `${product.name} is sold out.`);
        }

        if (quantity > product.stock) {
          throw new HttpError(
            409,
            `Only ${product.stock} of ${product.name} remain. Please adjust your bag.`,
          );
        }

        const unitAmount = cents(product.price);
        if (unitAmount < 50) {
          throw new HttpError(409, `${product.name} cannot be purchased online right now.`);
        }

        subtotal += unitAmount * quantity;
        lineItems.push({
          quantity,
          price_data: {
            currency: "aud",
            unit_amount: unitAmount,
            product_data: { name: product.name.slice(0, 250) },
          },
        });
      }

      const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;

      const metadata: Record<string, string> = {
        kind: "product",
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        customer_notes: asString(body.notes, 480),
      };

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: lineItems,
        customer_email: customer.email,
        client_reference_id: `product-${Date.now().toString(36)}`,
        billing_address_collection: "auto",
        shipping_address_collection: { allowed_countries: ["AU"] },
        phone_number_collection: { enabled: true },
        ...(shipping > 0
          ? {
              shipping_options: [
                {
                  shipping_rate_data: {
                    type: "fixed_amount" as const,
                    fixed_amount: { amount: shipping, currency: "aud" },
                    display_name: "Standard shipping · 2 business days",
                  },
                },
              ],
            }
          : {}),
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout?canceled=1`,
        metadata,
        payment_intent_data: {
          metadata,
          description: "Shelley's store order",
        },
      });

      if (!session.url) {
        throw new HttpError(502, "Stripe did not return a payment page. Please try again.");
      }

      return Response.json({ url: session.url });
    }

    const serviceId = asString(body.serviceId, 160);
    if (!ID_PATTERN.test(serviceId)) {
      throw new HttpError(400, "Choose a treatment before paying.");
    }

    const service = await getService(serviceId);
    if (!service) {
      throw new HttpError(404, "That treatment could not be found.");
    }

    const unitAmount = cents(service.price);
    if (unitAmount < 50) {
      throw new HttpError(400, "This treatment is not available for online payment yet.");
    }

    const preferredDate = asString(body.preferredDate, 80);
    const notes = asString(body.notes, 480);

    const metadata: Record<string, string> = {
      kind: "service",
      service_id: service.id,
      service_name: service.name.slice(0, 200),
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      preferred_date: preferredDate,
      notes,
    };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "aud",
            unit_amount: unitAmount,
            product_data: {
              name: `${service.name} · ${service.duration} min`.slice(0, 250),
            },
          },
        },
      ],
      customer_email: customer.email,
      client_reference_id: `service-${Date.now().toString(36)}`,
      billing_address_collection: "auto",
      phone_number_collection: { enabled: true },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/service/${service.slug}?canceled=1`,
      metadata,
      payment_intent_data: {
        metadata,
        description: `Treatment booking · ${service.name}`,
      },
    });

    if (!session.url) {
      throw new HttpError(502, "Stripe did not return a payment page. Please try again.");
    }

    return Response.json({ url: session.url });
  } catch (error) {
    return errorResponse(error);
  }
}
