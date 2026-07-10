import { requirePlatformOwner, platformOwnerJson } from "@/lib/platform-owner/api";
import * as platformOwnerServer from "@/lib/services/platform-owner-server";
import type { PlatformStudentSubscriptionListFilters } from "@eduos/types";

function parseFilters(url: URL): PlatformStudentSubscriptionListFilters & { skipMeta?: boolean } {
  const page = url.searchParams.get("page");
  const pageSize = url.searchParams.get("pageSize");
  return {
    tenantId: url.searchParams.get("tenantId") ?? undefined,
    branchId: url.searchParams.get("branchId") ?? undefined,
    plan: (url.searchParams.get("plan") as PlatformStudentSubscriptionListFilters["plan"]) ?? "all",
    status:
      (url.searchParams.get("status") as PlatformStudentSubscriptionListFilters["status"]) ?? "all",
    q: url.searchParams.get("q") ?? undefined,
    page: page ? Number(page) : 1,
    pageSize: pageSize ? Number(pageSize) : 50,
    skipMeta: url.searchParams.get("skipMeta") === "1",
  };
}

export async function GET(request: Request) {
  const auth = await requirePlatformOwner(request);
  if (!auth.ok) return auth.response;
  try {
    const { skipMeta, ...filters } = parseFilters(new URL(request.url));
    const data = await platformOwnerServer.listStudentSubscriptions(
      auth.accessToken,
      filters,
      skipMeta,
    );
    return platformOwnerJson(auth, data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load student subscriptions";
    return platformOwnerJson(auth, { error: message }, { status: 500 });
  }
}
