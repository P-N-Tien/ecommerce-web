import type { Permission, Role, RoleInput } from '@/features/access/roles/types';
import { makeMockId, mockDelay, mockNotFound, readMockList, writeMockList } from '@/services/mock/storage';

const ROLE_KEY = 'ecommerce-admin.demo-roles';
const permissions: Permission[] = [
  'view_all_orders', 'manage_orders', 'view_all_products', 'manage_products', 'view_all_inventory', 'manage_inventory', 'view_all_users', 'manage_users', 'manage_roles',
].map((code, index) => ({ id: index + 1, code, description: code.replaceAll('_', ' ') }));
const seed: Role[] = [
  { id: 1, code: 'ADMIN', name: 'Administrator', isSystem: true, permissions: { codes: permissions.map((p) => p.code) }, createdAt: new Date().toISOString() },
  { id: 2, code: 'CUSTOMER', name: 'Customer', isSystem: true, permissions: { codes: [] }, createdAt: new Date().toISOString() },
  { id: 3, code: 'CATALOG_EDITOR', name: 'Catalog editor', isSystem: false, permissions: { codes: ['view_all_products', 'manage_products'] }, createdAt: new Date().toISOString() },
];
const read = () => readMockList(ROLE_KEY, seed);
export async function mockGetRoles() { await mockDelay(); return read(); }
export async function mockGetPermissions() { await mockDelay(); return permissions; }
export async function mockCreateRole(input: RoleInput) {
  await mockDelay();
  const roles = read();
  if (roles.some((role) => role.code.toUpperCase() === input.code?.trim().toUpperCase())) throw new Error('A role with this code already exists.');
  const now = new Date().toISOString();
  const role: Role = { id: makeMockId(), code: input.code!.trim().toUpperCase(), name: input.name.trim(), isSystem: false, permissions: { codes: input.permissions }, createdAt: now, updatedAt: now };
  writeMockList(ROLE_KEY, [...roles, role]); return role;
}
export async function mockUpdateRole(id: number | string, input: RoleInput) {
  await mockDelay(); const roles = read(); const current = roles.find((role) => String(role.id) === String(id));
  if (!current) throw mockNotFound('Role'); if (current.isSystem) throw new Error('System roles cannot be changed.');
  const updated = { ...current, name: input.name.trim(), permissions: { codes: input.permissions }, updatedAt: new Date().toISOString() };
  writeMockList(ROLE_KEY, roles.map((role) => String(role.id) === String(id) ? updated : role)); return updated;
}
export async function mockDeleteRole(id: number | string) {
  await mockDelay(); const roles = read(); const role = roles.find((item) => String(item.id) === String(id));
  if (!role) throw mockNotFound('Role'); if (role.isSystem) throw new Error('System roles cannot be deleted.');
  writeMockList(ROLE_KEY, roles.filter((item) => String(item.id) !== String(id)));
}
