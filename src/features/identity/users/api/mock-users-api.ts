import type { UserRecord } from '@/features/identity/users/types';
import { mockDelay, mockNotFound, readMockList, writeMockList } from '@/services/mock/storage';
const KEY = 'ecommerce-admin.demo-users';
const seed: UserRecord[] = [
  { id: 'user-21', firstName: 'Mai', lastName: 'Nguyen', email: 'mai@example.com', phone: '+84 90 123 4567', roleCode: 'CUSTOMER', isActive: true, createdAt: '2026-10-02T08:00:00.000Z' },
  { id: 'user-18', firstName: 'Alex', lastName: 'Tran', email: 'alex@example.com', phone: '+84 90 555 0140', roleCode: 'CUSTOMER', isActive: true, createdAt: '2026-09-21T10:00:00.000Z' },
  { id: 'user-16', firstName: 'Sam', lastName: 'Lee', email: 'sam@example.com', phone: null, roleCode: 'CUSTOMER', isActive: false, createdAt: '2026-08-15T14:30:00.000Z' },
];
const read = () => readMockList(KEY, seed);
export async function mockGetUsers() { await mockDelay(); return read(); }
export async function mockUpdateUser(id: string | number, input: Partial<UserRecord>) { await mockDelay(); const users = read(); if (!users.some((u) => String(u.id) === String(id))) throw mockNotFound('User'); writeMockList(KEY, users.map((u) => String(u.id) === String(id) ? { ...u, ...input } : u)); }
export async function mockSetUserActive(id: string | number, active: boolean) { await mockDelay(); const users = read(); if (!users.some((u) => String(u.id) === String(id))) throw mockNotFound('User'); writeMockList(KEY, users.map((u) => String(u.id) === String(id) ? { ...u, isActive: active } : u)); }
export async function mockDeleteUser(id: string | number) { await mockDelay(); const users = read(); if (!users.some((u) => String(u.id) === String(id))) throw mockNotFound('User'); writeMockList(KEY, users.filter((u) => String(u.id) !== String(id))); }
export async function mockUserRole(id: string | number, roleCode: string) { await mockDelay(); const users = read(); if (!users.some((u) => String(u.id) === String(id))) throw mockNotFound('User'); writeMockList(KEY, users.map((u) => String(u.id) === String(id) ? { ...u, roleCode } : u)); }
