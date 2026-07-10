import { requirePlatformOwner, platformOwnerJson } from "@/lib/platform-owner/api";
import * as platformOwnerServer from "@/lib/services/platform-owner-server";

export async function GET(request: Request) {
  const auth = await requirePlatformOwner(request);
  if (!auth.ok) return auth.response;
  const report = await platformOwnerServer.getRevenueReport(auth.accessToken);
  return platformOwnerJson(auth, report);
}
