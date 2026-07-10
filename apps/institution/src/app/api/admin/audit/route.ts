import { requireAdmin } from "@/lib/admin/api";
import { listAuditEntries } from "@/lib/services/audit-server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const limit = Number(new URL(request.url).searchParams.get("limit") ?? "100");

  const entries = await listAuditEntries(request, Number.isFinite(limit) ? limit : 100);
  return NextResponse.json({ entries });
}
