import { NextResponse } from "next/server";
import type { SuperAdminTicketActionInput } from "@eduos/types";
import { requireSuperAdmin, superAdminJson } from "@/lib/super-admin/api";
import * as superAdminServer from "@/lib/services/super-admin-server";
import { mapSuperAdminError } from "../../errors";

export async function PATCH(request: Request) {
  const auth = await requireSuperAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as SuperAdminTicketActionInput | null;
  if (!body) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  try {
    const { ticket } = await superAdminServer.applyTicketAction(request, auth.subdomain, body);
    return superAdminJson(auth, { ticket });
  } catch (err) {
    const { message, status } = mapSuperAdminError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
