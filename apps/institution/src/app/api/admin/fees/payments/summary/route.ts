import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";
import { getFeesPaymentsSummary } from "@/lib/services/fees.service";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const url = new URL(request.url);
  const data = await getFeesPaymentsSummary(request, {
    status: url.searchParams.get("status"),
    studentId: url.searchParams.get("studentId"),
    dateFrom: url.searchParams.get("date_from"),
    dateTo: url.searchParams.get("date_to"),
  });
  return NextResponse.json(data);
}
