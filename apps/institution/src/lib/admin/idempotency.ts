import { NextResponse } from "next/server";

const cache = new Map<string, { body: unknown; status: number; at: number }>();

const TTL_MS = 24 * 60 * 60 * 1000;

export function withIdempotency(
  request: Request,
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  const key = request.headers.get("Idempotency-Key")?.trim();
  if (!key) return handler();

  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) {
    return Promise.resolve(NextResponse.json(hit.body, { status: hit.status }));
  }

  return handler().then(async (response) => {
    const body = await response.clone().json().catch(() => ({}));
    cache.set(key, { body, status: response.status, at: Date.now() });
    return response;
  });
}
