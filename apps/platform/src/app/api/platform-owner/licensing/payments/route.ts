import { NextResponse } from "next/server";
import type { RecordLicensePaymentInput } from "@eduos/types";
import {
  requirePlatformOwner,
  requirePlatformOwnerWrite,
  platformOwnerJson,
} from "@/lib/platform-owner/api";
import * as platformOwnerServer from "@/lib/services/platform-owner-server";

export async function GET(request: Request) {
  const auth = await requirePlatformOwner(request);
  if (!auth.ok) return auth.response;
  const tenantId = new URL(request.url).searchParams.get("tenantId") ?? undefined;
  const data = await platformOwnerServer.listLicensePayments(auth.accessToken, tenantId);
  return platformOwnerJson(auth, data);
}

export async function POST(request: Request) {
  const auth = await requirePlatformOwnerWrite(request);
  if (!auth.ok) return auth.response;
  const input = (await request.json()) as RecordLicensePaymentInput;
  try {
    const data = await platformOwnerServer.recordLicensePayment(auth.accessToken, input);
    return platformOwnerJson(auth, data, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to record payment";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
