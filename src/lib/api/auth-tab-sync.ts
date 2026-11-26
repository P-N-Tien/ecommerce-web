import type { AuthSession } from '@/features/auth/types';

export type SharedAuthSession = {
  accessToken: string | null;
  permissions: string[];
  session?: AuthSession;
};

type AuthTabMessage =
  | { type: 'session-request'; requestId: string }
  | { type: 'session-response'; requestId: string; session: SharedAuthSession }
  | { type: 'session-updated'; session: SharedAuthSession }
  | { type: 'logout' };

type AuthTabListener = (message: AuthTabMessage) => void;

const CHANNEL_NAME = 'ecommerce-admin-auth-v1';
const listeners = new Set<AuthTabListener>();
const channel: BroadcastChannel | null =
  typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CHANNEL_NAME);
let latestSharedSession: SharedAuthSession | null = null;

channel?.addEventListener('message', (event: MessageEvent<AuthTabMessage>) => {
  const message = event.data;
  if (!message || typeof message !== 'object') return;

  if (message.type === 'session-updated' || message.type === 'session-response') {
    latestSharedSession = message.session;
  } else if (message.type === 'logout') {
    latestSharedSession = null;
  }

  listeners.forEach((listener) => listener(message));
});

export function subscribeToAuthTabMessages(listener: AuthTabListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function broadcastAuthSession(session: SharedAuthSession): void {
  latestSharedSession = session;
  channel?.postMessage({ type: 'session-updated', session } satisfies AuthTabMessage);
}

export function broadcastAuthLogout(): void {
  latestSharedSession = null;
  channel?.postMessage({ type: 'logout' } satisfies AuthTabMessage);
}

export function getLatestSharedAuthSession(): SharedAuthSession | null {
  return latestSharedSession;
}

export function requestSharedAuthSession(timeoutMs = 120): Promise<SharedAuthSession | null> {
  if (!channel) return Promise.resolve(null);

  const requestId = crypto.randomUUID();
  return new Promise((resolve) => {
    let timeoutId = 0;
    const unsubscribe = subscribeToAuthTabMessages((message) => {
      if (message.type !== 'session-response' || message.requestId !== requestId) return;
      window.clearTimeout(timeoutId);
      unsubscribe();
      resolve(message.session);
    });

    timeoutId = window.setTimeout(() => {
      unsubscribe();
      resolve(null);
    }, timeoutMs);

    channel.postMessage({ type: 'session-request', requestId } satisfies AuthTabMessage);
  });
}

export function respondWithSharedAuthSession(requestId: string, session: SharedAuthSession): void {
  channel?.postMessage({ type: 'session-response', requestId, session } satisfies AuthTabMessage);
}
