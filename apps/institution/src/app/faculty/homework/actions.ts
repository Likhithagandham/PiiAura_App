"use server";

import { cookies, headers } from "next/headers";
import type { DailyHomeworkEntry, FacultyHomeworkData, FacultySaveHomeworkInput } from "@eduos/types";
import { requireFaculty } from "@/lib/faculty/api";
import { deleteHomework, getHomework, saveHomework } from "@/lib/services/faculty-server";

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
  return new Request("http://internal.local/faculty-homework", { headers: reqHeaders });
}

export async function loadHomeworkAction(
  viewScope: "school" | "college",
): Promise<ActionResult<FacultyHomeworkData>> {
  const request = await buildRequest();
  const auth = await requireFaculty(request);
  if (!auth.ok) return { ok: false, error: "Unauthorized" };
  try {
    const ctx = {
      subdomain: auth.subdomain,
      facultyUserId: auth.facultyUserId,
      facultyName: auth.facultyName,
    };
    const data = (await getHomework(request, ctx, viewScope)) as FacultyHomeworkData;
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to load" };
  }
}

export async function deleteHomeworkAction(id: string): Promise<ActionResult<true>> {
  const request = await buildRequest();
  const auth = await requireFaculty(request);
  if (!auth.ok) return { ok: false, error: "Unauthorized" };
  try {
    const ctx = {
      subdomain: auth.subdomain,
      facultyUserId: auth.facultyUserId,
      facultyName: auth.facultyName,
    };
    await deleteHomework(request, ctx, id);
    return { ok: true, data: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Delete failed" };
  }
}

export async function saveHomeworkAction(
  body: FacultySaveHomeworkInput,
  viewScope: "school" | "college",
): Promise<ActionResult<DailyHomeworkEntry>> {
  const request = await buildRequest();
  const auth = await requireFaculty(request);
  if (!auth.ok) return { ok: false, error: "Unauthorized" };
  try {
    const ctx = {
      subdomain: auth.subdomain,
      facultyUserId: auth.facultyUserId,
      facultyName: auth.facultyName,
    };
    const entry = (await saveHomework(request, ctx, { ...body, viewScope } as never)) as DailyHomeworkEntry;
    return { ok: true, data: entry };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Request failed" };
  }
}
