import { headers } from "next/headers";

const DEFAULT_TENANT = process.env.NEXT_PUBLIC_DEFAULT_TENANT?.trim() ?? "";

/** localhost / 127.0.0.1 — not tenant subdomains (avoid parsing "127" from an IP) */
function isLocalDevHost(host: string): boolean {
  const hostname = (host.split(":")[0] ?? "").toLowerCase();
  if (hostname === "localhost") return true;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return true;
  return false;
}

function subdomainFromHost(host: string): string | null {
  if (isLocalDevHost(host)) return null;

  const match = host.match(/^([a-z0-9-]+)\./i);
  const slug = match?.[1]?.toLowerCase();
  if (!slug || slug === "localhost" || slug === "www") return null;
  return slug;
}

/** Resolve tenant subdomain from host, header, or default (local dev) */
export async function getTenantSubdomain(): Promise<string> {
  const h = await headers();
  const fromHeader = h.get("x-tenant-subdomain");
  if (fromHeader) return fromHeader;

  const host = h.get("host") ?? "";
  return subdomainFromHost(host) ?? DEFAULT_TENANT;
}

export function getTenantSubdomainFromRequest(request: Request): string {
  const fromHeader = request.headers.get("x-tenant-subdomain");
  if (fromHeader) return fromHeader;

  const host = request.headers.get("host") ?? "";
  return subdomainFromHost(host) ?? DEFAULT_TENANT;
}
