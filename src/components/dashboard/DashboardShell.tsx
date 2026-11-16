"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import Sidebar from "./Sidebar";
import { AuthProvider, useAuth } from "./AuthProvider";
import { getClientDb, isFirebaseConfigured } from "@/lib/firebase/client";

function HoldingScreen({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f3ea] px-5">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="relative h-12 w-12 overflow-hidden rounded-full ring-1 ring-sand">
          <Image src="/logo.jpg" alt="Shelley's" fill sizes="48px" className="object-cover" />
        </span>
        <span className="h-1 w-32 overflow-hidden rounded-full bg-sand/70">
          <span className="block h-full w-1/2 animate-pulse rounded-full bg-teal/60" />
        </span>
        <p className="text-[10px] uppercase tracking-[0.24em] text-ink-soft">{label}</p>
      </div>
    </div>
  );
}

function SetupNotice({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f3ea] px-5 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-sand/70 bg-white/70 p-8 text-center shadow-sm">
        <p className="text-[10px] uppercase tracking-[0.28em] text-gold">Studio dashboard</p>
        <h1 className="mt-2 font-display text-3xl text-ink">Firebase is not connected</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{message}</p>
        <p className="mt-4 text-[11px] leading-relaxed text-ink-soft">
          The dashboard talks to Firebase Authentication and Cloud Firestore directly from the browser, so it needs
          the public <code className="rounded bg-cream-deep px-1 py-0.5">NEXT_PUBLIC_FIREBASE_*</code> values even
          when the public pages are rendered on the server.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-full bg-teal px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-cream transition hover:bg-ink"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}

function DashboardFrame({ children }: { children: React.ReactNode }) {
  const { user, loading, error } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [newInquiries, setNewInquiries] = useState(0);

  // No session cookie exists any more, so the redirect has to happen here,
  // once the SDK has finished restoring the persisted session.
  useEffect(() => {
    if (!loading && !error && !user) {
      const next = encodeURIComponent(pathname || "/dashboard");
      router.replace(`/login?next=${next}`);
    }
  }, [loading, error, user, router, pathname]);

  // Live badge for the sidebar. Rules allow this read for signed-in users only.
  useEffect(() => {
    if (!user || !isFirebaseConfigured) return;

    const unsubscribe = onSnapshot(
      query(collection(getClientDb(), "inquiries"), where("status", "==", "new")),
      (snapshot) => setNewInquiries(snapshot.size),
      () => setNewInquiries(0),
    );

    return unsubscribe;
  }, [user]);

  if (loading) return <HoldingScreen label="Checking your studio session…" />;
  if (error) return <SetupNotice message={error} />;
  if (!user) return <HoldingScreen label="Taking you to sign in…" />;

  return (
    <div className="min-h-screen bg-[#f7f3ea]">
      <Sidebar newInquiries={newInquiries} />
      <div className="lg:pl-72">
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-20 sm:px-8 lg:pt-10">{children}</div>
      </div>
    </div>
  );
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardFrame>{children}</DashboardFrame>
    </AuthProvider>
  );
}
