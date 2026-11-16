import type { NextRequest } from "next/server";

export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export type StudioUser = {
  uid: string;
  email: string;
  name: string;
};

/**
 * Verifies the Firebase ID token sent by the dashboard.
 *
 * This uses the Identity Toolkit REST endpoint instead of firebase-admin:
 * the browser already owns the session, and the lookup gives the server
 * a trusted email/UID without needing a service-account key.
 */
export async function requireStudioUser(request: NextRequest): Promise<StudioUser> {
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header);

  if (!match) {
    throw new HttpError(401, "Sign in again to continue.");
  }

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new HttpError(503, "Firebase is not configured on the server.");
  }

  let response: Response;
  try {
    response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: match[1] }),
        cache: "no-store",
      },
    );
  } catch {
    throw new HttpError(502, "Could not verify your session. Check your connection and try again.");
  }

  if (!response.ok) {
    throw new HttpError(401, "Your session has expired. Sign in again.");
  }

  const payload = (await response.json()) as {
    users?: Array<{ localId?: string; email?: string; displayName?: string }>;
  };
  const user = payload.users?.[0];

  if (!user?.localId || !user.email) {
    throw new HttpError(401, "Your session has expired. Sign in again.");
  }

  return {
    uid: user.localId,
    email: user.email,
    name: user.displayName || user.email,
  };
}

