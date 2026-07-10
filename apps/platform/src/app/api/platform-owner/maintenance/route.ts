import type { UpdatePlatformMaintenanceInput } from "@eduos/types";
import {
  platformOwnerErrorJson,
  requirePlatformOwner,
  platformOwnerJson,
} from "@/lib/platform-owner/api";
import * as platformOwnerServer from "@/lib/services/platform-owner-server";

export async function GET(request: Request) {
  const auth = await requirePlatformOwner(request);
  if (!auth.ok) return auth.response;
  try {
    const maintenance = await platformOwnerServer.getMaintenanceMode(auth.accessToken);
    return platformOwnerJson(auth, { maintenance });
  } catch (err) {
    return platformOwnerErrorJson(auth, err, "Failed to load maintenance mode");
  }
}

/** Always allowed while authenticated — toggles maintenance off */
export async function PATCH(request: Request) {
  const auth = await requirePlatformOwner(request);
  if (!auth.ok) return auth.response;
  try {
    const body = (await request.json()) as UpdatePlatformMaintenanceInput;
    const maintenance = await platformOwnerServer.updateMaintenanceMode(auth.accessToken, body);
    return platformOwnerJson(auth, { maintenance });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return platformOwnerJson(auth, { error: message }, { status: 400 });
  }
}
