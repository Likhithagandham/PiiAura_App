import type { ValidatePlatformPlanLimitsInput } from "@eduos/types";
import { requirePlatformOwnerWrite, platformOwnerJson } from "@/lib/platform-owner/api";
import * as platformOwnerServer from "@/lib/services/platform-owner-server";

export async function POST(request: Request) {
  const auth = await requirePlatformOwnerWrite(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json()) as ValidatePlatformPlanLimitsInput;
  if (!body.context || !body.plan) {
    return platformOwnerJson(
      auth,
      { error: "context and plan are required" },
      { status: 400 },
    );
  }

  const result = await platformOwnerServer.validatePlanLimits(auth.accessToken, body);
  if ("limitBlocked" in result && result.limitBlocked) {
    return platformOwnerJson(auth, result, { status: 409 });
  }
  return platformOwnerJson(auth, { ok: true });
}
