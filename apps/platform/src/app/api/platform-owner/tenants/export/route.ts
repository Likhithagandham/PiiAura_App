import { NextResponse } from "next/server";
import type { PlatformTenantListFilters } from "@eduos/types";
import { requirePlatformOwner } from "@/lib/platform-owner/api";
import { setAuthCookies } from "@/lib/auth/cookies";
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

  const csv = await platformOwnerServer.exportTenantsCsv(auth.accessToken, parseFilters(new URL(request.url)));
  const date = new Date().toISOString().slice(0, 10);
  const response = new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="eduos-institutions-${date}.csv"`,
    },
  });
  if (auth.sessionTokens) setAuthCookies(response, auth.sessionTokens);
  return response;
}
