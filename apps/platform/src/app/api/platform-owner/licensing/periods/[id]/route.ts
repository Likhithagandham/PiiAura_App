import { NextResponse } from "next/server";
import { requirePlatformOwnerWrite, platformOwnerJson } from "@/lib/platform-owner/api";
import * as platformOwnerServer from "@/lib/services/platform-owner-server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePlatformOwnerWrite(request);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const body = (await request.json()) as { endDate?: string };
  if (!body.endDate) {
    return NextResponse.json({ error: "endDate is required" }, { status: 400 });
  }
  try {
    const data = await platformOwnerServer.extendLicensePeriod(auth.accessToken, id, body.endDate);
    return platformOwnerJson(auth, data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to extend subscription";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
