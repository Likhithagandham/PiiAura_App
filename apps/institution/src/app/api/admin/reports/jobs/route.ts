import { requireAdmin } from "@/lib/admin/api";
import { listExportJobs } from "@/lib/services/reports-server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const jobs = await listExportJobs(request);
  return NextResponse.json({ jobs });
}
