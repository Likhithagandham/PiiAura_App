/**
 * Route bridge — thin wrapper for BFF route handlers calling Django directly.
 *
 * Usage:
 *   const data = await bridge(request, { path: "/api/v1/...", method: "POST", body });
 */

import { backendNotImplemented } from "./data-source";
import { djangoGet, djangoSend } from "./django-client";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export async function bridge<T>(
  request: Request,
  backend?: { path: string; method?: HttpMethod; body?: unknown; revalidate?: number | false },
): Promise<T> {
  if (!backend?.path) backendNotImplemented("API endpoint");
  const method = backend.method ?? "GET";
  if (method === "GET") {
    const init: RequestInit = backend.revalidate !== undefined 
      ? { next: { revalidate: backend.revalidate } } 
      : {};
    return djangoGet<T>(request, backend.path, init);
  }
  return djangoSend<T>(request, backend.path, method, backend.body);
}
