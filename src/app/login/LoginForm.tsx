"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { getClientAuth, isFirebaseConfigured } from "@/lib/firebase/client";

const FRIENDLY_ERRORS: Record<string, string> = {
  "auth/invalid-credential": "That email and password combination is not correct.",
  "auth/wrong-password": "That password is not correct.",
  "auth/user-not-found": "No studio account uses that email address.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/missing-password": "Please enter your password.",
  "auth/user-disabled": "This account has been disabled. Contact the studio owner.",
  "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
  "auth/network-request-failed": "Could not reach Firebase. Check your connection and try again.",
  "auth/operation-not-allowed":
    "Email/password sign-in is disabled in this Firebase project. Enable it under Authentication → Sign-in method.",
  "auth/configuration-not-found":
    "Firebase Authentication is not set up for this project. Enable Email/Password in the Firebase console.",
  "auth/unauthorized-domain":
    "This domain is not authorised for Firebase sign-in. Add it under Authentication → Settings → Authorized domains.",
  "auth/invalid-api-key": "The Firebase web API key is not valid. Check NEXT_PUBLIC_FIREBASE_API_KEY.",
};

function messageFor(code: string): string {
  return FRIENDLY_ERRORS[code] ?? "We couldn't sign you in. Check your email and password and try again.";
}

function errorCode(caught: unknown): string {
  if (caught && typeof caught === "object" && "code" in caught) {
    return String((caught as { code?: unknown }).code ?? "");
  }
  return "";
}

export default function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // If the SDK already restores a session, skip the form entirely.
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    return onAuthStateChanged(getClientAuth(), (user) => {
      if (user) router.replace(next);
    });
  }, [router, next]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;

    if (!isFirebaseConfigured) {
      setError(
        "Firebase Authentication is not configured. Add NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID to .env.local, then restart the dev server.",
      );
      return;
    }

    setBusy(true);
    setError("");

    try {
      await signInWithEmailAndPassword(getClientAuth(), email.trim(), password);
      router.replace(next);
    } catch (caught) {
      setError(messageFor(errorCode(caught)));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <div>
        <label htmlFor="email" className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-ink-soft">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="shelley@bodycalibrationist.com"
          className="w-full rounded-xl border border-sand bg-white/80 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink-soft/50 focus:border-teal focus:ring-2 focus:ring-teal/10"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-ink-soft">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Your password"
            className="w-full rounded-xl border border-sand bg-white/80 px-4 py-3 pr-20 text-sm text-ink outline-none transition placeholder:text-ink-soft/50 focus:border-teal focus:ring-2 focus:ring-teal/10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute inset-y-0 right-3 my-auto h-7 rounded-full px-2 text-[10px] uppercase tracking-[0.14em] text-ink-soft transition hover:text-teal"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-relaxed text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-teal px-6 py-3.5 text-[11px] uppercase tracking-[0.2em] text-cream transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center text-[11px] leading-relaxed text-ink-soft">
        Sign-in is handled entirely by Firebase Authentication in your browser. Anyone with an account in this Firebase
        project can open the dashboard, so keep the user list limited to studio staff.
      </p>
    </form>
  );
}
