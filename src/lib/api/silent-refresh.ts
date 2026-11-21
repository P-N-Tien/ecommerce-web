import { isAccessTokenUsable } from '@/lib/api/access-token';
import { getAccessToken, setAccessToken } from '@/lib/api/auth-session';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { authClient } from '@/lib/api/http-client';

export type SilentRefreshResult = {
  accessToken: string;
  permissions: string[];
};

type SessionRefreshListener = (result: SilentRefreshResult) => void;
const listeners = new Set<SessionRefreshListener>();

/**
 * Register a callback invoked whenever a mid-request silent refresh succeeds.
 * Returns an unsubscribe function.
 */
export function onSessionRefreshed(listener: SessionRefreshListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

let inFlightRefresh: Promise<SilentRefreshResult | null> | null = null;

function parseAccessToken(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const record = data as Record<string, unknown>;
  return typeof record.accessToken === 'string' ? record.accessToken : null;
}

function parsePermissions(record: Record<string, unknown>): string[] {
  if (Array.isArray(record.permissions)) {
    return record.permissions.filter((item): item is string => typeof item === 'string');
  }
  return [];
}

function notifySessionRefreshed(result: SilentRefreshResult): void {
  listeners.forEach((listener) => {
    try {
      listener(result);
    } catch {
      // Listener exceptions should not affect token return
    }
  });
}

async function performSilentRefresh(): Promise<SilentRefreshResult | null> {
  const { data: _data, status } = await authClient.post(API_ENDPOINTS.AUTH.REFRESH);

  // Anonymous bootstrap (no refresh cookie) is expected; return null quietly.
  // Do not log the response body - it must never include tokens or PII.
  if (status === 401) {
    return null;
  }

  const data: unknown = _data?.data;
  const accessToken = parseAccessToken(data);

  if (!accessToken) {
    throw new Error('Authentication response missing access token');
  }

  setAccessToken(accessToken);

  const record = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};

  const refreshResult: SilentRefreshResult = {
    accessToken,
    permissions: parsePermissions(record),
  };

  notifySessionRefreshed(refreshResult);
  return refreshResult;
}

/**
 * Single-flight silent refresh for boot and mid-request 401 recovery.
 * Uses raw fetch so it does not re-enter apiClient middleware.
 *
 * `null` means the refresh cookie is gone or invalid (unauthenticated).
 * HTTP 5xx / 429 / network failures throw so callers keep the current session.
 */
export function silentRefreshSession(): Promise<SilentRefreshResult | null> {
  if (!inFlightRefresh) {
    inFlightRefresh = performSilentRefresh().finally(() => {
      inFlightRefresh = null;
    });
  }
  return inFlightRefresh;
}

/**
 * Single-flight silent refresh for mid-request 401 recovery.
 * Uses raw fetch so it does not re-enter apiClient middleware.
 */
export async function silentRefreshAccessToken(): Promise<string | null> {
  const result = await silentRefreshSession();
  return result?.accessToken ?? null;
}

/**
 * Return a usable in-memory access token, refreshing via the HttpOnly cookie
 * when the current token is missing, malformed, or near expiry.
 */
export async function ensureFreshAccessToken(): Promise<string | null> {
  const current = getAccessToken();
  if (isAccessTokenUsable(current)) {
    return current;
  }

  return silentRefreshAccessToken();
}

/** Test helper - resets the in-flight latch and registered listeners. */
export function resetSilentRefreshLatchForTests(): void {
  inFlightRefresh = null;
  listeners.clear();
}
