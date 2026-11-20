import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/app/providers/auth-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { DataTable } from '@/widgets/data-table';
import type { DataTableColumn } from '@/widgets/data-table';
import { RecordEditorDialog, type EditorField } from '@/widgets/record-editor-dialog';
import { getRoles } from '@/features/access/roles/api/roles-api';
import { assignUserRole, deleteUser, getUsers, setUserActive, updateUser } from '@/features/identity/users/api/users-api';
import type { UserRecord } from '@/features/identity/users/types';
import { getErrorMessage } from '@/lib/api/parse-api-error';
import { PageContainer, PageHeader } from '@/widgets/page-layout/page-container';

const USERS_KEY = ['identity', 'users'] as const;
const ROLES_KEY = ['access', 'roles'] as const;
const NO_ROLES: Awaited<ReturnType<typeof getRoles>> = [];

export function UsersView() {
  const client = useQueryClient();
  const { hasPermission } = useAuth();
  const canManage = hasPermission('manage_users');
  const canAssignRoles = hasPermission('manage_roles');
  const usersQuery = useQuery({ queryKey: USERS_KEY, queryFn: getUsers });
  const rolesQuery = useQuery({ queryKey: ROLES_KEY, queryFn: getRoles });
  const [editing, setEditing] = useState<UserRecord | null>(null);
  const [deleting, setDeleting] = useState<UserRecord | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const editMutation = useMutation({
    mutationFn: async ({ user, values }: { user: UserRecord; values: Record<string, string | number> }) => {
      await updateUser(user.id, { firstName: String(values.firstName), lastName: String(values.lastName), email: String(values.email), phone: String(values.phone || '') || null });
      if (canAssignRoles && values.roleCode && values.roleCode !== user.roleCode) await assignUserRole(user.id, String(values.roleCode));
    },
    onSuccess: async () => { await client.invalidateQueries({ queryKey: USERS_KEY }); setEditing(null); setNotice('User updated.'); },
    onError: (cause) => setError(getErrorMessage(cause, 'Could not update user.')),
  });
  const statusMutation = useMutation({ mutationFn: ({ user, active }: { user: UserRecord; active: boolean }) => setUserActive(user.id, active), onSuccess: async () => { await client.invalidateQueries({ queryKey: USERS_KEY }); setNotice('User status updated.'); }, onError: (cause) => setError(getErrorMessage(cause, 'Could not update user status.')) });
  const deleteMutation = useMutation({ mutationFn: deleteUser, onSuccess: async () => { await client.invalidateQueries({ queryKey: USERS_KEY }); setDeleting(null); setNotice('User deleted.'); }, onError: (cause) => setError(getErrorMessage(cause, 'Could not delete user.')) });
  const roles = rolesQuery.data ?? NO_ROLES;
  const fields = useMemo<EditorField[]>(() => [
    { name: 'firstName', label: 'First name', required: true }, { name: 'lastName', label: 'Last name', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true }, { name: 'phone', label: 'Phone' },
    ...(canAssignRoles ? [{ name: 'roleCode', label: 'Role', type: 'select' as const, options: roles.map((role) => ({ value: role.code, label: role.name })) }] : []),
  ], [canAssignRoles, roles]);
  const initial = useMemo(() => editing ? { firstName: editing.firstName, lastName: editing.lastName, email: editing.email, phone: editing.phone ?? '', roleCode: editing.roleCode ?? '' } : {}, [editing]);
  const columns: DataTableColumn<UserRecord>[] = [
    { id: 'name', header: 'User', cell: (user) => <div><p className="font-medium">{user.firstName} {user.lastName}</p><p className="text-xs text-muted-foreground">{user.email}</p></div>, headerClassName: 'px-5', cellClassName: 'px-5' },
    { id: 'phone', header: 'Phone', cell: (user) => user.phone || '—', headerClassName: 'px-5', cellClassName: 'px-5 text-muted-foreground' },
    { id: 'role', header: 'Role', cell: (user) => user.roleCode ?? '—', headerClassName: 'px-5', cellClassName: 'px-5' },
    { id: 'status', header: 'Status', cell: (user) => user.isActive ? 'Active' : 'Inactive', headerClassName: 'px-5', cellClassName: 'px-5' },
    ...(canManage ? [{ id: 'actions', header: 'Actions', cell: (user: UserRecord) => <div className="flex justify-end gap-1"><Button variant="ghost" size="sm" onClick={() => { setEditing(user); setError(null); }}><Pencil aria-hidden="true" /> Edit</Button><Button variant="ghost" size="sm" onClick={() => statusMutation.mutate({ user, active: !user.isActive })}>{user.isActive ? 'Deactivate' : 'Activate'}</Button><Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleting(user)} aria-label={`Delete ${user.email}`}><Trash2 aria-hidden="true" /></Button></div>, headerClassName: 'px-5 text-right', cellClassName: 'px-5' } satisfies DataTableColumn<UserRecord>] : []),
  ];
  async function save(values: Record<string, string | number>) { if (!editing) return; setError(null); await editMutation.mutateAsync({ user: editing, values }); }
  return <PageContainer>
    <PageHeader section="Access" title="Users" description="Review customer and operator accounts, roles, and status." />
    {notice ? <Alert role="status"><AlertTitle>User updated</AlertTitle><AlertDescription>{notice}</AlertDescription></Alert> : null}
    {error ? <Alert variant="destructive"><AlertTitle>User action failed</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
    {editing ? <RecordEditorDialog open onOpenChange={(open) => { if (!open && !editMutation.isPending) setEditing(null); }} title="Edit user" description={editing.email} fields={fields} initialValues={initial} isSaving={editMutation.isPending} submitLabel="Save user" onSubmit={save} /> : null}
    <Dialog open={deleting !== null} onOpenChange={(open) => { if (!open) setDeleting(null); }} title="Delete user?" description={`This removes ${deleting?.email ?? 'the account'} and cannot be undone.`}><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button><Button variant="destructive" disabled={deleteMutation.isPending} onClick={() => deleting && deleteMutation.mutate(deleting.id)}>{deleteMutation.isPending ? 'Deleting…' : 'Delete user'}</Button></div></Dialog>
    <Card><CardContent className="p-0">{usersQuery.isPending ? <p className="p-8 text-center text-sm text-muted-foreground">Loading users…</p> : usersQuery.isError ? <div className="p-6"><Alert variant="destructive"><AlertTitle>Could not load users</AlertTitle><AlertDescription><Button size="sm" variant="outline" onClick={() => void usersQuery.refetch()}>Try again</Button></AlertDescription></Alert></div> : <DataTable data={usersQuery.data ?? []} columns={columns} getRowId={(user) => user.id} scrollRegionLabel="Users" tableClassName="min-w-[780px]" emptyState={<p className="p-10 text-center text-sm text-muted-foreground">No users found.</p>} />}</CardContent></Card>
  </PageContainer>;
}
