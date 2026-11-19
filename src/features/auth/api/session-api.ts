import { isAxiosError } from 'axios';
import type { AuthSession, LoginCredentials } from '@/features/auth/types';
import { authClient, http } from '@/lib/api';
import { AUTH_REFRESH_URL } from '@/lib/api/api-base-url';
import { USE_MOCK_API } from '@/lib/api/runtime';
import { mockLogin, mockRefreshSession } from './mock-auth';

function unwrap<T>(payload: T | { data: T }): T {
  return payload && typeof payload === 'object' && 'data' in payload ? payload.data : (payload as T);
}

export async function loginRequest(credentials: LoginCredentials): Promise<AuthSession> {
  if (USE_MOCK_API) return mockLogin(credentials.email, credentials.password);
  const { data } = await http.post<AuthSession | { data: AuthSession }>('/api/v1/auth/login', credentials);
  return unwrap(data);
}

export async function refreshSessionRequest(): Promise<AuthSession | null> {
  if (USE_MOCK_API) return mockRefreshSession();
  try {
    const { data } = await authClient.post<AuthSession | { data: AuthSession }>(AUTH_REFRESH_URL);
    return unwrap(data);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) return null;
    throw error;
  }
}
