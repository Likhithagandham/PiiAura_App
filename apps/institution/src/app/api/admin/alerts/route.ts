import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";
import * as alertsServer from "@/lib/services/alerts-server";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  try {
    const data = await alertsServer.listForAdmin(request, auth.subdomain);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load alerts";
    return NextResponse.json({ error: message, alerts: [] }, { status: 502 });
  }
}
