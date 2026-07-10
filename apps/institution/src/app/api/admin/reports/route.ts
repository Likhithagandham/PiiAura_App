import { requireAdmin } from "@/lib/admin/api";
import { listReportCatalog } from "@/lib/services/reports-server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  return NextResponse.json({ reports: listReportCatalog() });
}
