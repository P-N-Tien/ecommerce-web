import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Shield, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PageContainer, PageHeader } from '@/widgets/page-layout/page-container';
import { DataTable, type DataTableColumn } from '@/widgets/data-table';
import { useAuth } from '@/app/providers/auth-context';
import { deleteRole, getPermissions, getRoles, saveRole } from '@/features/access/roles/api/roles-api';
import type { Role } from '@/features/access/roles/types';

const ROLES_KEY = ['access', 'roles'] as const;
export function RolesView() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const canManage = session?.permissions.includes('manage_roles') ?? false;
  const rolesQuery = useQuery({ queryKey: ROLES_KEY, queryFn: getRoles });
  const permissionsQuery = useQuery({ queryKey: ['access', 'permissions'], queryFn: getPermissions });
  const [selected, setSelected] = useState<Role | null>(null);
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [error, setError] = useState('');
  const saveMutation = useMutation({ mutationFn: () => saveRole(selected?.id ?? null, { name, code, permissions: selectedPermissions }), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ROLES_KEY }); setOpen(false); toast.success(selected ? 'Role updated.' : 'Role created.'); }, onError: (cause) => setError(cause instanceof Error ? cause.message : 'Could not save role.') });
  const deleteMutation = useMutation({ mutationFn: (id: number | string) => deleteRole(id), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ROLES_KEY }); setDeleteTarget(null); toast.success('Role deleted.'); }, onError: (cause) => toast.error(cause instanceof Error ? cause.message : 'Could not delete role.') });
  const columns: DataTableColumn<Role>[] = useMemo(() => [
    { id: 'name', header: 'Role', cell: (role) => <div className="font-medium">{role.name}<div className="text-xs text-muted-foreground">{role.code}</div></div> },
    { id: 'permissions', header: 'Permissions', cell: (role) => <span className="text-sm">{role.permissions.codes.length} permissions</span> },
    { id: 'type', header: 'Type', cell: (role) => <span className="inline-flex items-center gap-1 text-sm text-muted-foreground"><Shield className="size-3.5" />{role.isSystem ? 'System' : 'Custom'}</span> },
    { id: 'actions', header: '', cell: (role) => !canManage || role.isSystem ? null : <div className="flex justify-end gap-1"><Button aria-label={`Edit ${role.name}`} size="icon" variant="ghost" onClick={() => startEdit(role)}><Pencil /></Button><Button aria-label={`Delete ${role.name}`} size="icon" variant="ghost" onClick={() => setDeleteTarget(role)}><Trash2 /></Button></div> },
  ], [canManage]);
  function startEdit(role?: Role) { setSelected(role ?? null); setName(role?.name ?? ''); setCode(role?.code ?? ''); setSelectedPermissions(role?.permissions.codes ?? []); setError(''); setOpen(true); }
  function togglePermission(permission: string) { setSelectedPermissions((current) => current.includes(permission) ? current.filter((item) => item !== permission) : [...current, permission]); }
  return <PageContainer>
    <PageHeader section="Access" title="Roles & permissions" description="Control which areas and actions each role can access." action={canManage ? <Button onClick={() => startEdit()}><Plus /> Add role</Button> : undefined} />
    <Card><CardContent className="p-0">{rolesQuery.isPending ? <p className="p-8 text-center text-sm text-muted-foreground">Loading roles…</p> : rolesQuery.isError ? <p className="p-8 text-center text-sm text-destructive">Could not load roles. Refresh to try again.</p> : <DataTable data={rolesQuery.data ?? []} columns={columns} getRowId={(role) => role.id} scrollRegionLabel="Roles" tableClassName="min-w-[650px]" emptyState={<p className="p-10 text-center text-sm text-muted-foreground">No roles found.</p>} />}</CardContent></Card>
    <Dialog open={open} onOpenChange={setOpen} title={selected ? 'Edit role' : 'Create role'} description="Choose a clear name and the permissions this role needs.">
      <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); saveMutation.mutate(); }}>
        <label className="block space-y-2 text-sm font-medium">Role name<Input value={name} onChange={(event) => setName(event.target.value)} required maxLength={80} /></label>
        {!selected ? <label className="block space-y-2 text-sm font-medium">Role code<Input value={code} onChange={(event) => setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))} required pattern="[A-Z][A-Z0-9_]*" placeholder="CONTENT_EDITOR" /></label> : null}
        <fieldset className="max-h-64 space-y-2 overflow-y-auto rounded-md border p-3"><legend className="px-1 text-sm font-medium">Permissions</legend>{permissionsQuery.data?.map((permission) => <label key={permission.code} className="flex cursor-pointer items-start gap-2 text-sm"><input type="checkbox" checked={selectedPermissions.includes(permission.code)} onChange={() => togglePermission(permission.code)} className="mt-1 accent-primary" /><span><span className="font-medium">{permission.code}</span><span className="block text-xs text-muted-foreground">{permission.description}</span></span></label>)}</fieldset>
        {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={saveMutation.isPending || permissionsQuery.isPending}>{saveMutation.isPending ? 'Saving…' : selected ? 'Save changes' : 'Create role'}</Button></div>
      </form>
    </Dialog>
    <Dialog open={deleteTarget !== null} onOpenChange={(value) => { if (!value) setDeleteTarget(null); }} title="Delete role" description={`Delete “${deleteTarget?.name ?? ''}”? Users assigned to it may need another role.`}>
      <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button><Button variant="destructive" disabled={deleteMutation.isPending} onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}>{deleteMutation.isPending ? 'Deleting…' : 'Delete role'}</Button></div>
    </Dialog>
  </PageContainer>;
}
