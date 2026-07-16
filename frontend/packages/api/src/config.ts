import { API_ENDPOINTS } from '@piiaura/constants';
import { fetchTenantConfig } from './organizations';

declare const process: { env?: Record<string, string | undefined> };

let cachedTenantId: string | null = null;

export function getApiBaseUrl(): string {
  const envUrl = process.env?.EXPO_PUBLIC_API_URL;
  return envUrl && envUrl.length > 0 ? envUrl : API_ENDPOINTS.BASE_URL;
}

export function getTenantId(): string {
  const tenantId = process.env?.EXPO_PUBLIC_TENANT_ID ?? cachedTenantId;
  if (!tenantId) {
    throw new Error(
      'EXPO_PUBLIC_TENANT_ID is not configured. Set it in frontend/apps/mobile/.env or use EXPO_PUBLIC_TENANT_SUBDOMAIN.',
    );
  }
  return tenantId;
}

export async function resolveTenantId(): Promise<string> {
  if (cachedTenantId) {
    return cachedTenantId;
  }

  const directTenantId = process.env?.EXPO_PUBLIC_TENANT_ID;
  if (directTenantId) {
    cachedTenantId = directTenantId;
    return directTenantId;
  }

  const subdomain = process.env?.EXPO_PUBLIC_TENANT_SUBDOMAIN;
  if (subdomain) {
    const config = await fetchTenantConfig(subdomain);
    cachedTenantId = config.tenantId;
    return config.tenantId;
  }

  throw new Error(
    'Set EXPO_PUBLIC_TENANT_ID or EXPO_PUBLIC_TENANT_SUBDOMAIN in frontend/apps/mobile/.env',
  );
}

export function setResolvedTenantId(tenantId: string) {
  cachedTenantId = tenantId;
}
