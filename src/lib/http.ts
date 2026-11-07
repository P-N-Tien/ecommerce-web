import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import {
  API_BASE_URL,
  AUTH_LOGOUT_URL,
  AUTH_REFRESH_URL,
  LOGIN_REDIRECT_URL,
} from './api-base-url';
import { ApiErrorResponse, ApiSuccessResponse } from './types/api';

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
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
      const backendError = error.response.data as ApiErrorResponse;

      let errorMessage =
        backendError?.error?.message ||
        backendError?.message ||
        'An unexpected error occurred.';

      if (status === 401 && !originalRequest._retry) {
        if (
          originalRequest.url?.includes(AUTH_REFRESH_URL) ||
          originalRequest.url?.includes(AUTH_LOGOUT_URL)
        ) {
          window.location.href = LOGIN_REDIRECT_URL;
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
          isRefreshing = false;
          processQueue(refreshError);
          window.location.href = LOGIN_REDIRECT_URL;
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject({
        success: false,
        statusCode: status,
        message: errorMessage,
        error: backendError?.error || {
          code: 'UNKNOWN_ERROR',
          message: errorMessage,
        },
        timestamp: backendError?.timestamp || new Date().toISOString(),
        path: backendError?.path || originalRequest.url || '',
      } as ApiErrorResponse);
    }

    const networkErrorMsg =
      'Could not establish connection to the server. Please check your network.';
    return Promise.reject({
      success: false,
      statusCode: 500,
      message: networkErrorMsg,
      error: { code: 'NETWORK_ERROR', message: networkErrorMsg },
      timestamp: new Date().toISOString(),
      path: originalRequest?.url || '',
    } as ApiErrorResponse);
  },
);

export default http;
