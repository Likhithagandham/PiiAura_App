import { AUTH_COOKIE_NAMES } from "@eduos/constants";
import type { InstitutionType, TokenPair } from "@eduos/types";

const isProd = process.env.NODE_ENV === "production";

export function setAuthCookies(
  response: { cookies: { set: (name: string, value: string, options: object) => void } },
  tokens: TokenPair,
  /** F-254 — optional non-secret institution type for client feature flags. */
  institutionType?: InstitutionType,
): void {
  const base = {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
  };

  response.cookies.set(AUTH_COOKIE_NAMES.accessToken, tokens.accessToken, {
    ...base,
    maxAge: 900, // 15 min — matches JWT ACCESS_TOKEN_LIFETIME
  });
  response.cookies.set(AUTH_COOKIE_NAMES.refreshToken, tokens.refreshToken, {
    ...base,
    maxAge: 60 * 60 * 24 * 7,
  });

  if (institutionType) {
    // Non-httpOnly so client code / middleware can read it for feature flags.
    response.cookies.set(AUTH_COOKIE_NAMES.institutionType, institutionType, {
      httpOnly: false,
      secure: isProd,
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }
}

export function clearAuthCookies(
  response: { cookies: { delete: (name: string) => void } },
): void {
  response.cookies.delete(AUTH_COOKIE_NAMES.accessToken);
  response.cookies.delete(AUTH_COOKIE_NAMES.refreshToken);
  response.cookies.delete(AUTH_COOKIE_NAMES.institutionType);
}

function readCookie(request: Request, name: string): string | null {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`${name}=([^;]+)`));
  return match?.[1] ?? null;
}

/**
 * Per-request "freshest access token" override.
 *
 * The cookie on the incoming `request` is immutable — but when the auth layer
 * refreshes an expired access token mid-request, the NEW token only lands on the
 * *response*. Without this, a later Django call in the same request would re-read
 * the stale request cookie, 401, and refresh the (single-use, already-rotated)
 * refresh token AGAIN — which the backend treats as a replay attack and revokes the
 * whole token family, force-logging the user out. Threading the fresh access token
 * here (keyed by the request object) lets every downstream Django call reuse it.
 */
const requestAccessOverride = new WeakMap<Request, string>();

export function setRequestAccessToken(request: Request, accessToken: string): void {
  requestAccessOverride.set(request, accessToken);
}

export function getAccessTokenFromRequest(request: Request): string | null {
  return requestAccessOverride.get(request) ?? readCookie(request, AUTH_COOKIE_NAMES.accessToken);
}

export function getRefreshTokenFromRequest(request: Request): string | null {
  return readCookie(request, AUTH_COOKIE_NAMES.refreshToken);
}

export function hasAuthCookies(request: Request): boolean {
  return Boolean(
    getAccessTokenFromRequest(request) || getRefreshTokenFromRequest(request),
  );
}
