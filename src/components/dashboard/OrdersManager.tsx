"use client";

import { useEffect, useState } from "react";
import type { OrderKind, OrderStatus, RefundReason, StudioOrder } from "@/lib/stripe/types";
import { cn, formatDateShort, formatPrice } from "@/lib/utils";
import { useAuth } from "./AuthProvider";
import { RefreshIcon } from "@/components/icons";

type Tab = "all" | OrderKind;

const tabs: { key: Tab; label: string }[] = [
  { key: "all", label: "All orders" },
  { key: "product", label: "Products" },
  { key: "service", label: "Services" },
];

const statusStyles: Record<OrderStatus, string> = {
  paid: "bg-emerald-50 text-emerald-700",
  partially_refunded: "bg-amber-50 text-amber-800",
  refunded: "bg-rose-50 text-rose-700",
  pending: "bg-slate-100 text-slate-600",
};

const statusLabels: Record<OrderStatus, string> = {
  paid: "Paid",
  partially_refunded: "Partially refunded",
  refunded: "Refunded",
  pending: "Pending",
};

function money(cents: number): string {
  return formatPrice(cents / 100);
}

function StatusPill({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[9px] uppercase tracking-[0.14em]",
        statusStyles[status],
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

export default function OrdersManager() {
  const [tab, setTab] = useState<Tab>("all");

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-gold">Commerce</p>
          <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">Orders</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Product sales and treatment bookings paid through Stripe. Refunds are issued to the original
            card and recorded in Stripe.
          </p>
        </div>
      </div>

      <div className="mt-7 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={cn(
              "rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.14em] transition",
              tab === item.key
                ? "border-teal bg-teal text-cream"
                : "border-sand bg-white/60 text-ink-soft hover:border-teal hover:text-teal",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <OrderList key={tab} kind={tab} />
    </>
  );
}

function OrderList({ kind }: { kind: Tab }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<StudioOrder[] | null>(null);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refunding, setRefunding] = useState<StudioOrder | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function load() {
      setIsRefreshing(true);
      try {
        const token = await user!.getIdToken();
        const minDelay = new Promise((resolve) => setTimeout(resolve, 600));
        const [response] = await Promise.all([
          fetch(`/api/stripe/orders?kind=${kind}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          }),
          minDelay,
        ]);
        const data = (await response.json().catch(() => ({}))) as {
          orders?: StudioOrder[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error || "Could not load orders.");
        }

        if (!cancelled) {
          setOrders(data.orders ?? []);
          setError("");
        }
      } catch (caught) {
        if (!cancelled) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Could not load orders. Check the Stripe and Firebase configuration.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsRefreshing(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [user, kind, refresh]);

  if (error && orders === null) {
    return (
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-10 text-center">
        <p className="font-display text-2xl text-ink">Stripe orders could not be loaded</p>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-ink-soft">{error}</p>
        <button
          type="button"
          onClick={() => setRefresh((value) => value + 1)}
          disabled={isRefreshing}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-teal px-5 py-2.5 text-[11px] uppercase tracking-[0.14em] text-cream hover:bg-ink disabled:opacity-60"
        >
          <RefreshIcon className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          <span>{isRefreshing ? "Refreshing…" : "Try again"}</span>
        </button>
      </div>
    );
  }

  if (orders === null) {
    return (
      <div className="mt-10 flex min-h-[30vh] flex-col items-center justify-center text-center">
        <span className="h-1 w-32 overflow-hidden rounded-full bg-sand/70">
          <span className="block h-full w-1/2 animate-pulse rounded-full bg-teal/60" />
        </span>
        <p className="mt-4 text-[10px] uppercase tracking-[0.24em] text-ink-soft">
          Reading payments from Stripe…
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] text-ink-soft">
          {orders.length} {orders.length === 1 ? "order" : "orders"} · newest first
        </p>
        <button
          type="button"
          onClick={() => setRefresh((value) => value + 1)}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 rounded-full border border-sand bg-white/60 px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-ink-soft transition hover:border-teal hover:text-teal disabled:opacity-60"
        >
          <RefreshIcon className={cn("h-4 w-4", isRefreshing && "animate-spin text-teal")} />
          <span>{isRefreshing ? "Refreshing…" : "Refresh"}</span>
        </button>
      </div>

      {notice && (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
          {notice}
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          {error}
        </p>
      )}

      {orders.length === 0 ? (
        <div className="mt-4 rounded-[2rem] border border-dashed border-sand py-16 text-center">
          <p className="font-display text-2xl text-ink">No orders here yet</p>
          <p className="mt-2 text-sm text-ink-soft">
            {kind === "service"
              ? "Treatment bookings will appear as soon as a client pays."
              : kind === "product"
                ? "Store orders will appear as soon as a client pays."
                : "Paid product orders and treatment bookings will appear here."}
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <article className="rounded-2xl border border-sand/60 bg-white/70 p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-gold">
                        {order.kind === "service" ? "Treatment booking" : "Store order"}
                      </p>
                      <span className="rounded-full bg-cream-deep px-2.5 py-0.5 text-[9px] uppercase tracking-[0.12em] text-ink-soft">
                        {order.kind === "service" ? "Service" : "Product"}
                      </span>
                    </div>
                    <h2 className="mt-1 font-display text-xl text-ink">
                      {order.customerName || "Guest"}
                    </h2>
                    <p className="text-[11px] text-ink-soft">
                      {order.customerEmail}
                      {order.customerPhone ? ` · ${order.customerPhone}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusPill status={order.status} />
                    <p className="mt-2 text-[11px] text-ink-soft">{formatDateShort(order.createdAt)}</p>
                    <p className="mt-0.5 break-all font-mono text-[10px] text-ink-soft/80">
                      {order.id.slice(-12)}
                    </p>
                  </div>
                </div>

                <ul className="mt-4 space-y-2 border-t border-sand/60 pt-4">
                  {order.items.map((item, index) => (
                    <li key={`${item.name}-${index}`} className="flex items-start justify-between gap-4 text-sm">
                      <span className="text-ink">
                        {item.name}
                        {item.quantity > 1 ? (
                          <span className="text-ink-soft"> × {item.quantity}</span>
                        ) : null}
                      </span>
                      <span className="whitespace-nowrap text-ink">{money(item.amountTotal)}</span>
                    </li>
                  ))}
                </ul>

                {order.kind === "service" && order.preferredDate && (
                  <p className="mt-3 text-[11px] text-ink-soft">
                    Preferred time: <span className="text-ink">{order.preferredDate}</span>
                  </p>
                )}

                {order.notes && (
                  <p className="mt-3 rounded-xl bg-cream-deep/60 px-3 py-2 text-[11px] leading-relaxed text-ink-soft">
                    {order.notes}
                  </p>
                )}

                {order.shipping && (
                  <p className="mt-3 text-[11px] leading-relaxed text-ink-soft">
                    Ship to:{" "}
                    <span className="text-ink">
                      {[
                        order.shipping.name,
                        order.shipping.line1,
                        order.shipping.line2,
                        order.shipping.city,
                        order.shipping.state,
                        order.shipping.postalCode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-sand/60 pt-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-ink-soft">Total charged</p>
                    <p className="font-display text-2xl text-ink">{money(order.amountTotal)}</p>
                    {order.amountRefunded > 0 && (
                      <p className="text-[11px] text-rose-700">
                        {money(order.amountRefunded)} refunded · {money(order.amountRemaining)} remaining
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {order.receiptUrl && (
                      <a
                        href={order.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-sand bg-white/60 px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-ink-soft transition hover:border-teal hover:text-teal"
                      >
                        Receipt
                      </a>
                    )}
                    <a
                      href={order.dashboardUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-sand bg-white/60 px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-ink-soft transition hover:border-teal hover:text-teal"
                    >
                      Open in Stripe
                    </a>
                    {order.amountRemaining > 0 && order.paymentIntentId && (
                      <button
                        type="button"
                        onClick={() => setRefunding(order)}
                        className="rounded-full bg-teal px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-cream transition hover:bg-ink"
                      >
                        Refund
                      </button>
                    )}
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}

      {refunding && (
        <RefundDialog
          order={refunding}
          onClose={() => setRefunding(null)}
          onDone={(message) => {
            setRefunding(null);
            setNotice(message);
            setRefresh((value) => value + 1);
          }}
        />
      )}
    </div>
  );
}

function RefundDialog({
  order,
  onClose,
  onDone,
}: {
  order: StudioOrder;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const { user } = useAuth();
  const [amount, setAmount] = useState((order.amountRemaining / 100).toFixed(2));
  const [reason, setReason] = useState<RefundReason>("requested_by_customer");
  const [status, setStatus] = useState<"idle" | "sending">("idle");
  const [error, setError] = useState("");

  const cents = Math.round(Number(amount) * 100);
  const valid =
    Number.isFinite(cents) &&
    cents >= 50 &&
    cents <= order.amountRemaining &&
    order.amountRemaining > 0;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && status === "idle") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, status]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!valid || !user || status === "sending") return;

    setStatus("sending");
    setError("");

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/stripe/refund", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentIntentId: order.paymentIntentId,
          amount: cents,
          reason,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        refund?: { id: string; amount: number; status: string | null };
        error?: string;
      };

      if (!response.ok || !data.refund) {
        throw new Error(data.error || "Stripe could not issue that refund.");
      }

      onDone(
        `${money(data.refund.amount)} refunded to ${order.customerName || "the customer"}. It usually appears within 5–10 business days.`,
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Stripe could not issue that refund.");
      setStatus("idle");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/45 px-4 py-6 backdrop-blur-sm sm:items-center"
      onClick={() => status === "idle" && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="refund-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-[1.75rem] border border-sand/70 bg-cream p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-gold">Refund payment</p>
            <h2 id="refund-title" className="mt-1 font-display text-2xl text-ink">
              {order.customerName || "Customer"}
            </h2>
            <p className="mt-1 text-[11px] text-ink-soft">
              {order.items.map((item) => item.name).join(", ") || "Order"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={status === "sending"}
            className="rounded-full border border-sand px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-ink-soft transition hover:border-ink hover:text-ink disabled:opacity-50"
          >
            Close
          </button>
        </div>

        <form onSubmit={submit} className="mt-5">
          <div className="rounded-xl bg-white/70 px-4 py-3 text-sm text-ink-soft">
            <div className="flex justify-between">
              <span>Total charged</span>
              <span className="text-ink">{money(order.amountTotal)}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span>Already refunded</span>
              <span className="text-ink">{money(order.amountRefunded)}</span>
            </div>
            <div className="mt-1 flex justify-between font-medium">
              <span>Refundable</span>
              <span className="text-ink">{money(order.amountRemaining)}</span>
            </div>
          </div>

          <label className="mt-4 block text-[10px] uppercase tracking-[0.14em] text-ink-soft">
            Refund amount (AUD)
            <input
              type="number"
              min="0.50"
              max={(order.amountRemaining / 100).toFixed(2)}
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm text-ink outline-none focus:border-teal"
            />
          </label>

          <label className="mt-3 block text-[10px] uppercase tracking-[0.14em] text-ink-soft">
            Reason
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value as RefundReason)}
              className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm text-ink outline-none focus:border-teal"
            >
              <option value="requested_by_customer">Requested by customer</option>
              <option value="duplicate">Duplicate</option>
              <option value="fraudulent">Fraudulent</option>
            </select>
          </label>

          {error && <p className="mt-3 text-xs leading-relaxed text-rose-700">{error}</p>}

          <p className="mt-3 text-[11px] leading-relaxed text-ink-soft">
            Refunds go back to the original card and are recorded in Stripe. This cannot be undone.
          </p>

          <button
            type="submit"
            disabled={!valid || status === "sending"}
            className="mt-5 w-full rounded-full bg-teal py-3.5 text-[11px] uppercase tracking-[0.18em] text-cream transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "sending" ? "Refunding…" : `Refund ${valid ? money(cents) : ""}`}
          </button>
        </form>
      </div>
    </div>
  );
}
