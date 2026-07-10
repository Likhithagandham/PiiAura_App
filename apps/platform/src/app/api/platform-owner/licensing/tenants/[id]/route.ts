import { requirePlatformOwner, platformOwnerJson } from "@/lib/platform-owner/api";
import * as platformOwnerServer from "@/lib/services/platform-owner-server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePlatformOwner(request);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const branchId = new URL(request.url).searchParams.get("branchId");
  const data = await platformOwnerServer.getLicensingTenantDetail(
    auth.accessToken,
    id,
    branchId,
  );
  return platformOwnerJson(auth, data);
}
