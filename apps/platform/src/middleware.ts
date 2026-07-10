import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PLATFORM_AUTH_COOKIE_NAMES } from "@eduos/constants";

const ACCESS_TOKEN_COOKIE = PLATFORM_AUTH_COOKIE_NAMES.accessToken; // "eduos_platform_access_token"

/**
 * Edge middleware — runs before page code executes.
 *
 * Checks for the platform access token cookie.  If missing and the path is
 * not a public route, redirects to /login.  JWT signature validation happens
 * in Django on every authenticated API call; this is a fast edge gate.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let auth routes, Next.js internals, and static files through.
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff2?)$/)
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(PLATFORM_AUTH_COOKIE_NAMES.refreshToken)?.value;

  if (accessToken || refreshToken) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirectTo", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
