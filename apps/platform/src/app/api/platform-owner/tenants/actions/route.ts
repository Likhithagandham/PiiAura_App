import type { PlatformTenantStatusActionInput } from "@eduos/types";
import { requirePlatformOwnerWrite, platformOwnerJson } from "@/lib/platform-owner/api";
import * as platformOwnerServer from "@/lib/services/platform-owner-server";

export async function PATCH(request: Request) {
  const auth = await requirePlatformOwnerWrite(request);
  if (!auth.ok) return auth.response;
  const body = (await request.json()) as PlatformTenantStatusActionInput;
  if (!body.tenantId || !body.action) {
    return platformOwnerJson(auth, { error: "tenantId and action are required" }, { status: 400 });
  }
  try {
    const result = await platformOwnerServer.setTenantStatus(auth.accessToken, body);
    return platformOwnerJson(auth, result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Action failed";
    return platformOwnerJson(auth, { error: message }, { status: 400 });
  }
}
