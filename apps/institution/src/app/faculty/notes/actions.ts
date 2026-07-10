"use server";

import { cookies, headers } from "next/headers";
import type { FacultyNotesData } from "@eduos/types";
import { requireFaculty } from "@/lib/faculty/api";
import { getNotes } from "@/lib/services/faculty-server";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function buildRequest(): Promise<Request> {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const reqHeaders: Record<string, string> = { cookie: cookieHeader };
  const host = headerStore.get("host");
  if (host) reqHeaders.host = host;
  const tenant = headerStore.get("x-tenant-subdomain");
  if (tenant) reqHeaders["x-tenant-subdomain"] = tenant;
  return new Request("http://internal.local/faculty-notes", { headers: reqHeaders });
}

export async function loadNotesAction(): Promise<ActionResult<FacultyNotesData>> {
  const request = await buildRequest();
  const auth = await requireFaculty(request);
  if (!auth.ok) return { ok: false, error: "Unauthorized" };
  try {
    const ctx = {
      subdomain: auth.subdomain,
      facultyUserId: auth.facultyUserId,
      facultyName: auth.facultyName,
    };
    const data = (await getNotes(request, ctx)) as FacultyNotesData;
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to load notes." };
  }
}
