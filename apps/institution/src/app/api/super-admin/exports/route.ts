import { NextResponse } from "next/server";
import { requireSuperAdmin, superAdminJson } from "@/lib/super-admin/api";
import * as superAdminServer from "@/lib/services/super-admin-server";
import { mapSuperAdminError } from "../errors";

export async function GET(request: Request) {
  const auth = await requireSuperAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const data = await superAdminServer.listExportJobs(request, auth.subdomain);
    return superAdminJson(auth, data);
  } catch (err) {
    const { message, status } = mapSuperAdminError(err);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  const auth = await requireSuperAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as { type?: "branch_summary" } | null;
  if (!body?.type) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  try {
    const { job } = await superAdminServer.createExportJob(request, auth.subdomain, { type: body.type });
    return superAdminJson(auth, { job });
  } catch (err) {
    const { message, status } = mapSuperAdminError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
