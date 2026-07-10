import type { UpdatePlatformPlanFeatureMatrixInput } from "@eduos/types";
import {
  requirePlatformOwner,
  requirePlatformOwnerWrite,
  platformOwnerJson,
} from "@/lib/platform-owner/api";
import * as platformOwnerServer from "@/lib/services/platform-owner-server";

export async function GET(request: Request) {
  const auth = await requirePlatformOwner(request);
  if (!auth.ok) return auth.response;
  const data = await platformOwnerServer.getPlanFeatureMatrix(auth.accessToken);
  return platformOwnerJson(auth, data);
}

export async function PATCH(request: Request) {
  const auth = await requirePlatformOwnerWrite(request);
  if (!auth.ok) return auth.response;
  try {
    const body = (await request.json()) as UpdatePlatformPlanFeatureMatrixInput;
    if (!body.plan || !body.flags) {
      return platformOwnerJson(
        auth,
        { error: "plan and flags are required" },
        { status: 400 },
      );
    }
    const data = await platformOwnerServer.updatePlanFeatureMatrix(auth.accessToken, body);
    return platformOwnerJson(auth, data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return platformOwnerJson(auth, { error: message }, { status: 400 });
  }
}
