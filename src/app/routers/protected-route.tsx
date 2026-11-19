import { Navigate, useLocation } from 'react-router';
import type { ReactNode } from 'react';
import { useAuth } from '@/app/providers/auth-context';
import { AuthLoadingScreen, AuthSessionErrorScreen } from '@/features/auth/components/auth-loading-screen';

type ProtectedRouteProps = {
  children: ReactNode;
  enforcePasswordChange?: boolean;
};

export function ProtectedRoute({ children, enforcePasswordChange = false }: ProtectedRouteProps) {
  const { status, session, sessionError, retrySession } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <AuthLoadingScreen />;
  }

  if (status === 'error') {
    return <AuthSessionErrorScreen error={sessionError} onRetry={retrySession} />;
  }

  if (status === 'unauthenticated') {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  if (enforcePasswordChange && session?.mustChangePassword && location.pathname !== '/change-password') {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate to="/change-password" state={{ redirect }} replace />;
  }

  return children;
}
