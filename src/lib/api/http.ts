import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import {
  API_BASE_URL,
  API_AUTHEN_URLS,
  AUTH_LOGOUT_URL,
  AUTH_REFRESH_URL,
  LOGIN_REDIRECT_URL,
} from './api-base-url';
import { ApiErrorResponse, ApiSuccessResponse } from './api';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any) => {
  failedQueue.forEach((promise) =>
    error ? promise.reject(error) : promise.resolve(),
  );
  failedQueue = [];
};

const isAuthenURL = (url?: string): boolean => {
  if (!url) return false;
  return API_AUTHEN_URLS.some((authUrl) => url.includes(authUrl));
};

const isAuthManagementUrl = (url?: string): boolean => {
  if (!url) return false;
  return url.includes(AUTH_REFRESH_URL) || url.includes(AUTH_LOGOUT_URL);
};

const handleSessionExpired = () => {
  isRefreshing = false;
  window.location.href = LOGIN_REDIRECT_URL;
};

const formatApiError = (
  status: number,
  originalUrl: string,
  backendError?: any,
): ApiErrorResponse => {
  const errorMessage =
    backendError?.error?.message ||
    backendError?.message ||
    'An unexpected error occurred.';
  return {
    success: false,
    statusCode: status,
    message: errorMessage,
    error: backendError?.error || {
      code: 'UNKNOWN_ERROR',
      message: errorMessage,
    },
    timestamp: backendError?.timestamp || new Date().toISOString(),
    path: backendError?.path || originalUrl || '',
  };
};

const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
  (error) => Promise.reject(error),
);

http.interceptors.response.use(
  (response: AxiosResponse<ApiSuccessResponse<any>>) => {
    return response.data.data;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      const status = error.response.status;
      const backendError = error.response.data;
      const currentUrl = originalRequest.url;

      if (isAuthenURL(currentUrl)) {
        return Promise.reject(formatApiError(status, currentUrl, backendError));
      }

      if (status === 401 && !originalRequest._retry) {
        if (isAuthManagementUrl(currentUrl)) {
          handleSessionExpired();
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => http(originalRequest))
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          await http.post(AUTH_REFRESH_URL);
          isRefreshing = false;
          processQueue(null);
          return http(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError);
          handleSessionExpired();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(formatApiError(status, currentUrl, backendError));
    }

    const networkErrorMsg =
      'Could not establish connection to the server. Please check your network.';
    return Promise.reject(
      formatApiError(500, originalRequest?.url || '', {
        message: networkErrorMsg,
        error: { code: 'NETWORK_ERROR', message: networkErrorMsg },
      }),
    );
  },
);

export default http;
