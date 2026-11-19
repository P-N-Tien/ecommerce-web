import { useCallback, useMemo, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AuthSession, AuthStatus, LoginCredentials } from '@/features/auth/types';
import { changePasswordRequest, type ChangePasswordInput } from '@/features/auth/api/change-password-api';
import { loginRequest, refreshSessionRequest } from '@/features/auth/api/session-api';
import { hasPermission as sessionHasPermission } from '@/app/permissions';
import { AuthContext, type AuthContextValue } from '@/app/providers/auth-context';
import { AUTH_SESSION_QUERY_KEY } from '@/app/providers/auth-session-query-key';

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const sessionQuery = useQuery({
    queryKey: AUTH_SESSION_QUERY_KEY,
    queryFn: refreshSessionRequest,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (session) => queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, session),
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePasswordRequest,
    onSuccess: () => {
      queryClient.setQueryData<AuthSession | null>(AUTH_SESSION_QUERY_KEY, (session) =>
        session ? { ...session, mustChangePassword: false } : session,
      );
    },
  });

  const login = useCallback(
    (credentials: LoginCredentials) => loginMutation.mutateAsync(credentials),
    [loginMutation],
  );
  const changePassword = useCallback(
    (input: ChangePasswordInput) => changePasswordMutation.mutateAsync(input),
    [changePasswordMutation],
  );
  const hasPermission = useCallback(
    (permission?: string) => sessionHasPermission(sessionQuery.data?.permissions ?? [], permission),
    [sessionQuery.data?.permissions],
  );
  const retrySession = useCallback(() => {
    void sessionQuery.refetch();
  }, [sessionQuery]);

  const status: AuthStatus = sessionQuery.isPending
    ? 'loading'
    : sessionQuery.isError
      ? 'error'
      : sessionQuery.data
        ? 'authenticated'
        : 'unauthenticated';

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session: sessionQuery.data ?? null,
      sessionError: sessionQuery.error,
      login,
      changePassword,
      hasPermission,
      retrySession,
    }),
    [status, sessionQuery.data, sessionQuery.error, login, changePassword, hasPermission, retrySession],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

