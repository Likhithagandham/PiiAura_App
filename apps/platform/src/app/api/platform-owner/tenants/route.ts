import type { CreatePlatformTenantInput, PlatformTenantListFilters } from "@eduos/types";
import { PlatformPlanLimitError } from "@/lib/services/platform-owner-server";
import {
  requirePlatformOwner,
  requirePlatformOwnerWrite,
  platformOwnerJson,
} from "@/lib/platform-owner/api";
import * as platformOwnerServer from "@/lib/services/platform-owner-server";

function parseFilters(url: URL): PlatformTenantListFilters {
  return {
    q: url.searchParams.get("q") ?? undefined,
    plan: (url.searchParams.get("plan") as PlatformTenantListFilters["plan"]) ?? "all",
    institutionType:
      (url.searchParams.get("type") as PlatformTenantListFilters["institutionType"]) ?? "all",
    city: url.searchParams.get("city") ?? "all",
    status: (url.searchParams.get("status") as PlatformTenantListFilters["status"]) ?? "all",
  };
}

export async function GET(request: Request) {
  const auth = await requirePlatformOwner(request);
  if (!auth.ok) return auth.response;
  const data = await platformOwnerServer.listTenants(auth.accessToken, parseFilters(new URL(request.url)));
  return platformOwnerJson(auth, data);
}

export async function POST(request: Request) {
  const auth = await requirePlatformOwnerWrite(request);
  if (!auth.ok) return auth.response;
  try {
    const body = (await request.json()) as CreatePlatformTenantInput;
    const tenant = await platformOwnerServer.createTenant(auth.accessToken, body);
    return platformOwnerJson(auth, { tenant }, { status: 201 });
  } catch (err) {
    if (err instanceof PlatformPlanLimitError) {
      return platformOwnerJson(auth, err.payload, { status: 409 });
    }
    const message = err instanceof Error ? err.message : "Failed to create tenant";
    return platformOwnerJson(auth, { error: message }, { status: 400 });
  }
}
