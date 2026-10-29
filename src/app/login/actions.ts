"use server";

import { redirect } from "next/navigation";
import { hasFirebaseLoginConfig } from "@/lib/auth/config";
import {
  createSessionCookie,
  clearSession,
  setSessionCookie,
  verifyIdToken,
} from "@/lib/auth/session";

export type SessionActionState = { ok: true } | { ok: false; error: string };

/**
 * Called by the login form after Firebase's REST sign-in succeeds. The ID token
 * is exchanged for a five-day, httpOnly session cookie.
 */
export async function createSessionAction(idToken: string): Promise<SessionActionState> {
  if (!idToken) return { ok: false, error: "Missing sign-in token." };
  if (!hasFirebaseLoginConfig()) {
    return { ok: false, error: "Firebase Authentication is not configured yet." };
  }

  try {
    await verifyIdToken(idToken);

    const value = await createSessionCookie(idToken);
    await setSessionCookie(value);
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not create a session. Please try again." };
  }
}

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/login");
}
