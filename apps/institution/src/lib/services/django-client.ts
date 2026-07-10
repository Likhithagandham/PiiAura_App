/**
 * Authenticated Django API client — the keystone every module's service twin uses.
 *
 * Route handlers run server-side (BFF). They hold the user's access token in an httpOnly
 * cookie; this client reads it, calls Django with `Authorization: Bearer`, unwraps the
 * standard `{ success, data, message }` envelope, and normalizes errors. On a 401 it does a
 * single silent refresh against /auth/refresh and retries once.
 *
 * Usage in a route handler:
 *   const data = await djangoGet<Branch[]>(request, "/api/v1/organizations/branches/");
 */

import {
  getAccessTokenFromRequest,
  getRefreshTokenFromRequest,
  setRequestAccessToken,
} from "@/lib/auth/cookies";
import { refreshOnce } from "@/lib/auth/session";
import { getApiBaseUrl } from "@/lib/config";

export class DjangoApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly fieldErrors?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "DjangoApiError";
  }
}

interface Envelope<T> {
  success?: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, unknown>;
}

async function rawFetch(
  accessToken: string | null,
  path: string,
  init: RequestInit,
): Promise<Response> {
  return fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init.headers,
    },
  });
}

/**
 * Core authenticated call. Returns the unwrapped `data`; throws `DjangoApiError` on failure.
 */
export async function djangoRequest<T>(
  request: Request,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  let accessToken = getAccessTokenFromRequest(request);
  let res = await rawFetch(accessToken, path, init);

  // Silent refresh on 401, retry once. Uses the shared coalesced+memoised refresh so
  // a single-use refresh token is never exchanged twice (which the backend treats as
  // a replay attack → family revoke → logout). The fresh access token is threaded
  // onto the request so any further Django calls in this request reuse it.
  if (res.status === 401) {
    const refreshToken = getRefreshTokenFromRequest(request);
    if (refreshToken) {
      const tokens = await refreshOnce(refreshToken);
      if (tokens) {
        accessToken = tokens.accessToken;
        setRequestAccessToken(request, accessToken);
        res = await rawFetch(accessToken, path, init);
      }
    }
  }

  const body = (await res.json().catch(() => ({}))) as Envelope<T>;
  if (!res.ok) {
    throw new DjangoApiError(
      body.message ?? (body as Record<string, unknown>).error as string | undefined ?? `Request failed (${res.status})`,
      res.status,
      body.errors,
    );
  }
  return (body.data ?? (body as unknown)) as T;
}

export function djangoGet<T>(request: Request, path: string, init?: RequestInit): Promise<T> {
  return djangoRequest<T>(request, path, { method: "GET", ...init });
}

export function djangoSend<T>(
  request: Request,
  path: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  payload?: unknown,
  extraHeaders?: Record<string, string>,
): Promise<T> {
  return djangoRequest<T>(request, path, {
    method,
    body: payload === undefined ? undefined : JSON.stringify(payload),
    headers: extraHeaders,
  });
}

/**
 * Like djangoSend but never throws on non-2xx — returns `{ ok, status, data }` with the
 * unwrapped envelope `data`. Use for confirm-flows (e.g. enroll) where the 4xx body
 * carries information the UI needs (duplicate matches, parent-link confirmation).
 */
export async function djangoRaw<T = unknown>(
  request: Request,
  path: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  payload?: unknown,
): Promise<{ ok: boolean; status: number; data: T }> {
  let accessToken = getAccessTokenFromRequest(request);
  const init: RequestInit = {
    method,
    body: payload === undefined ? undefined : JSON.stringify(payload),
  };
  let res = await rawFetch(accessToken, path, init);
  if (res.status === 401) {
    const refreshToken = getRefreshTokenFromRequest(request);
    if (refreshToken) {
      const tokens = await refreshOnce(refreshToken);
      if (tokens) {
        accessToken = tokens.accessToken;
        setRequestAccessToken(request, accessToken);
        res = await rawFetch(accessToken, path, init);
      }
    }
  }
  const body = (await res.json().catch(() => ({}))) as Envelope<T>;
  return { ok: res.ok, status: res.status, data: (body.data ?? (body as unknown)) as T };
}
