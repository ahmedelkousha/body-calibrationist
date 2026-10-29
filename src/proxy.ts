import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic guard for the dashboard. It only checks that the Firebase session
 * cookie is present; the dashboard layout and every protected API route verify
 * the cookie properly with the Firebase Admin SDK.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has("__session")) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
