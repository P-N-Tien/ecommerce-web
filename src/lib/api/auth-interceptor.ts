import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_AUTHEN_URLS, AUTH_LOGOUT_URL, AUTH_REFRESH_URL, LOGIN_REDIRECT_URL } from '@/lib/api/api-base-url';
import { http, authClient } from './http-client';
import type { BackendErrorPayload, RetryableRequestConfig } from './api-types';
import { formatApiError, normalizeAxiosError } from './error-handler';

// Only one refresh request can run at a time
let refreshPromise: Promise<void> | null = null;

// Prevent multiple redirects
let isRedirecting = false;

// Normalize URL to compare pathname accurately
const getPathname = (url: string): string => {
  return new URL(url, http.defaults.baseURL).pathname.replace(/\/+$/, '') || '/';
};

const isSameEndpoint = (requestUrl: string | undefined, targetUrl: string): boolean => {
  if (!requestUrl) return false;

  return getPathname(requestUrl) === getPathname(targetUrl);
};

// Check authentication endpoints
const isAuthEndpoint = (url?: string): boolean => {
  if (!url) return false;

  return API_AUTHEN_URLS.some((authUrl) => isSameEndpoint(url, authUrl));
};

// Check endpoints that must never trigger refresh
const isAuthManagementEndpoint = (url?: string): boolean => {
  if (!url) return false;

  return isSameEndpoint(url, AUTH_REFRESH_URL) || isSameEndpoint(url, AUTH_LOGOUT_URL);
};

// Session expiration handling
const handleSessionExpired = (): void => {
  if (isRedirecting || typeof window === 'undefined') {
    return;
  }

  isRedirecting = true;

  window.location.replace(LOGIN_REDIRECT_URL);
};

// Refresh token using a shared Promise
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
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

http.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error: unknown) => {
    // Preserve cancelled requests
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (!axios.isAxiosError<BackendErrorPayload>(error)) {
      return Promise.reject(error);
    }

    const axiosError = error as AxiosError<BackendErrorPayload>;
    const originalRequest = axiosError.config as RetryableRequestConfig | undefined;

    const currentUrl = originalRequest?.url ?? '';

    // No HTTP response: network error, timeout, etc.
    if (!axiosError.response) {
      return Promise.reject(normalizeAxiosError(axiosError, currentUrl));
    }

    const status = axiosError.response.status;
    const backendError = axiosError.response.data;

    // Authentication management APIs must not trigger refresh
    if (isAuthManagementEndpoint(currentUrl)) {
      if (isSameEndpoint(currentUrl, AUTH_REFRESH_URL) && status === 401) {
        handleSessionExpired();
      }

      return Promise.reject(formatApiError(status, currentUrl, backendError));
    }

    // Login, register, forgot password, etc.
    // Their 401 responses should be handled by their own flow.
    if (isAuthEndpoint(currentUrl)) {
      return Promise.reject(formatApiError(status, currentUrl, backendError));
    }

    // Only handle 401 for business API requests
    if (status !== 401 || !originalRequest) {
      return Promise.reject(formatApiError(status, currentUrl, backendError));
    }

    // Prevent infinite retry
    if (originalRequest._retry) {
      handleSessionExpired();

      return Promise.reject(formatApiError(status, currentUrl, backendError));
    }

    originalRequest._retry = true;

    try {
      // Concurrent requests share the same refresh operation
      await refreshSession();

      // Retry original request once
      return http(originalRequest);
    } catch (refreshError: unknown) {
      // Only expire the session when refresh is rejected
      // as an authentication failure.
      if (axios.isAxiosError(refreshError) && refreshError.response?.status === 401) {
        handleSessionExpired();
      }

      return Promise.reject(normalizeAxiosError(refreshError, AUTH_REFRESH_URL));
    }
  },
);
