/**
 * Tenant branding — Django backend.
 */

import type { TenantLoginConfig } from "@eduos/types";
import { getApiBaseUrl } from "@/lib/config";

export interface TenantBrandingResponse {
  institutionName: string;
  logoUrl: string | null;
  brandColor: string;
  websiteUrl: string | null;
}

interface DjangoTenantConfigPayload {
  institution_name: string;
  logo_url?: string | null;
  theme?: { logoUrl?: string | null; primaryColor?: string };
  website?: string | null;
}

async function fetchPublicTenantConfig(subdomain: string): Promise<DjangoTenantConfigPayload> {
  const res = await fetch(
    `${getApiBaseUrl()}/api/v1/organizations/tenant-config/?subdomain=${encodeURIComponent(subdomain)}`,
    { headers: { Accept: "application/json" }, cache: "no-store" },
  );
  const body = (await res.json().catch(() => ({}))) as {
    data?: DjangoTenantConfigPayload;
    message?: string;
  };
  if (!res.ok) {
    throw new Error(body.message ?? "Failed to load tenant configuration");
  }
  return body.data ?? (body as unknown as DjangoTenantConfigPayload);
}

export async function getTenantBrandingView(
  subdomain: string,
  cfg: TenantLoginConfig,
): Promise<TenantBrandingResponse> {
  const data = await fetchPublicTenantConfig(subdomain);
  return {
    institutionName: data.institution_name,
    logoUrl: data.theme?.logoUrl ?? data.logo_url ?? null,
    brandColor: data.theme?.primaryColor ?? "#1a5f4a",
    websiteUrl: data.website?.trim() || null,
  };
}

export async function getInstitutionName(subdomain: string): Promise<string> {
  const data = await fetchPublicTenantConfig(subdomain);
  return data.institution_name;
}
