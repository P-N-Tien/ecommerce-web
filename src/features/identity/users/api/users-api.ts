import { http } from '@/lib/api';
import { USE_MOCK_API } from '@/lib/api/runtime';
import type { UserRecord } from '@/features/identity/users/types';
import { mockDeleteUser, mockGetUsers, mockSetUserActive, mockUpdateUser, mockUserRole } from './mock-users-api';

type UserResult = UserRecord[] | { items: UserRecord[] } | { data: UserRecord[] | { items: UserRecord[] } };
function rows(result: UserResult): UserRecord[] { const outer = 'data' in result ? result.data : result; return Array.isArray(outer) ? outer : outer.items; }
export async function getUsers(): Promise<UserRecord[]> {
  if (USE_MOCK_API) return mockGetUsers();
  const { data } = await http.get<UserResult>('/api/v1/users', { params: { page: 1, limit: 100 } });
  return rows(data);
}
export async function updateUser(id: string | number, input: Partial<Pick<UserRecord, 'firstName' | 'lastName' | 'email' | 'phone'>>): Promise<void> {
  if (USE_MOCK_API) return mockUpdateUser(id, input);
  await http.patch(`/api/v1/users/${id}`, input);
}
export async function setUserActive(id: string | number, active: boolean): Promise<void> {
  if (USE_MOCK_API) return mockSetUserActive(id, active);
  await http.post(`/api/v1/users/${id}/${active ? 'activate' : 'deactivate'}`);
}
export async function deleteUser(id: string | number): Promise<void> {
  if (USE_MOCK_API) return mockDeleteUser(id);
  await http.delete(`/api/v1/users/${id}`);
}
export async function assignUserRole(id: string | number, roleCode: string): Promise<void> {
  if (USE_MOCK_API) return mockUserRole(id, roleCode);
  await http.put(`/api/v1/users/${id}/role`, { roleCode });
}
