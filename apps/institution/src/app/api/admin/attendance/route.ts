import type { AttendanceReportQuery } from "@eduos/types";
import * as attendanceServer from "@/lib/services/attendance-server";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  try {
    const url = new URL(request.url);
    const query: AttendanceReportQuery = {};
    const period = url.searchParams.get("period");
    if (period === "weekly" || period === "monthly") query.period = period;
    const week = url.searchParams.get("week");
    if (week) query.week = week;
    const month = url.searchParams.get("month");
    if (month) query.month = month;
    const batchId = url.searchParams.get("batchId");
    if (batchId) query.batchId = batchId;

    const hasQuery = Object.keys(query).length > 0;
    const data = await attendanceServer.getAttendanceData(
      request,
      auth.subdomain,
      hasQuery ? query : undefined,
    );
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load attendance data" },
      { status: 500 },
    );
  }
}
