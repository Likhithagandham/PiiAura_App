import { NextResponse } from "next/server";

/**
 * Append Cache-Control headers to an existing NextResponse.
 *
 * Use "private" for all authenticated endpoints so browser-level HTTP caching
 * applies but CDNs / shared caches are excluded.
 *
 * TTL guide:
 *   60   — dashboard stats, summaries (change within minutes)
 *   300  — timetables, class lists, fee structures (change rarely)
 *   3600 — tenant config, holidays (change very rarely)
 *   0    — live data, financial transactions (no-store)
 */
export function withCache<T>(response: NextResponse<T>, maxAgeSeconds: number): NextResponse<T> {
  if (maxAgeSeconds <= 0) {
    response.headers.set("Cache-Control", "no-store, no-cache");
  } else {
    response.headers.set(
      "Cache-Control",
      `private, max-age=${maxAgeSeconds}, stale-while-revalidate=${maxAgeSeconds * 2}`,
    );
  }
  return response;
}

export function jsonCached<T>(data: T, maxAgeSeconds: number, init?: ResponseInit): NextResponse<T> {
  return withCache(NextResponse.json(data, init), maxAgeSeconds);
}
