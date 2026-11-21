import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { http, authClient } from './http-client';
import type { RetryableRequestConfig } from './api-types';
import { formatApiError, normalizeAxiosError } from './error-handler';
import { API_AUTHEN_URLS, AUTH_LOGOUT_URL, AUTH_REFRESH_URL, LOGIN_REDIRECT_URL } from '@/lib/api/api-base-url';
import { getAccessToken } from '@/lib/api/auth-session';

let refreshPromise: Promise<void> | null = null;

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

const isAuthManagementEndpoint = (url?: string): boolean => {
  if (!url) return false;
  return isSameEndpoint(url, AUTH_REFRESH_URL) || isSameEndpoint(url, AUTH_LOGOUT_URL);
};

const handleSessionExpired = (): void => {
  if (isRedirecting || typeof window === 'undefined') {
    return;
  }

  isRedirecting = true;
  window.location.replace(LOGIN_REDIRECT_URL);
};

const refreshSession = (): Promise<void> => {
  if (!refreshPromise) {
    refreshPromise = authClient
      .post(AUTH_REFRESH_URL)
      .then(() => undefined)
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

    if (isAuthManagementEndpoint(currentUrl)) {
      if (isSameEndpoint(currentUrl, AUTH_REFRESH_URL) && status === 401) {
        handleSessionExpired();
      }
      return Promise.reject(formatApiError(status, currentUrl, backendError));
    }

    if (isAuthEndpoint(currentUrl)) {
      return Promise.reject(formatApiError(status, currentUrl, backendError));
    }

    if (status !== 401 || !originalRequest) {
      return Promise.reject(formatApiError(status, currentUrl, backendError));
    }

    if (originalRequest._retry) {
      handleSessionExpired();
      return Promise.reject(formatApiError(status, currentUrl, backendError));
    }

    originalRequest._retry = true;

    try {
      await refreshSession();
      return http(originalRequest);
    } catch (refreshError: unknown) {
      if (axios.isAxiosError(refreshError) && refreshError.response?.status === 401) {
        handleSessionExpired();
      }

      return Promise.reject(normalizeAxiosError(refreshError, AUTH_REFRESH_URL));
    }
  },
);
