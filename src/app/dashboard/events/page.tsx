import { resourceConfigs } from "@/lib/resource-config";
import ResourceManager from "@/components/dashboard/ResourceManager";

export const dynamic = "force-dynamic";

export const metadata = { title: "Workshops & events | Dashboard" };

export default function Page() {
  return (
    <>
      <p className="text-[10px] uppercase tracking-[0.28em] text-gold">Website</p>
      <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">Workshops & events</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
        Upcoming workshops, capacity and how many places have been reserved.
      </p>
      <ResourceManager config={resourceConfigs.events} />
    </>
  );
}
