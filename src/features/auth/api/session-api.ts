import type { AuthSession, LoginCredentials } from '@/features/auth/types';
import { http } from '@/services/http';

export class NotOperatorError extends Error {
  constructor() {
    super('NOT_OPERATOR');
    this.name = 'NotOperatorError';
  }
}

export async function loginRequest(credentials: LoginCredentials): Promise<AuthSession> {
  const { data } = await http.post('/api/v1/auth/login', credentials);
  return data;
}
