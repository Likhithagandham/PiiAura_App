import type { PlatformTrialActionInput } from "@eduos/types";
import { requirePlatformOwnerWrite, platformOwnerJson } from "@/lib/platform-owner/api";
import * as platformOwnerServer from "@/lib/services/platform-owner-server";

export async function POST(request: Request) {
  const auth = await requirePlatformOwnerWrite(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json()) as PlatformTrialActionInput;
  if (!body.action) {
    return platformOwnerJson(auth, { error: "action is required" }, { status: 400 });
  }
  if (body.action !== "run_pipeline" && !body.tenantId) {
    return platformOwnerJson(
      auth,
      { error: "tenantId is required for this action" },
      { status: 400 },
    );
  }

  try {
    const result = await platformOwnerServer.applyTrialAction(auth.accessToken, body);
    return platformOwnerJson(auth, result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Trial action failed";
    return platformOwnerJson(auth, { error: message }, { status: 400 });
  }
}
