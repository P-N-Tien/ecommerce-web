import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthSession, LoginCredentials } from '@/features/auth/types';
import { loginRequest } from '@/features/auth/api/session-api';
import { ChangePasswordInput, changePasswordRequest } from '@/features/auth/api/change-password-api';

const AUTH_SESSION_QUERY_KEY = ['auth', 'session'] as const;

type AuthContextValue = {
  login: (credentials: LoginCredentials) => Promise<AuthSession>;
  changePassword: (input: ChangePasswordInput) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (session) => {
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, session);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePasswordRequest,
    onSuccess: () => {
      queryClient.setQueryData<AuthSession | undefined>(AUTH_SESSION_QUERY_KEY, (session) =>
        session ? { ...session, mustChangePassword: false } : session,
      );
    },
  });

  const changePassword = useCallback(
    (input: ChangePasswordInput) => changePasswordMutation.mutateAsync(input),
    [changePasswordMutation],
  );

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      return loginMutation.mutateAsync(credentials);
    },
    [loginMutation],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      login,
      changePassword,
    }),
    [login, changePassword],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export { AUTH_SESSION_QUERY_KEY };
