import { createContext, useContext } from 'react';
import type { AuthSession, AuthStatus, LoginCredentials } from '@/features/auth/types';
import type { ChangePasswordInput } from '@/features/auth/api/change-password-api';

export type AuthContextValue = {
  status: AuthStatus;
  session: AuthSession | null;
  sessionError: unknown;
  login: (credentials: LoginCredentials) => Promise<AuthSession>;
  logout: () => Promise<void>;
  changePassword: (input: ChangePasswordInput) => Promise<void>;
  hasPermission: (permission?: string) => boolean;
  retrySession: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
