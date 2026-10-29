import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getFirebaseClientConfig,
  hasFirebaseAdminConfig,
  hasFirebaseLoginConfig,
} from "@/lib/auth/config";
import { getSession } from "@/lib/auth/session";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sign in",
  description: "Studio dashboard sign-in.",
  robots: { index: false, follow: false },
};

function safeNext(value: string | undefined): string {
  return value && value.startsWith("/dashboard") ? value : "/dashboard";
}

function envValue(name: string): string | undefined {
  return process.env[name];
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getSession();
  const params = await searchParams;
  const next = safeNext(params.next);

  if (user) redirect(next);

  const loginReady = hasFirebaseLoginConfig();
  const clientConfig = getFirebaseClientConfig();
  const adminReady = hasFirebaseAdminConfig();

  const missing = [
    !envValue("NEXT_PUBLIC_FIREBASE_API_KEY") && "NEXT_PUBLIC_FIREBASE_API_KEY",
    !envValue("NEXT_PUBLIC_FIREBASE_PROJECT_ID") &&
      !envValue("FIREBASE_PROJECT_ID") &&
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    !envValue("FIREBASE_CLIENT_EMAIL") && "FIREBASE_CLIENT_EMAIL",
    !envValue("FIREBASE_PRIVATE_KEY") && "FIREBASE_PRIVATE_KEY",
  ].filter(Boolean) as string[];

  return (
    <div className="grid min-h-screen bg-cream lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-teal px-12 py-14 text-cream lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full border border-cream/10" />
        <div className="pointer-events-none absolute -right-10 top-24 h-52 w-52 rounded-full border border-cream/10" />
        <div className="pointer-events-none absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-teal-light/30 blur-3xl" />

        <Link href="/" className="relative flex items-center gap-3">
          <span className="relative h-11 w-11 overflow-hidden rounded-full ring-1 ring-cream/25">
            <Image src="/logo.jpg" alt="Shelley's" fill sizes="44px" className="object-cover" />
          </span>
          <span>
            <span className="block font-display text-2xl leading-none">Shelley&apos;s</span>
            <span className="mt-1 block text-[8px] uppercase tracking-[0.3em] text-cream/50">
              Skin &amp; Body Studio
            </span>
          </span>
        </Link>

        <div className="relative max-w-md">
          <p className="text-[10px] uppercase tracking-[0.32em] text-gold-light">Studio manager</p>
          <h1 className="mt-5 font-display text-5xl leading-[1.04]">
            A quiet place to run the studio.
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-cream/70">
            Sign in to manage treatments, the store, the journal, workshops and every client enquiry — all from one
            calm dashboard.
          </p>
          <div className="mt-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.24em] text-cream/40">
            <span className="h-px w-8 bg-gold/60" />
            Est. 2018 · by the sea
          </div>
        </div>

        <p className="relative text-[10px] uppercase tracking-[0.24em] text-cream/35">
          Private studio access
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-10 flex items-center gap-3 lg:hidden">
            <span className="relative h-10 w-10 overflow-hidden rounded-full ring-1 ring-sand">
              <Image src="/logo.jpg" alt="Shelley's" fill sizes="40px" className="object-cover" />
            </span>
            <span>
              <span className="block font-display text-xl leading-none text-ink">Shelley&apos;s</span>
              <span className="mt-1 block text-[8px] uppercase tracking-[0.28em] text-ink-soft">
                Studio manager
              </span>
            </span>
          </Link>

          <p className="text-[10px] uppercase tracking-[0.28em] text-gold">Dashboard access</p>
          <h2 className="mt-2 font-display text-4xl text-ink">Welcome back</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {loginReady
              ? "Sign in with your Shelley's studio account."
              : "Firebase Authentication is not connected yet. Add the values below to enable sign-in."}
          </p>

          {loginReady && clientConfig ? (
            <LoginForm apiKey={clientConfig.apiKey} next={next} />
          ) : (
            <div className="mt-8 rounded-2xl border border-sand/80 bg-white/70 p-5">
              <h3 className="font-display text-xl text-ink">Finish the Firebase setup</h3>
              <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">
                Sign-in uses Firebase Authentication (email &amp; password). Add these values to{" "}
                <code className="rounded bg-cream-deep px-1.5 py-0.5 text-[11px] text-ink">.env.local</code>, then restart
                the dev server:
              </p>

              <ul className="mt-4 space-y-2">
                {[
                  "NEXT_PUBLIC_FIREBASE_API_KEY",
                  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
                  "FIREBASE_CLIENT_EMAIL",
                  "FIREBASE_PRIVATE_KEY",
                ].map((name) => {
                  const pending = missing.includes(name);
                  return (
                    <li key={name} className="flex items-center justify-between gap-3 text-[11px]">
                      <code className="truncate text-ink">{name}</code>
                      <span
                        className={
                          pending
                            ? "shrink-0 rounded-full bg-gold-light/60 px-2 py-0.5 text-[9px] uppercase tracking-[0.1em] text-ink"
                            : "shrink-0 rounded-full bg-sky-light px-2 py-0.5 text-[9px] uppercase tracking-[0.1em] text-teal"
                        }
                      >
                        {pending ? "Missing" : "Set"}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <p className="mt-4 text-[11px] leading-relaxed text-ink-soft">
                {adminReady
                  ? "Firestore is already connected with the Admin SDK. Add the public API key above to enable the sign-in form."
                  : "The dashboard stays locked until every value above is set. There is no local database fallback."}
              </p>
            </div>
          )}

          <div className="mt-10 flex items-center justify-between border-t border-sand/70 pt-5">
            <Link href="/" className="text-[10px] uppercase tracking-[0.16em] text-ink-soft transition hover:text-teal">
              ← Back to website
            </Link>
            <span className="text-[10px] uppercase tracking-[0.16em] text-ink-soft/60">
              {adminReady ? "Firestore connected" : "Firebase not configured"}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
