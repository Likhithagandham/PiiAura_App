import { NextResponse } from "next/server";
import type { GenerateLicenseInvoiceInput } from "@eduos/types";
import { requirePlatformOwnerWrite, platformOwnerJson } from "@/lib/platform-owner/api";
import * as platformOwnerServer from "@/lib/services/platform-owner-server";

export async function POST(request: Request) {
  const auth = await requirePlatformOwnerWrite(request);
  if (!auth.ok) return auth.response;
  const input = (await request.json()) as GenerateLicenseInvoiceInput;
  try {
    const data = await platformOwnerServer.generateLicenseInvoice(auth.accessToken, input);
    return platformOwnerJson(auth, data, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate invoice";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
