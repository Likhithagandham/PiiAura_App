import { NextResponse } from "next/server";
import type { CreateFeeStructureTemplateInput } from "@eduos/types";
import { requireSuperAdmin, superAdminJson } from "@/lib/super-admin/api";
import * as superAdminServer from "@/lib/services/super-admin-server";
import { mapSuperAdminError } from "../errors";

export async function GET(request: Request) {
  const auth = await requireSuperAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const data = await superAdminServer.listFeeTemplates(request, auth.subdomain);
    return superAdminJson(auth, data);
  } catch (err) {
    const { message, status } = mapSuperAdminError(err);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  const auth = await requireSuperAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as CreateFeeStructureTemplateInput | null;
  if (!body) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  try {
    const { template } = await superAdminServer.createFeeTemplate(request, auth.subdomain, body);
    return superAdminJson(auth, { template }, { status: 201 });
  } catch (err) {
    const { message, status } = mapSuperAdminError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
