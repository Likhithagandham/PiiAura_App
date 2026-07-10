import type { PlatformStudentSubscriptionActionInput } from "@eduos/types";
import { requirePlatformOwner, platformOwnerJson } from "@/lib/platform-owner/api";
import * as platformOwnerServer from "@/lib/services/platform-owner-server";

export async function PATCH(request: Request) {
  const auth = await requirePlatformOwner(request);
  if (!auth.ok) return auth.response;
  const body = (await request.json().catch(() => ({}))) as PlatformStudentSubscriptionActionInput;
  try {
    const data = await platformOwnerServer.applyStudentSubscriptionAction(auth.accessToken, body);
    return platformOwnerJson(auth, data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Action failed";
    return platformOwnerJson(auth, { error: message }, { status: 400 });
  }
}
