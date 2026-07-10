import type { PlatformChangePlanInput } from "@eduos/types";
import { PlatformPlanLimitError } from "@/lib/services/platform-owner-server";
import {
  requirePlatformOwner,
  requirePlatformOwnerWrite,
  platformOwnerJson,
} from "@/lib/platform-owner/api";
import * as platformOwnerServer from "@/lib/services/platform-owner-server";

export async function GET(request: Request) {
  const auth = await requirePlatformOwner(request);
  if (!auth.ok) return auth.response;
  try {
    const data = await platformOwnerServer.getPlansData(auth.accessToken);
    return platformOwnerJson(auth, data);
  } catch (err) {
    console.error("[platform-owner/plans GET]", err);
    const message = err instanceof Error ? err.message : "Failed to load plans";
    return platformOwnerJson(auth, { error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requirePlatformOwnerWrite(request);
  if (!auth.ok) return auth.response;
  const body = (await request.json()) as PlatformChangePlanInput;
  if (!body.tenantId || !body.newPlan) {
    return platformOwnerJson(
      auth,
      { error: "tenantId and newPlan are required" },
      { status: 400 },
    );
  }
  try {
    const result = await platformOwnerServer.changeTenantPlan(auth.accessToken, body);
    return platformOwnerJson(auth, result);
  } catch (err) {
    if (err instanceof PlatformPlanLimitError) {
      return platformOwnerJson(auth, err.payload, { status: 409 });
    }
    const message = err instanceof Error ? err.message : "Plan change failed";
    return platformOwnerJson(auth, { error: message }, { status: 400 });
  }
}
