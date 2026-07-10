/**
 * Browser-side fetch helper for the BFF `/api/*` routes.
 *
 * Every client component that reads data should go through this (usually via a
 * `useQuery` in `@/lib/queries`) so cookie handling and error unwrapping stay
 * consistent. It always sends credentials (httpOnly auth cookie) and throws
 * `ApiError` on non-2xx so TanStack Query can surface `error`.
 *
 * Mirrors apps/institution/src/lib/api-client.ts — kept as a platform-local
 * copy rather than a shared package export since only one app needs it today.
 */

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseBody(res: Response): Promise<unknown> {
  return res.json().catch(() => null);
}

/** GET a BFF route and return the parsed JSON, throwing `ApiError` on failure. */
export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: "include", ...init });
  const body = await parseBody(res);
  if (!res.ok) {
    const message =
      (body as { error?: string } | null)?.error ?? `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }
  return body as T;
}

/** Send a write (POST/PATCH/PUT/DELETE) to a BFF route. */
export async function apiSend<T>(
  path: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  payload?: unknown,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(path, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
    body: payload === undefined ? undefined : JSON.stringify(payload),
    ...init,
  });
  const body = await parseBody(res);
  if (!res.ok) {
    const message =
      (body as { error?: string } | null)?.error ?? `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }
  return body as T;
}
