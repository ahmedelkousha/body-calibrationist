import { readDb } from "@/lib/db";
import { resourceConfigs } from "@/lib/resource-config";
import ResourceManager from "@/components/dashboard/ResourceManager";

export const dynamic = "force-dynamic";

export const metadata = { title: "Products | Dashboard" };

export default async function Page() {
  const db = await readDb();
  const config = resourceConfigs["products"];
  const items = db["products"] as unknown as (Record<string, unknown> & {
    id: string;
    slug: string;
    createdAt?: string;
  })[];

  return (
    <>
      <p className="text-[10px] uppercase tracking-[0.28em] text-gold">Store</p>
      <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">Products</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
        Manage the catalogue, pricing and stock. Low-stock items are flagged automatically.
      </p>
      <ResourceManager config={config} initialItems={items} />
    </>
  );
}