import { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/config";
import { applySessionCookies, resolveAuthSession } from "@/lib/auth/session";
import { getAccessTokenFromRequest } from "@/lib/auth/cookies";

function unwrapEnvelope<T>(body: unknown): { ok: true; data: T } | { ok: false; message: string; status?: number } {
  if (!body || typeof body !== "object") return { ok: false, message: "Invalid backend response" };
  const record = body as Record<string, unknown>;
  if ("success" in record && record.success === true) {
    return { ok: true, data: record.data as T };
  }
  const message =
    (typeof record.message === "string" && record.message) ||
    (typeof (record as { error?: string }).error === "string" && (record as { error?: string }).error) ||
    "Request failed";
  return { ok: false, message };
}

async function djangoAuthedFetch(request: Request, path: string, init: RequestInit): Promise<Response> {
  const session = await resolveAuthSession(request);
  if (!session) {
    const res = NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    applySessionCookies(res, null);
    return res;
  }

  const accessToken = session.tokens?.accessToken ?? getAccessTokenFromRequest(request);
  if (!accessToken) {
    const res = NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    applySessionCookies(res, null);
    return res;
  }

  const upstream = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...init.headers,
    },
  });

  // Ensure rotated cookies are persisted to the browser.
  // If session.tokens is set, `resolveAuthSession` already refreshed and rotated.
  // We just need to copy those tokens into the response cookies we send back.
  // (If no rotation happened, this is a no-op.)
  const bodyText = await upstream.text();
  const response = NextResponse.json(
    bodyText ? JSON.parse(bodyText) : {},
    { status: upstream.status },
  );
  applySessionCookies(response, session);
  return response;
}

export async function GET(request: Request) {
  const upstream = await djangoAuthedFetch(request, "/api/v1/auth/me/walkthroughs/", { method: "GET" });
  if (!upstream.ok) return upstream;
  const json = await upstream.json().catch(() => ({}));
  const unwrapped = unwrapEnvelope<{ completed: string[] }>(json);
  if (!unwrapped.ok) return NextResponse.json({ error: unwrapped.message }, { status: 502 });
  return NextResponse.json({ completed: unwrapped.data.completed ?? [] });
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const upstream = await djangoAuthedFetch(request, "/api/v1/auth/me/walkthroughs/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!upstream.ok) return upstream;
  const json = await upstream.json().catch(() => ({}));
  const unwrapped = unwrapEnvelope<{ completed: string[] }>(json);
  if (!unwrapped.ok) return NextResponse.json({ error: unwrapped.message }, { status: 502 });
  return NextResponse.json({ completed: unwrapped.data.completed ?? [] });
}

