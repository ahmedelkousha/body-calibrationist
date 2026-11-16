export type OrderKind = "product" | "service";

export type OrderStatus = "paid" | "partially_refunded" | "refunded" | "pending";

export type RefundReason = "duplicate" | "fraudulent" | "requested_by_customer";

export type OrderItem = {
  name: string;
  quantity: number;
  /** Unit price in the smallest currency unit (cents). */
  unitAmount: number;
  /** Line total in the smallest currency unit (cents). */
  amountTotal: number;
};

export type OrderShipping = {
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

/**
 * An order as shown in the dashboard. Stripe is the source of truth for
 * payments and refunds, so this shape is built from a Checkout Session and
 * is never stored in Firestore.
 */
export type StudioOrder = {
  id: string;
  kind: OrderKind;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  /** Total charged, in cents. */
  amountTotal: number;
  /** Amount already refunded, in cents. */
  amountRefunded: number;
  /** Amount still available to refund, in cents. */
  amountRemaining: number;
  currency: string;
  status: OrderStatus;
  paymentIntentId: string;
  items: OrderItem[];
  shipping: OrderShipping | null;
  preferredDate: string;
  notes: string;
  receiptUrl: string;
  dashboardUrl: string;
};
