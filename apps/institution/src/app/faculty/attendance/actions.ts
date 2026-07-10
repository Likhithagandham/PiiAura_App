"use server";

import { cookies, headers } from "next/headers";
import type {
  AttendanceRecord,
  FacultyAttendanceData,
  FacultyMarkAttendanceInput,
} from "@eduos/types";
import { requireFaculty } from "@/lib/faculty/api";
import { djangoSend } from "@/lib/services/django-client";
import { getAttendance, markAttendance } from "@/lib/services/faculty-server";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

/**
 * Server actions have no incoming Request, but the real auth + Django client read the
 * access-token cookie and tenant host off a Request. Rebuild a minimal one from the
 * current cookies/headers so we can reuse `requireFaculty` and the real service twins.
 */
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
  return new Request("http://internal.local/faculty-attendance", { headers: reqHeaders });
}

export async function loadAttendanceAction(): Promise<ActionResult<FacultyAttendanceData>> {
  const request = await buildRequest();
  const auth = await requireFaculty(request);
  if (!auth.ok) return { ok: false, error: "Unauthorized" };
  try {
    const data = (await getAttendance(request, auth.subdomain)) as FacultyAttendanceData;
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to load." };
  }
}

export async function bulkMarkAttendanceAction(
  records: { recordId: string; status: string }[],
): Promise<ActionResult<{ updated: number }>> {
  const request = await buildRequest();
  const auth = await requireFaculty(request);
  if (!auth.ok) return { ok: false, error: "Unauthorized" };
  try {
    const data = await djangoSend<{ updated: number }>(
      request,
      "/api/v1/attendance/faculty/records/bulk-mark/",
      "PATCH",
      { records },
    );
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Save failed" };
  }
}

export async function markAttendanceAction(
  body: FacultyMarkAttendanceInput,
): Promise<ActionResult<AttendanceRecord>> {
  const request = await buildRequest();
  const auth = await requireFaculty(request);
  if (!auth.ok) return { ok: false, error: "Unauthorized" };
  try {
    const ctx = {
      subdomain: auth.subdomain,
      facultyUserId: auth.facultyUserId,
      facultyName: auth.facultyName,
    };
    const record = (await markAttendance(request, ctx, body as never)) as AttendanceRecord;
    return { ok: true, data: record };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Update failed" };
  }
}
