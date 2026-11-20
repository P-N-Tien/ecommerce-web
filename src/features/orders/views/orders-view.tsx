import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import { useAuth } from '@/app/providers/auth-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/widgets/data-table';
import type { DataTableColumn } from '@/widgets/data-table';
import { getOrders, transitionOrder } from '@/features/orders/api/orders-api';
import type { Order, OrderStatus } from '@/features/orders/types';
import { getErrorMessage } from '@/lib/api/parse-api-error';
import { PageContainer, PageHeader } from '@/widgets/page-layout/page-container';

const KEY = ['orders', 'list'] as const;
const actionFor: Partial<Record<OrderStatus, 'confirm' | 'process' | 'ship' | 'deliver'>> = { pending_payment: 'confirm', confirmed: 'process', processing: 'ship', shipped: 'deliver' };
const labels: Record<string, string> = { pending_payment: 'Pending payment', payment_failed: 'Payment failed', confirmed: 'Confirmed', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled', refunded: 'Refunded' };

export function OrdersView() {
  const client = useQueryClient();
  const { hasPermission } = useAuth();
  const canManage = hasPermission('manage_orders');
  const query = useQuery({ queryKey: KEY, queryFn: getOrders });
  const [selected, setSelected] = useState<Order | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: ({ order, action }: { order: Order; action: 'confirm' | 'process' | 'ship' | 'deliver' | 'cancel' }) => transitionOrder(order.id, action),
    onSuccess: async (status) => { await client.invalidateQueries({ queryKey: KEY }); setNotice(`Order status changed to ${labels[status]}.`); },
    onError: (cause) => setError(getErrorMessage(cause, 'Could not update order status.')),
  });
  const filtered = useMemo(() => (query.data ?? []).filter((order) => {
    const q = search.trim().toLowerCase();
    return (!q || order.orderNumber.toLowerCase().includes(q) || (order.userName ?? '').toLowerCase().includes(q)) && (!statusFilter || order.status === statusFilter);
  }), [query.data, search, statusFilter]);
  const columns: DataTableColumn<Order>[] = [
    { id: 'number', header: 'Order', cell: (order) => <div><p className="font-medium">{order.orderNumber}</p><p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p></div>, headerClassName: 'px-5', cellClassName: 'px-5' },
    { id: 'customer', header: 'Customer', cell: (order) => <div><p>{order.userName ?? `Customer #${order.userId}`}</p><p className="text-xs text-muted-foreground">{order.userEmail ?? ''}</p></div>, headerClassName: 'px-5', cellClassName: 'px-5' },
    { id: 'items', header: 'Items', cell: (order) => order.itemCount, headerClassName: 'px-5', cellClassName: 'px-5' },
    { id: 'total', header: 'Total', cell: (order) => new Intl.NumberFormat(undefined, { style: 'currency', currency: order.currency }).format(order.totalAmount), headerClassName: 'px-5', cellClassName: 'px-5' },
    { id: 'status', header: 'Status', cell: (order) => <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{labels[order.status]}</span>, headerClassName: 'px-5', cellClassName: 'px-5' },
    { id: 'actions', header: 'Actions', cell: (order) => <div className="flex justify-end gap-1">
      <Button size="sm" variant="ghost" onClick={() => setSelected(order)}><Eye aria-hidden="true" /> View</Button>
      {canManage && actionFor[order.status] ? <Button size="sm" variant="outline" disabled={mutation.isPending} onClick={() => mutation.mutate({ order, action: actionFor[order.status]! })}>{labels[actionFor[order.status]!]}</Button> : null}
      {canManage && !['delivered', 'cancelled', 'refunded'].includes(order.status) ? <Button size="sm" variant="ghost" className="text-destructive" disabled={mutation.isPending} onClick={() => mutation.mutate({ order, action: 'cancel' })}>Cancel</Button> : null}
    </div>, headerClassName: 'px-5 text-right', cellClassName: 'px-5' },
  ];
  return <PageContainer>
    <PageHeader section="Sales" title="Orders" description="Review customer purchases and move orders through fulfillment." />
    {notice ? <Alert role="status"><AlertTitle>Order updated</AlertTitle><AlertDescription>{notice}</AlertDescription></Alert> : null}
    {error ? <Alert variant="destructive"><AlertTitle>Order action failed</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
    <div className="flex flex-col gap-3 sm:flex-row"><Input className="sm:max-w-sm" placeholder="Search order or customer" value={search} onChange={(event) => setSearch(event.target.value)} /><select className="h-10 rounded-md border bg-background px-3 text-sm sm:w-56" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">All statuses</option>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
    <Card><CardContent className="p-0">{query.isPending ? <p className="p-8 text-center text-sm text-muted-foreground">Loading orders…</p> : query.isError ? <div className="p-6"><Alert variant="destructive"><AlertTitle>Could not load orders</AlertTitle><AlertDescription><Button size="sm" variant="outline" onClick={() => void query.refetch()}>Try again</Button></AlertDescription></Alert></div> : <DataTable data={filtered} columns={columns} getRowId={(order) => order.id} scrollRegionLabel="Orders" tableClassName="min-w-[950px]" emptyState={<p className="p-10 text-center text-sm text-muted-foreground">No orders match these filters.</p>} />}</CardContent></Card>
    <Dialog open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }} title={`Order ${selected?.orderNumber ?? ''}`} description={`${selected?.userName ?? 'Customer'} • ${selected ? labels[selected.status] : ''}`}>
      {selected ? <div className="space-y-4"><div className="divide-y rounded-md border">{selected.items?.map((item, index) => <div key={`${item.title}-${index}`} className="flex justify-between gap-4 p-3 text-sm"><span>{item.title} × {item.quantity}</span><span>{new Intl.NumberFormat(undefined, { style: 'currency', currency: selected.currency }).format(item.unitPrice * item.quantity)}</span></div>) ?? <p className="p-3 text-sm text-muted-foreground">{selected.itemCount} items</p>}</div><p className="text-right font-semibold">Total {new Intl.NumberFormat(undefined, { style: 'currency', currency: selected.currency }).format(selected.totalAmount)}</p></div> : null}
    </Dialog>
  </PageContainer>;
}
