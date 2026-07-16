import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { getApiBaseUrl } from './config';
import { formatApiError } from './errors';
import { unwrapEduOSResponse } from './envelope';
import { API_PATHS } from './paths';

let baseUrl: string = getApiBaseUrl();
let accessToken: string | null = null;
let refreshToken: string | null = null;
let refreshPromise: Promise<string> | null = null;
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

function clearSession() {
  setAuthTokens(null, null);
  onUnauthorized?.();
}

export function configureApiBaseUrl(url: string) {
  baseUrl = url;
  apiClient.defaults.baseURL = url;
}

export function getConfiguredApiBaseUrl() {
  return baseUrl;
}

export function setAuthTokens(access: string | null, refresh: string | null = null) {
  accessToken = access;
  refreshToken = refresh;
  if (access) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${access}`;
    return;
  }
  delete apiClient.defaults.headers.common.Authorization;
}

export function getRefreshToken() {
  return refreshToken;
}

export const apiClient = axios.create({
  baseURL: baseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

async function refreshAccessToken(): Promise<string> {
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await axios.post(
    `${baseUrl}${API_PATHS.auth.refresh}`,
    { refresh: refreshToken },
    { headers: { 'Content-Type': 'application/json' } },
  );

  const payload = unwrapEduOSResponse<{ access: string; refresh: string }>(response.data);
  setAuthTokens(payload.access, payload.refresh);
  return payload.access;
}

apiClient.interceptors.response.use(
  (response) => {
    response.data = unwrapEduOSResponse(response.data);
    return response;
  },
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status !== 401 || !original || original._retry || !refreshToken) {
      if (error.response?.status === 401) {
        clearSession();
      }
      return Promise.reject(formatApiError(error));
    }

    original._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const nextAccess = await refreshPromise;
      original.headers.Authorization = `Bearer ${nextAccess}`;
      return apiClient(original);
    } catch (refreshError) {
      clearSession();
      return Promise.reject(formatApiError(refreshError));
    }
  },
);
