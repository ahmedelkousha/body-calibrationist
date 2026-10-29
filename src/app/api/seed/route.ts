import { NextResponse } from "next/server";
import { requireApiUser, unauthorizedResponse } from "@/lib/auth/require-session";
import { resetDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  const user = await requireApiUser();
  if (!user) return unauthorizedResponse();

  const db = await resetDb();
  return NextResponse.json({
    ok: true,
    counts: Object.fromEntries(Object.entries(db).map(([key, value]) => [key, value.length])),
  });
}
