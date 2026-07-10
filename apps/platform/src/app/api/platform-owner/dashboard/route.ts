import { NextResponse } from "next/server";
import { requirePlatformOwner, platformOwnerJson } from "@/lib/platform-owner/api";
import * as platformOwnerServer from "@/lib/services/platform-owner-server";

export async function GET(request: Request) {
  const auth = await requirePlatformOwner(request);
  if (!auth.ok) return auth.response;
  try {
    const data = await platformOwnerServer.getDashboard(auth.accessToken);
    return platformOwnerJson(auth, data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load dashboard";
    return platformOwnerJson(auth, { error: message }, { status: 500 });
  }
}
