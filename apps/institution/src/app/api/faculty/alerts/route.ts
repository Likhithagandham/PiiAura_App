import { NextResponse } from "next/server";
import { requireFaculty } from "@/lib/faculty/api";
import * as alertsServer from "@/lib/services/alerts-server";

export async function GET(request: Request) {
  const auth = await requireFaculty(request);
  if (!auth.ok) return auth.response;
  const data = await alertsServer.listForFaculty(request, auth.subdomain, auth.facultyUserId);
  return NextResponse.json(data);
}
