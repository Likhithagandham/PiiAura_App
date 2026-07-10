import type { SuperAdminRecordStudentTransferInput } from "@eduos/types";
import { NextResponse } from "next/server";
import { requireSuperAdmin, superAdminJson } from "@/lib/super-admin/api";
import * as superAdminServer from "@/lib/services/super-admin-server";
import { mapSuperAdminError } from "../../errors";

export async function POST(request: Request) {
  const auth = await requireSuperAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json()) as { action: string; payload?: SuperAdminRecordStudentTransferInput };

  try {
    switch (body.action) {
      case "record_transfer": {
        if (!body.payload) {
          return NextResponse.json({ error: "payload is required" }, { status: 400 });
        }
        const result = await superAdminServer.recordStudentTransfer(request, auth.subdomain, body.payload);
        return superAdminJson(auth, result);
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err) {
    const { message, status } = mapSuperAdminError(err);
    return superAdminJson(auth, { error: message }, { status });
  }
}
