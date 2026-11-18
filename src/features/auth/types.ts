export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthTokensResponse = {
  accessToken: string;
  refreshToken?: string;
  mustChangePassword: boolean;
  permissions: string[];
};

export type AuthSession = {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  mustChangePassword: boolean;
};

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';
