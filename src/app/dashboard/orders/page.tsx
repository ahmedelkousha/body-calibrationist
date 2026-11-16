import OrdersManager from "@/components/dashboard/OrdersManager";

export const dynamic = "force-dynamic";

export const metadata = { title: "Orders | Dashboard" };

export default function OrdersPage() {
  return <OrdersManager />;
}
