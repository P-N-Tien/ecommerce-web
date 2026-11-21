export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthTokensResponse = {
  accessToken: string;
  permissions: string[];
};

export type AuthSession = {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
};

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';
