import type { Role } from '@piiaura/types';
import { apiClient, getRefreshToken, setAuthTokens } from './client';
import { resolveTenantId } from './config';
import { mapEduOSMeToUser, type EduOSLoginResponse, type EduOSMeResponse } from './mappers/user';
import { API_PATHS } from './paths';

export interface LoginResult {
  user: import('@piiaura/types').User;
  access: string;
  refresh: string;
  mustChangePassword: boolean;
}

export async function login(
  identifier: string,
  password: string,
  role?: Role,
): Promise<LoginResult> {
  const tenantId = await resolveTenantId();
  const endpoint = role ? API_PATHS.auth.login : API_PATHS.auth.loginDisambiguate;
  const payload = role
    ? { identifier, password, role, tenant_id: tenantId }
    : { identifier, password, tenant_id: tenantId };

  const { data } = await apiClient.post<EduOSLoginResponse>(endpoint, payload);

  if (data.requires_selection) {
    throw new Error('Multiple accounts match this login. Use a role-specific sign-in.');
  }

  setAuthTokens(data.access, data.refresh);
  const user = await fetchCurrentUser();

  return {
    user,
    access: data.access,
    refresh: data.refresh,
    mustChangePassword: Boolean(data.must_change_password),
  };
}

export async function logout(): Promise<void> {
  const refresh = getRefreshToken();
  try {
    if (refresh) {
      await apiClient.post(API_PATHS.auth.logout, { refresh });
    }
  } finally {
    setAuthTokens(null, null);
  }
}

export async function fetchCurrentUser() {
  const { data } = await apiClient.get<EduOSMeResponse>(API_PATHS.auth.me);
  return mapEduOSMeToUser(data);
}

export function restoreSession(access: string, refresh: string) {
  setAuthTokens(access, refresh);
}
