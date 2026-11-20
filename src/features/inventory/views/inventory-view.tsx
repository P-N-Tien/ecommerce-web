import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/widgets/data-table';
import type { DataTableColumn } from '@/widgets/data-table';
import { RecordEditorDialog, type EditorField } from '@/widgets/record-editor-dialog';
import { useAuth } from '@/app/providers/auth-context';
import { adjustStock, getInventory } from '@/features/inventory/api/inventory-api';
import type { InventoryItem } from '@/features/inventory/types';
import { getErrorMessage } from '@/lib/api/parse-api-error';
import { PageContainer, PageHeader } from '@/widgets/page-layout/page-container';

const KEY = ['inventory', 'items'] as const;

export function InventoryView() {
  const client = useQueryClient();
  const { hasPermission } = useAuth();
  const inventoryQuery = useQuery({ queryKey: KEY, queryFn: getInventory });
  const canManage = hasPermission('manage_inventory');
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: ({ productId, input }: { productId: string | number; input: { quantity: number; type: 'ADD' | 'SUBTRACT' | 'SET'; reason?: string } }) => adjustStock(productId, input),
    onSuccess: async () => { await client.invalidateQueries({ queryKey: KEY }); setSelected(null); setNotice('Inventory updated.'); },
    onError: (cause) => setError(getErrorMessage(cause, 'Could not adjust inventory.')),
  });
  const fields = useMemo<EditorField[]>(() => [
    { name: 'type', label: 'Adjustment', type: 'select', required: true, options: [{ value: 'ADD', label: 'Add stock' }, { value: 'SUBTRACT', label: 'Remove stock' }, { value: 'SET', label: 'Set available quantity' }] },
    { name: 'quantity', label: 'Quantity', type: 'number', min: 0, step: 1, required: true },
    { name: 'reason', label: 'Reason', type: 'textarea' },
  ], []);
  const columns: DataTableColumn<InventoryItem>[] = [
    { id: 'product', header: 'Product', cell: (item) => <div><p className="font-medium">{item.productTitle}</p><p className="text-xs text-muted-foreground">{item.sku}</p></div>, headerClassName: 'px-5', cellClassName: 'px-5' },
    { id: 'available', header: 'Available', cell: (item) => item.availableQuantity, headerClassName: 'px-5', cellClassName: 'px-5 font-medium' },
    { id: 'reserved', header: 'Reserved', cell: (item) => item.reservedQuantity, headerClassName: 'px-5', cellClassName: 'px-5' },
    { id: 'total', header: 'Total', cell: (item) => item.totalQuantity, headerClassName: 'px-5', cellClassName: 'px-5' },
    { id: 'status', header: 'Stock status', cell: (item) => item.availableQuantity <= item.lowStockThreshold ? <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">Low stock</span> : <span className="text-sm text-muted-foreground">In stock</span>, headerClassName: 'px-5', cellClassName: 'px-5' },
    ...(canManage ? [{ id: 'action', header: 'Action', cell: (item: InventoryItem) => <div className="text-right"><Button size="sm" variant="outline" onClick={() => { setError(null); setSelected(item); }}>Adjust stock</Button></div>, headerClassName: 'px-5 text-right', cellClassName: 'px-5' } satisfies DataTableColumn<InventoryItem>] : []),
  ];
  async function save(values: Record<string, string | number>) {
    if (!selected) return;
    setError(null);
    await mutation.mutateAsync({ productId: selected.productId, input: { type: String(values.type) as 'ADD' | 'SUBTRACT' | 'SET', quantity: Number(values.quantity), reason: String(values.reason ?? '') } });
  }
  return <PageContainer>
    <PageHeader section="Operations" title="Inventory" description="Review available stock and make inventory adjustments." />
    {notice ? <Alert role="status"><AlertTitle>Inventory updated</AlertTitle><AlertDescription>{notice}</AlertDescription></Alert> : null}
    {error && !selected ? <Alert variant="destructive"><AlertTitle>Inventory action failed</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
    {selected ? <RecordEditorDialog open onOpenChange={(open) => { if (!open && !mutation.isPending) setSelected(null); }} title={`Adjust ${selected.productTitle}`} description="Changes apply to available stock. Reserved stock remains unchanged." fields={fields} initialValues={{ type: 'ADD', quantity: 1 }} isSaving={mutation.isPending} errorMessage={error} submitLabel="Apply adjustment" onSubmit={save} /> : null}
    <Card><CardContent className="p-0">{inventoryQuery.isPending ? <p className="p-8 text-center text-sm text-muted-foreground">Loading inventory…</p> : inventoryQuery.isError ? <div className="p-6"><Alert variant="destructive"><AlertTitle>Could not load inventory</AlertTitle><AlertDescription><Button variant="outline" size="sm" onClick={() => void inventoryQuery.refetch()}>Try again</Button></AlertDescription></Alert></div> : <DataTable data={inventoryQuery.data ?? []} columns={columns} getRowId={(item) => item.id} scrollRegionLabel="Inventory" tableClassName="min-w-[800px]" emptyState={<p className="p-10 text-center text-sm text-muted-foreground">No inventory records found.</p>} />}</CardContent></Card>
  </PageContainer>;
}
