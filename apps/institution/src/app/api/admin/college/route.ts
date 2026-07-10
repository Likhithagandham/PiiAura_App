import { bridge } from "@/lib/services/route-bridge";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json(await bridge(request, { path: "/api/v1/admin/college/" }));
}
