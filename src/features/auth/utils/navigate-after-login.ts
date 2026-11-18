import type { AuthSession } from '@/features/auth/types';
import { safeRedirectPath } from './safe-redirect-path';
import { getDefaultLandingRoute } from '@/app/safe-landing';

export function navigateAfterLoginPath(session: AuthSession, redirectQuery: string | null): string {
  if (session.mustChangePassword) {
    return '/change-password';
  }

  const rawPath = safeRedirectPath(redirectQuery);
  if (rawPath === '/') {
    return getDefaultLandingRoute(session.permissions);
  }

  return rawPath;
}
