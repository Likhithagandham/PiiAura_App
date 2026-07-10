import type { PlatformEnterSupportInput } from "@eduos/types";
import {
  platformOwnerErrorJson,
  requirePlatformOwner,
  requirePlatformOwnerWrite,
  platformOwnerJson,
} from "@/lib/platform-owner/api";
import * as platformOwnerServer from "@/lib/services/platform-owner-server";

export async function GET(request: Request) {
  const auth = await requirePlatformOwner(request);
  if (!auth.ok) return auth.response;
  try {
    const data = await platformOwnerServer.getSupportMode(auth.accessToken);
    return platformOwnerJson(auth, data);
  } catch (err) {
    return platformOwnerErrorJson(auth, err, "Failed to load support mode");
  }
}

export async function POST(request: Request) {
  const auth = await requirePlatformOwnerWrite(request);
  if (!auth.ok) return auth.response;
  try {
    const body = (await request.json()) as PlatformEnterSupportInput;
    const result = await platformOwnerServer.enterSupportMode(auth.accessToken, body);
    return platformOwnerJson(auth, result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to enter support mode";
    const status = /throttl/i.test(message) ? 429 : 400;
    return platformOwnerJson(auth, { error: message }, { status });
  }
}

export async function DELETE(request: Request) {
  const auth = await requirePlatformOwnerWrite(request);
  if (!auth.ok) return auth.response;
  try {
    const result = await platformOwnerServer.exitSupportMode(auth.accessToken);
    return platformOwnerJson(auth, result);
  } catch (err) {
    return platformOwnerErrorJson(auth, err, "Failed to exit support mode");
  }
}
