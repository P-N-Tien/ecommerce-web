import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/widgets/data-table';
import type { DataTableColumn } from '@/widgets/data-table';
import type { Category } from '@/features/catalog/categories/types';
import type { Product } from '@/features/catalog/products/types';
import { StatusBadge } from '@/components/ui/status-badge';

type ProductTableProps = {
  products: Product[];
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  categories: Category[];
  canManage?: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleActive: (product: Product) => void;
};

export function ProductTable({
  products,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  categories,
  canManage = false,
  onEdit,
  onDelete,
  onToggleActive,
}: ProductTableProps) {
  const columns: DataTableColumn<Product>[] = [
    {
      id: 'product',
      header: 'Product',
      cell: (product) => (
        <div className="flex items-center gap-3">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt="" className="size-10 rounded-md border object-cover" />
          ) : <div aria-hidden="true" className="size-10 rounded-md bg-muted" />}
          <div>
            <p className="font-medium">{product.name}</p>
            <p className="text-xs text-muted-foreground">{product.sku} · {product.slug}</p>
          </div>
        </div>
      ),
      headerClassName: 'px-5',
      cellClassName: 'px-5',
    },
    {
      id: 'price',
      header: 'Price',
      cell: (product) =>
        new Intl.NumberFormat(undefined, { style: 'currency', currency: product.currency }).format(product.price),
      headerClassName: 'px-5',
      cellClassName: 'px-5',
    },
    {
      id: 'category',
      header: 'Category',
      cell: (product) =>
        product.category?.name ??
        product.categoryName ??
        categories.find((category) => String(category.id) === String(product.categoryId))?.name ??
        '—',
      headerClassName: 'px-5',
      cellClassName: 'px-5 text-muted-foreground',
    },
    {
      id: 'status',
      header: 'Status',
      cell: (product) => <StatusBadge variant="product" isActive={product.isActive} />,
      headerClassName: 'px-5',
      cellClassName: 'px-5',
    },
    ...(canManage
      ? [
          {
            id: 'actions',
            header: 'Actions',
            cell: (product: Product) => (
              <div className="flex justify-end gap-1">
                <Button size="sm" variant="ghost" onClick={() => onEdit(product)} aria-label={`Edit ${product.name}`}>
                  <Pencil aria-hidden="true" /> Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onToggleActive(product)}>
                  {product.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => onDelete(product)}
                  aria-label={`Delete ${product.name}`}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            ),
            headerClassName: 'px-5 text-right',
            cellClassName: 'px-5',
          } satisfies DataTableColumn<Product>,
        ]
      : []),
  ];

  return (
    <DataTable
      data={products}
      columns={columns}
      getRowId={(product) => product.id}
      scrollRegionLabel="Products"
      tableClassName="min-w-[760px]"
      emptyState={<p className="p-10 text-center text-sm text-muted-foreground">No products found.</p>}
      pagination={{ page, pageSize, total, onPageChange, onPageSizeChange }}
    />
  );
}
