import { http } from '@/lib/api';
import { USE_MOCK_API } from '@/lib/api/runtime';
import type { Permission, Role, RoleInput } from '@/features/access/roles/types';
import { mockCreateRole, mockDeleteRole, mockGetPermissions, mockGetRoles, mockUpdateRole } from './mock-roles-api';

export async function getRoles(): Promise<Role[]> {
  if (USE_MOCK_API) return mockGetRoles();
  const { data } = await http.get<Role[]>('/api/v1/roles'); return data;
}
export async function getPermissions(): Promise<Permission[]> {
  if (USE_MOCK_API) return mockGetPermissions();
  const { data } = await http.get<Permission[]>('/api/v1/permissions'); return data;
}
export async function saveRole(id: number | string | null, input: RoleInput): Promise<Role> {
  if (USE_MOCK_API) return id === null ? mockCreateRole(input) : mockUpdateRole(id, input);
  if (id === null) { const { data } = await http.post<Role>('/api/v1/roles', input); return data; }
  const { data } = await http.patch<Role>(`/api/v1/roles/${id}`, input); return data;
}
export async function deleteRole(id: number | string): Promise<void> {
  if (USE_MOCK_API) return mockDeleteRole(id);
  await http.delete(`/api/v1/roles/${id}`);
}
