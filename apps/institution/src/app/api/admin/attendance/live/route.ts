import * as attendanceServer from "@/lib/services/attendance-server";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  try {
    const live = await attendanceServer.getLiveAttendance(request, auth.subdomain);
    return NextResponse.json(live);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load live attendance" },
      { status: 500 },
    );
  }
}
