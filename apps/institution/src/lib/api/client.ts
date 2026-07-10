/**
 * Authenticated feature API client (BFF → Django).
 *
 * Phase-0 shared client every feature `http*Service` uses to call the Django API on behalf
 * of the signed-in user. It:
 *   - reads the access token from the request's httpOnly cookie and sends it as Bearer;
 *   - unwraps the standard `{ success, data, message, errors }` envelope;
 *   - silently refreshes on 401 (rotates tokens, retries once) and returns the new token
 *     pair so the route handler can re-set cookies via `applySessionCookies`;
 *   - forwards cross-cutting headers (Idempotency-Key, X-Step-Up-Verified) and lets callers
 *     pass cursor/query params in `path`.
 *
 * Usage in a route handler:
 *   const r = await apiFetch<LeaveListResponse>(request, "/hr/leave/list/");
 *   if (!r.ok) return NextResponse.json({ error: r.message }, { status: r.status });
 *   const res = NextResponse.json(r.data);
 *   if (r.tokens) setAuthCookies(res, r.tokens);   // tokens rotated → persist
 *   return res;
 */

import type { TokenPair } from "@eduos/types";
import {
  getAccessTokenFromRequest,
  getRefreshTokenFromRequest,
  setRequestAccessToken,
} from "@/lib/auth/cookies";
import { getApiBaseUrl } from "@/lib/config";
import { refreshOnce } from "@/lib/auth/session";

const API_PREFIX = "/api/v1";

export type ApiResult<T> =
  | { ok: true; data: T; tokens?: TokenPair }
  | { ok: false; status: number; message: string; errors?: Record<string, unknown> };

/** Headers we transparently forward from the incoming browser request to Django. */
const FORWARDED_HEADERS = ["idempotency-key", "x-step-up-verified", "x-request-id"] as const;

function buildHeaders(request: Request, accessToken: string | null, extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  for (const name of FORWARDED_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  return headers;
}

async function rawFetch(path: string, accessToken: string | null, request: Request, init?: RequestInit) {
  return fetch(`${getApiBaseUrl()}${API_PREFIX}${path}`, {
    ...init,
    headers: buildHeaders(request, accessToken, init?.headers),
  });
}

async function unwrap<T>(res: Response, tokens?: TokenPair): Promise<ApiResult<T>> {
  const body = await res.json().catch(() => ({}) as Record<string, unknown>);
  if (res.ok) {
    const data = (body && typeof body === "object" && "data" in body ? body.data : body) as T;
    return tokens ? { ok: true, data, tokens } : { ok: true, data };
  }
  const message =
    (body && typeof body === "object" && "message" in body && String(body.message)) ||
    `Request failed (${res.status})`;
  const errors =
    body && typeof body === "object" && "errors" in body
      ? (body.errors as Record<string, unknown>)
      : undefined;
  return { ok: false, status: res.status, message, errors };
}

/**
 * Call a Django `/api/v1` endpoint as the signed-in user. `path` should start with `/`
 * (after the `/api/v1` prefix), e.g. `/hr/leave/list/` or `/analytics/audit/?limit=20`.
 */
export async function apiFetch<T>(
  request: Request,
  path: string,
  init?: RequestInit,
): Promise<ApiResult<T>> {
  const accessToken = getAccessTokenFromRequest(request);
  let res = await rawFetch(path, accessToken, request, init);

  // Silent refresh on 401 (one attempt), then retry with the rotated access token.
  // Uses the shared coalesced+memoised refresh so a single-use refresh token is never
  // exchanged twice in one request (backend treats that as a replay → family revoke →
  // logout). Threads the fresh access token onto the request for later calls.
  if (res.status === 401) {
    const refreshToken = getRefreshTokenFromRequest(request);
    if (!refreshToken) return unwrap<T>(res);
    const tokens = await refreshOnce(refreshToken);
    if (!tokens) return unwrap<T>(res);
    setRequestAccessToken(request, tokens.accessToken);
    res = await rawFetch(path, tokens.accessToken, request, init);
    return unwrap<T>(res, tokens);
  }

  return unwrap<T>(res);
}

/** Convenience helpers. */
export const apiGet = <T>(request: Request, path: string) =>
  apiFetch<T>(request, path, { method: "GET" });

export const apiSend = <T>(request: Request, path: string, method: "POST" | "PATCH" | "PUT" | "DELETE", body?: unknown) =>
  apiFetch<T>(request, path, { method, body: body === undefined ? undefined : JSON.stringify(body) });
