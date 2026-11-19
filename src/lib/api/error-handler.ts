import axios from 'axios';

import type { ApiErrorResponse, BackendErrorPayload } from './api-types';

export const formatApiError = (
  status: number,
  originalUrl: string,
  backendError?: BackendErrorPayload,
): ApiErrorResponse => {
  const errorMessage = backendError?.error?.message ?? backendError?.message ?? 'An unexpected error occurred.';

  return {
    success: false,
    statusCode: status,
    message: errorMessage,

    error: {
      code: backendError?.error?.code ?? 'UNKNOWN_ERROR',
      message: errorMessage,
      details: backendError?.error?.details,
    },

    timestamp: backendError?.timestamp ?? new Date().toISOString(),

    path: backendError?.path ?? originalUrl,
  };
};

export const normalizeAxiosError = (error: unknown, originalUrl = ''): ApiErrorResponse => {
  if (axios.isAxiosError<BackendErrorPayload>(error)) {
    if (error.response) {
      return formatApiError(error.response.status, originalUrl, error.response.data);
    }

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return formatApiError(0, originalUrl, {
        message: 'The request timed out. Please try again.',
        error: {
          code: 'TIMEOUT_ERROR',
          message: 'The request timed out.',
        },
      });
    }

    return formatApiError(0, originalUrl, {
      message: 'Could not establish connection to the server.',
      error: {
        code: 'NETWORK_ERROR',
        message: 'Please check your network connection.',
      },
    });
  }

  return formatApiError(0, originalUrl, {
    message: 'An unexpected error occurred.',
    error: {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred.',
    },
  });
};
