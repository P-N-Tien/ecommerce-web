import axios from 'axios';

import type { ApiErrorDetail, ApiErrorResponse } from './api-types';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const formatApiError = (status: number, originalUrl: string, backendError?: unknown): ApiErrorResponse => {
  const timestamp = new Date().toISOString();

  if (typeof backendError === 'string' && backendError.trim().length > 0) {
    return {
      success: false,
      statusCode: status,
      message: status >= 500 ? 'Server error. Please try again later.' : backendError,
      errors: [],
      timestamp: new Date().toISOString(),
      path: originalUrl,
    };
  }

  if (!isRecord(backendError)) {
    return {
      success: false,
      statusCode: status,
      message: 'An unexpected error occurred.',
      errors: [],
      timestamp,
      path: originalUrl,
    };
  }

  const errorMessage =
    typeof backendError.message === 'string' && backendError.message.trim().length > 0
      ? backendError.message
      : 'An unexpected error occurred.';

  const normalizedErrors: ApiErrorDetail[] = Array.isArray(backendError.errors)
    ? (backendError.errors as ApiErrorDetail[])
    : [];

  return {
    success: false,
    statusCode: typeof backendError.statusCode === 'number' ? backendError.statusCode : status,
    message: errorMessage,
    errors: normalizedErrors,
    timestamp: typeof backendError.timestamp === 'string' ? backendError.timestamp : timestamp,
    path: typeof backendError.path === 'string' ? backendError.path : originalUrl,
  };
};

export const normalizeAxiosError = (error: unknown, originalUrl = ''): ApiErrorResponse => {
  if (axios.isAxiosError<unknown>(error)) {
    const requestUrl = error.config?.url ?? originalUrl;

    if (error.response) {
      return formatApiError(error.response.status, requestUrl, error.response.data);
    }

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return formatApiError(0, requestUrl, {
        message: 'The request timed out. Please try again.',
        errors: [
          {
            code: 'TIMEOUT_ERROR',
            message: 'The request timed out.',
          },
        ],
      });
    }

    return formatApiError(0, requestUrl, {
      message: 'Could not establish connection to the server.',
      errors: [
        {
          code: 'NETWORK_ERROR',
          message: 'Please check your network connection.',
        },
      ],
    });
  }

  const fallbackMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';

  return formatApiError(0, originalUrl, {
    message: fallbackMessage,
    errors: [
      {
        code: 'UNKNOWN_ERROR',
        message: fallbackMessage,
      },
    ],
  });
};
