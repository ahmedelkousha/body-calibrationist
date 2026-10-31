import Image from "next/image";
import Link from "next/link";
import { isFirebaseConfigured } from "@/lib/firebase/client";

export const metadata = { title: "Settings | Dashboard" };

export default function SettingsPage() {
  const firestoreConnected = isFirebaseConfigured !== null;
  const authConnected = firestoreConnected && isFirebaseConfigured;

  const integrations = [
    {
      name: "Firebase Authentication",
      status: authConnected ? "Connected" : "Not configured",
      description: authConnected
        ? "Dashboard sign-in uses the Firebase Web SDK (email & password) in the browser. The session is restored by the SDK on each visit, and Firestore Security Rules decide what a signed-in user may do."
        : "Add NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID to .env.local, then create the studio user in Firebase Authentication. The dashboard is locked until then.",
    },
    {
      name: "Firestore database",
      status: firestoreConnected ? "Connected" : "Not configured",
      description: firestoreConnected
        ? "The dashboard reads and writes Cloud Firestore directly from the browser through the Firebase Web SDK. Public pages are still rendered on the server (Admin SDK) so the site keeps its SEO and first paint. firestore.rules allows signed-in studio users to manage content and anonymous visitors to create an inquiry only."
        : "Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY, then run npm run seed:firestore to load seed/firestore-seed.json. There is no local database fallback.",
    },
    {
      name: "Stripe payments",
      status: "Demo mode",
      description:
        "The checkout flow is built and logs orders as inquiries. Connect a verified Stripe account and swap the placeholder form for Stripe Elements or a Checkout session.",
    },
    {
      name: "Apple Pay",
      status: "With Stripe",
      description:
        "Apple Pay is enabled automatically once Stripe is connected and the domain is verified in the Stripe dashboard.",
    },
    {
      name: "Contact & booking emails",
      status: firestoreConnected ? "Stored in Firestore" : "Not configured",
      description:
        "Inquiries are saved to the content database and appear in the dashboard. Add an email provider (Resend, Postmark) to also deliver them to the studio inbox.",
    },
    {
      name: "SEO & GEO",
      status: "Configured",
      description:
        "Metadata, Open Graph and structured content are set per page. Add your live domain to metadataBase in src/app/layout.tsx before launch.",
    },
  ];

  return (
    <>
      <p className="text-[10px] uppercase tracking-[0.28em] text-gold">Studio</p>
      <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">Settings</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
        Brand details, launch checklist and the integrations that connect this site to the wider business.
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-12">
        <section className="rounded-2xl border border-sand/60 bg-white/70 p-6 lg:col-span-5">
          <h2 className="font-display text-xl text-ink">Studio profile</h2>
          <div className="mt-5 flex items-center gap-4">
            <span className="relative h-16 w-16 overflow-hidden rounded-full ring-1 ring-sand">
              <Image src="/logo.jpg" alt="Shelley's logo" fill sizes="64px" className="object-cover" />
            </span>
            <div>
              <p className="font-display text-xl text-ink">Shelley&apos;s</p>
              <p className="text-[11px] uppercase tracking-[0.16em] text-ink-soft">Skin &amp; Body Studio</p>
            </div>
          </div>
          <dl className="mt-6 space-y-3 text-sm">
            {[
              ["Email", "hello@shelleys.studio"],
              ["Phone", "+61 400 218 664"],
              ["Studio", "14 Marine Parade, Studio 2"],
              ["Hours", "Tue – Sat, 9am – 6pm"],
              ["Currency", "AUD · Stripe"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 border-b border-sand/50 pb-2">
                <dt className="text-[10px] uppercase tracking-[0.14em] text-ink-soft">{label}</dt>
                <dd className="text-right text-ink">{value}</dd>
              </div>
            ))}
          </dl>
          <Link
            href="/contact"
            className="mt-5 inline-flex text-[10px] uppercase tracking-[0.16em] text-teal hover:text-ink"
          >
            View contact page →
          </Link>
        </section>

        <section className="rounded-2xl border border-sand/60 bg-white/70 p-6 lg:col-span-7">
          <h2 className="font-display text-xl text-ink">Integrations &amp; launch</h2>
          <ul className="mt-5 space-y-4">
            {integrations.map((integration) => (
              <li key={integration.name} className="border-b border-sand/50 pb-4 last:border-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-ink">{integration.name}</p>
                  <span className="rounded-full bg-cream-deep px-2.5 py-0.5 text-[9px] uppercase tracking-[0.12em] text-ink-soft">
                    {integration.status}
                  </span>
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{integration.description}</p>
              </li>
            ))}
          </ul>
        </section>

        
      </div>
    </>
  );
}
