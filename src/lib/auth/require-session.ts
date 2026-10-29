import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { getSession, type SessionUser } from "./session";

/** Server-component guard: redirects unauthenticated visitors to the login page. */
export async function requireSession(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect("/login");
  return user;
}

/** Route-handler guard: returns the user, or null when the request is anonymous. */
export async function requireApiUser(): Promise<SessionUser | null> {
  return getSession();
}

export function unauthorizedResponse(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
