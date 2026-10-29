"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSessionAction } from "./actions";

const FRIENDLY_ERRORS: Record<string, string> = {
  EMAIL_NOT_FOUND: "No studio account uses that email address.",
  INVALID_PASSWORD: "That password is not correct.",
  INVALID_LOGIN_CREDENTIALS: "That email and password combination is not correct.",
  INVALID_EMAIL: "Please enter a valid email address.",
  MISSING_PASSWORD: "Please enter your password.",
  USER_DISABLED: "This account has been disabled. Contact the studio owner.",
  TOO_MANY_ATTEMPTS_TRY_LATER: "Too many attempts. Please wait a few minutes and try again.",
  OPERATION_NOT_ALLOWED:
    "Email/password sign-in is disabled in this Firebase project. Enable it under Authentication → Sign-in method.",
};

function messageFor(code: string): string {
  return FRIENDLY_ERRORS[code] ?? "We couldn't sign you in. Check your email and password and try again.";
}

export default function LoginForm({ apiKey, next }: { apiKey: string; next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setError("");

    try {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            password,
            returnSecureToken: true,
          }),
        },
      );

      const data = (await response.json()) as {
        idToken?: string;
        error?: { message?: string };
      };

      if (!response.ok || !data.idToken) {
        throw new Error(data.error?.message ?? "SIGN_IN_FAILED");
      }

      const session = await createSessionAction(data.idToken);
      if (!session.ok) throw new Error(session.error);

      router.replace(next);
      router.refresh();
    } catch (caught) {
      const raw = caught instanceof Error ? caught.message : "SIGN_IN_FAILED";
      setError(messageFor(raw));
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
        Access is limited to studio accounts created in Firebase Authentication. Need access? Ask the studio owner to
        add your email.
      </p>
    </form>
  );
}
