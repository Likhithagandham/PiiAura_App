import { requirePlatformOwner, platformOwnerJson } from "@/lib/platform-owner/api";
import * as platformOwnerServer from "@/lib/services/platform-owner-server";

export async function GET(request: Request) {
  const auth = await requirePlatformOwner(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const fallback = url.searchParams.get("fallback") ?? undefined;

  const result = await platformOwnerServer.checkSubdomainAvailability(
    auth.accessToken,
    q,
    fallback,
  );
  return platformOwnerJson(auth, result);
}
