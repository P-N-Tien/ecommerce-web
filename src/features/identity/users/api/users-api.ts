import { http } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { USE_MOCK_API } from '@/lib/api/runtime';
import type { UserRecord } from '@/features/identity/users/types';
import { mockDeleteUser, mockGetUsers, mockSetUserActive, mockUpdateUser, mockUserRole } from './mock-users-api';

type UserResult = UserRecord[] | { items: UserRecord[] } | { data: UserRecord[] | { items: UserRecord[] } };
function rows(result: UserResult): UserRecord[] { const outer = 'data' in result ? result.data : result; return Array.isArray(outer) ? outer : outer.items; }
export async function getUsers(): Promise<UserRecord[]> {
  if (USE_MOCK_API) return mockGetUsers();
  const { data } = await http.get<UserResult>(API_ENDPOINTS.USERS.BASE, { params: { page: 1, limit: 100 } });
  return rows(data);
}
export async function updateUser(id: string | number, input: Partial<Pick<UserRecord, 'firstName' | 'lastName' | 'email' | 'phone'>>): Promise<void> {
  if (USE_MOCK_API) return mockUpdateUser(id, input);
  await http.patch(API_ENDPOINTS.USERS.DETAIL(id), input);
}
export async function setUserActive(id: string | number, active: boolean): Promise<void> {
  if (USE_MOCK_API) return mockSetUserActive(id, active);
  await http.post(active ? API_ENDPOINTS.USERS.ACTIVATE(id) : API_ENDPOINTS.USERS.DEACTIVATE(id));
}
export async function deleteUser(id: string | number): Promise<void> {
  if (USE_MOCK_API) return mockDeleteUser(id);
  await http.delete(API_ENDPOINTS.USERS.DETAIL(id));
}
export async function assignUserRole(id: string | number, roleCode: string): Promise<void> {
  if (USE_MOCK_API) return mockUserRole(id, roleCode);
  await http.put(API_ENDPOINTS.USERS.ROLE(id), { roleCode });
}
