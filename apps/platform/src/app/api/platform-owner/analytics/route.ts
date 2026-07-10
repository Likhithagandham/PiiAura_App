import { platformOwnerErrorJson, requirePlatformOwner, platformOwnerJson } from "@/lib/platform-owner/api";
import * as platformOwnerServer from "@/lib/services/platform-owner-server";

export async function GET(request: Request) {
  const auth = await requirePlatformOwner(request);
  if (!auth.ok) return auth.response;
  try {
    const data = await platformOwnerServer.getAnalytics(auth.accessToken);
    return platformOwnerJson(auth, data);
  } catch (err) {
    return platformOwnerErrorJson(auth, err, "Failed to load analytics");
  }
}
