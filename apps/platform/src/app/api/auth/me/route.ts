import { NextResponse } from "next/server";
import { applySessionCookies, resolveAuthSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  const session = await resolveAuthSession(request);
  const response = NextResponse.json({ user: session?.user ?? null });
  applySessionCookies(response, session, { clearOnNull: false });
  return response;
}
