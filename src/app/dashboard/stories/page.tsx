import { resourceConfigs } from "@/lib/resource-config";
import ResourceManager from "@/components/dashboard/ResourceManager";

export const dynamic = "force-dynamic";

export const metadata = { title: "Transformation stories | Dashboard" };

export default function Page() {
  return (
    <>
      <p className="text-[10px] uppercase tracking-[0.28em] text-gold">Website</p>
      <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">Transformation stories</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
        Client stories shown on the homepage carousel and the stories page.
      </p>
      <ResourceManager config={resourceConfigs.stories} />
    </>
  );
}
