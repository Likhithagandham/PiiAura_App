import { AUTH_ROUTES } from "@eduos/constants";
import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/auth/cookies";

/** Clears stale auth cookies and redirects to login (Route Handlers may modify cookies). */
export async function GET(request: Request) {
  const loginUrl = new URL(AUTH_ROUTES.login, request.url);
  const response = NextResponse.redirect(loginUrl);
  clearAuthCookies(response);
  return response;
}
