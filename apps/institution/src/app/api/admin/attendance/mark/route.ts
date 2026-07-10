import * as attendanceServer from "@/lib/services/attendance-server";
import type { AdminMarkAttendanceQuery } from "@eduos/types";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const query: AdminMarkAttendanceQuery = {};
  const date = searchParams.get("date");
  const batchId = searchParams.get("batchId");
  const batchSubjectId = searchParams.get("batchSubjectId");
  const periodSlotId = searchParams.get("periodSlotId");
  if (date) query.date = date;
  if (batchId) query.batchId = batchId;
  if (batchSubjectId) query.batchSubjectId = batchSubjectId;
  if (periodSlotId) query.periodSlotId = periodSlotId;

  try {
    const context = await attendanceServer.getAdminMarkContext(request, auth.subdomain, query);
    return NextResponse.json(context);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load mark context" },
      { status: 500 },
    );
  }
}
