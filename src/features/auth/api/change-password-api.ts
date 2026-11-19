import { http } from '@/lib/api';
import { mockChangePassword } from './mock-auth';
import { USE_MOCK_API } from '@/lib/api/runtime';

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export async function changePasswordRequest(input: ChangePasswordInput): Promise<void> {
  if (USE_MOCK_API) return mockChangePassword(input.currentPassword, input.newPassword);
  await http.post('/api/v1/auth/change-password', input);
}
