import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { hasFirebaseAdminConfig } from "@/lib/auth/config";

export const dynamic = "force-dynamic";

function FirebaseSetupNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-5 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-sand/70 bg-white/70 p-8 text-center shadow-sm sm:p-10">
        <span className="relative mx-auto block h-16 w-16 overflow-hidden rounded-full ring-1 ring-sand">
          <Image src="/logo.jpg" alt="Shelley's" fill sizes="64px" className="object-cover" />
        </span>
        <p className="mt-6 text-[10px] uppercase tracking-[0.28em] text-gold">Shelley&apos;s · Skin &amp; Body Studio</p>
        <h1 className="mt-2 font-display text-3xl text-ink">Connecting the studio</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          The site is ready, but its content lives in Cloud Firestore. Add the Firebase credentials to{" "}
          <code className="rounded bg-cream-deep px-1.5 py-0.5 text-[12px]">.env.local</code>, restart the server and
          load the starting content:
        </p>

        <pre className="mt-5 overflow-x-auto rounded-xl bg-ink px-4 py-3 text-left text-[12px] leading-relaxed text-cream">
          <code>npm run seed:firestore</code>
        </pre>

        <p className="mt-4 text-[11px] leading-relaxed text-ink-soft">
          You need <code className="rounded bg-cream-deep px-1 py-0.5">FIREBASE_PROJECT_ID</code>,{" "}
          <code className="rounded bg-cream-deep px-1 py-0.5">FIREBASE_CLIENT_EMAIL</code>,{" "}
          <code className="rounded bg-cream-deep px-1 py-0.5">FIREBASE_PRIVATE_KEY</code> and the public web API key.
        </p>

        <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="w-full rounded-full bg-teal px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-cream transition hover:bg-ink sm:w-auto"
          >
            View setup checklist
          </Link>
          <Link
            href="/"
            className="w-full rounded-full border border-sand px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-ink-soft transition hover:border-teal hover:text-teal sm:w-auto"
          >
            Try again
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  if (!hasFirebaseAdminConfig()) {
    return <FirebaseSetupNotice />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
