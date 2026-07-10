import { NextResponse } from "next/server";
import { requireSuperAdmin, superAdminJson } from "@/lib/super-admin/api";
import * as superAdminServer from "@/lib/services/super-admin-server";
import { mapSuperAdminError } from "../../errors";

export async function PATCH(request: Request) {
  const auth = await requireSuperAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as
    | { action: "set_active"; templateId: string; isActive: boolean }
    | null;
  if (!body) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  try {
    switch (body.action) {
      case "set_active": {
        const { template } = await superAdminServer.setFeeTemplateActive(request, auth.subdomain, {
          templateId: String(body.templateId ?? ""),
          isActive: Boolean(body.isActive),
        });
        return superAdminJson(auth, { template });
      }
      default:
        return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
    }
  } catch (err) {
    const { message, status } = mapSuperAdminError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
