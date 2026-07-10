import { API_ENDPOINTS } from '@piiaura/constants';

declare const process: { env?: Record<string, string | undefined> };

export function getApiBaseUrl(): string {
  const envUrl = process.env?.EXPO_PUBLIC_API_URL;
  return envUrl && envUrl.length > 0 ? envUrl : API_ENDPOINTS.BASE_URL;
}

export function getTenantId(): string {
  const tenantId = process.env?.EXPO_PUBLIC_TENANT_ID;
  if (!tenantId) {
    throw new Error(
      'EXPO_PUBLIC_TENANT_ID is not configured. Set it to your EduOS tenant UUID.',
    );
  }
  return tenantId;
}
