import type { AuthSession, AuthTokensResponse, LoginCredentials } from '@/features/auth/types';
import { authClient, http } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { USE_MOCK_API } from '@/lib/api/runtime';
import { mockLogin } from './mock-auth';
import { clearAccessToken, setAccessToken } from '@/lib/api/auth-session';
import { decodeAccessTokenClaims } from '@/lib/api/jwt-decode';
import { hasPermission } from '@/app/permissions';
import { ACCESS_ADMIN_PERMISSION } from '@/lib/api/admin-access';
import { silentRefreshSession } from '@/lib/api/silent-refresh';

export class NotOperatorError extends Error {
  constructor() {
    super('NOT_OPERATOR');
    this.name = 'NotOperatorError';
  }
}

function parsePermissions(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === 'string');
}

function parseTokensResponse(data: unknown): AuthTokensResponse {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid authentication response');
  }

  const record = data as Record<string, unknown>;
  if (typeof record.accessToken !== 'string') {
    throw new Error('Authentication response missing access token');
  }

  return {
    accessToken: record.accessToken,
    permissions: parsePermissions(record.permissions),
  };
}

export function buildSessionFromAccessToken(accessToken: string, permissions: string[] = []): AuthSession {
  const claims = decodeAccessTokenClaims(accessToken);

  if (!claims) {
    throw new Error('Invalid access token');
  }

  setAccessToken(accessToken);
  return {
    userId: claims.sub,
    email: claims.email,
    roles: claims.roles,
    permissions,
  };
}

function hasAdminAccess(permissions: string[]): boolean {
  return hasPermission(permissions, ACCESS_ADMIN_PERMISSION);
}

async function clearNonOperatorSession(): Promise<void> {
  try {
    await logoutRequest();
  } catch {
    // Best-effort cookie clear; always drop in-memory token.
  } finally {
    clearAccessToken();
  }
}

async function ensureAdminAccessSession(accessToken: string, permissions: string[]): Promise<AuthSession> {
  if (!hasAdminAccess(permissions)) {
    setAccessToken(accessToken);
    await clearNonOperatorSession();
    throw new NotOperatorError();
  }

  return buildSessionFromAccessToken(accessToken, permissions);
}

export async function loginRequest(credentials: LoginCredentials): Promise<AuthSession> {
  if (USE_MOCK_API) return mockLogin(credentials.email, credentials.password);
  const { data } = await authClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  const authSessionData: AuthSession | null = data?.data;
  const tokens = parseTokensResponse(authSessionData);
  return ensureAdminAccessSession(tokens.accessToken, tokens.permissions);
}

export async function refreshSessionRequest(): Promise<AuthSession | null> {
  const result = await silentRefreshSession();

  if (!result) {
    return null;
  }

  if (!hasAdminAccess(result.permissions)) {
    setAccessToken(result.accessToken);
    await clearNonOperatorSession();
    return null;
  }
  return buildSessionFromAccessToken(result.accessToken, result.permissions);
}

export async function logoutRequest(): Promise<void> {
  await http.post(API_ENDPOINTS.AUTH.LOGOUT);
}
