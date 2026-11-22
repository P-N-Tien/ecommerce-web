import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { http } from './http-client';
import type { RetryableRequestConfig } from './api-types';
import { formatApiError, normalizeAxiosError } from './error-handler';
import { API_AUTHEN_URLS, AUTH_REFRESH_URL, LOGIN_REDIRECT_URL } from '@/lib/api/api-base-url';
import { clearAccessToken, getAccessToken } from '@/lib/api/auth-session';
import { silentRefreshAccessToken } from '@/lib/api/silent-refresh';

let refreshPromise: Promise<string> | null = null;
let isRedirecting = false;

const getPathname = (url: string): string => {
  try {
    const base = http.defaults.baseURL?.startsWith('http') ? http.defaults.baseURL : 'http://localhost';
    return new URL(url, base).pathname.replace(/\/+$/, '') || '/';
  } catch {
    return url.split('?').join('').replace(/\/+$/, '') || '/';
  }
};

const isSameEndpoint = (requestUrl: string | undefined, targetUrl: string): boolean => {
  if (!requestUrl) return false;
  return getPathname(requestUrl) === getPathname(targetUrl);
};

const isAuthEndpoint = (url?: string): boolean => {
  if (!url) return false;
  return API_AUTHEN_URLS.some((authUrl: string) => isSameEndpoint(url, authUrl));
};

export function redirectToLogin(): void {
  clearAccessToken();

  if (typeof window === 'undefined' || isRedirecting) {
    return;
  }

  const loginPath = getPathname(LOGIN_REDIRECT_URL);
  if (getPathname(window.location.pathname) !== loginPath) {
    isRedirecting = true;
    const redirectTarget = `${window.location.pathname}${window.location.search}`;
    const loginUrl = `${LOGIN_REDIRECT_URL}?redirect=${encodeURIComponent(redirectTarget)}`;
    window.location.assign(loginUrl);
  }
}

const refreshSession = async (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = silentRefreshAccessToken()
      .then((newAccessToken) => {
        if (!newAccessToken) {
          throw new Error('Refresh token failed: No access token returned');
        }
        return newAccessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(normalizeAxiosError(error)),
);

http.interceptors.response.use(
  (response) => response.data,
  async (error: unknown) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (!axios.isAxiosError<unknown>(error)) {
      return Promise.reject(normalizeAxiosError(error));
    }

    const axiosError = error as AxiosError<unknown>;
    const originalRequest = axiosError.config as RetryableRequestConfig | undefined;
    const currentUrl = originalRequest?.url ?? '';

    if (!axiosError.response) {
      return Promise.reject(normalizeAxiosError(axiosError, currentUrl));
    }

    const status = axiosError.response.status;
    const backendError = axiosError.response.data;

    if (isAuthEndpoint(currentUrl) || status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(formatApiError(status, currentUrl, backendError));
    }

    originalRequest._retry = true;

    try {
      const newAccessToken = await refreshSession();

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return http(originalRequest);
    } catch (refreshError: unknown) {
      redirectToLogin();
      return Promise.reject(normalizeAxiosError(refreshError, AUTH_REFRESH_URL));
    }
  },
);
