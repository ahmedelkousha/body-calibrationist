import { cookies } from "next/headers";
import { getFirebaseAuth } from "@/lib/firebase/admin";

export const SESSION_COOKIE = "__session";
export const SESSION_MAX_AGE = 5 * 24 * 60 * 60; // five days, in seconds

export type SessionUser = {
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
};

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

/** Verifies a fresh Firebase ID token before a session cookie is issued. */
export async function verifyIdToken(idToken: string) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase Authentication is not configured");
  return auth.verifyIdToken(idToken, true);
}

/** Exchanges a Firebase ID token for a signed, httpOnly session cookie value. */
export async function createSessionCookie(idToken: string): Promise<string> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase Authentication is not configured");
  return auth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE * 1000 });
}

export async function setSessionCookie(value: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, value, { ...cookieOptions, maxAge: SESSION_MAX_AGE });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/**
 * Verifies the session on the server. Firebase session cookies are checked
 * against the Admin SDK, so a forged cookie cannot reach the dashboard or API.
 */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const auth = getFirebaseAuth();
  if (!auth) return null;

  try {
    const decoded = await auth.verifySessionCookie(token, true);
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      name: typeof decoded.name === "string" ? decoded.name : null,
      picture: typeof decoded.picture === "string" ? decoded.picture : null,
    };
  } catch {
    return null;
  }
}
