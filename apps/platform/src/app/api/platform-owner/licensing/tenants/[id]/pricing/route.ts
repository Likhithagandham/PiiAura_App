import { requirePlatformOwner, platformOwnerJson } from "@/lib/platform-owner/api";
import * as platformOwnerServer from "@/lib/services/platform-owner-server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePlatformOwner(request);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { discountPercent?: number };
  if (typeof body.discountPercent !== "number") {
    return platformOwnerJson(auth, { error: "discountPercent is required." }, { status: 400 });
  }
  try {
    const pricing = await platformOwnerServer.updateTenantPricing(
      auth.accessToken,
      id,
      body.discountPercent,
    );
    return platformOwnerJson(auth, { pricing });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update pricing";
    return platformOwnerJson(auth, { error: message }, { status: 400 });
  }
}
