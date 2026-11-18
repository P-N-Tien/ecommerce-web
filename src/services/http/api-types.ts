import type { InternalAxiosRequestConfig } from 'axios';

export interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export interface BackendErrorPayload {
  success?: false;
  message?: string;
  timestamp?: string;
  path?: string;

  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;

  error: {
    code: string;
    message: string;
    details?: unknown;
  };

  timestamp: string;
  path: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}
