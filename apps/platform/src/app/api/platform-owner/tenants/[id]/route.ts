import { requirePlatformOwner, platformOwnerJson } from "@/lib/platform-owner/api";
import * as platformOwnerServer from "@/lib/services/platform-owner-server";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requirePlatformOwner(request);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  const tenant = await platformOwnerServer.getTenant(auth.accessToken, id);
  if (!tenant) {
    return platformOwnerJson(auth, { error: "Tenant not found" }, { status: 404 });
  }
  return platformOwnerJson(auth, { tenant });
}
