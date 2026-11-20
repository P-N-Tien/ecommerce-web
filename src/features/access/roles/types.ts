export type Permission = { id: number | string; code: string; description: string };
export type Role = {
  id: number | string;
  code: string;
  name: string;
  isSystem: boolean;
  permissions: { codes: string[] };
  createdAt: string;
  updatedAt?: string;
};
export type RoleInput = { code?: string; name: string; permissions: string[] };
