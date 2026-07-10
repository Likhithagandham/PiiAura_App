import { requirePlatformOwner, platformOwnerJson } from "@/lib/platform-owner/api";
import * as alertsServer from "@/lib/services/alerts-server";

export async function GET(request: Request) {
  const auth = await requirePlatformOwner(request);
  if (!auth.ok) return auth.response;
  const { alerts } = await alertsServer.listForPlatform();
  return platformOwnerJson(auth, { alerts });
}
