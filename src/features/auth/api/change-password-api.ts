import { http } from '@/services/http';

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export async function changePasswordRequest(input: ChangePasswordInput): Promise<void> {
  await http.post('/api/v1/auth/change-password', input);
}
