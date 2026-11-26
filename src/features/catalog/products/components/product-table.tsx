import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/widgets/data-table';
import type { DataTableColumn } from '@/widgets/data-table';
import type { Category } from '@/features/catalog/categories/types';
import type { Product } from '@/features/catalog/products/types';
import { formatDate } from '@/lib/format';
import type { ProductListFilters } from '@/features/catalog/products/types';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

type ProductTableProps = {
  products: Product[];
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  sortBy: ProductListFilters['sortBy'];
  sortOrder: ProductListFilters['sortOrder'];
  onSortChange: (sortBy: 'name' | 'createdAt' | 'price') => void;
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
  sortBy,
  sortOrder,
  onSortChange,
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
      sortKey: 'name',
      cell: (product) => (
        <div className="flex items-center gap-3">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt="" className="size-10 rounded-md border object-cover" />
          ) : (
            <div aria-hidden="true" className="size-10 rounded-md bg-muted" />
          )}
          <div>
            <p className="font-medium">{product.name}</p>
            <p className="text-xs text-muted-foreground">{product.slug}</p>
          </div>
        </div>
      ),
      headerClassName: 'px-5',
      cellClassName: 'px-5',
    },
    {
      id: 'sku',
      header: 'Sku',
      cell: (product) => <p className="text-xs text-muted-foreground">{product.sku}</p>,
      headerClassName: 'px-5',
      cellClassName: 'px-5',
    },
    {
      id: 'price',
      header: 'Price',
      cell: (product) =>
        new Intl.NumberFormat(undefined, { style: 'currency', currency: product.currency }).format(product.price),
      sortKey: 'price',
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
      cell: (product) => (
        <Switch
          checked={product.isActive}
          disabled={!canManage}
          label={`${product.isActive ? 'Deactivate' : 'Activate'} ${product.name}`}
          onCheckedChange={() => onToggleActive(product)}
        />
      ),
      headerClassName: 'px-5',
      cellClassName: 'px-5',
    },
    {
      id: 'createAt',
      header: 'Created At',
      cell: (product) => formatDate(product.createdAt),
      sortKey: 'createdAt',
      headerClassName: 'px-5',
      cellClassName: 'px-5',
    },
    ...(canManage
      ? [
          {
            id: 'actions',
            header: 'Actions',
            cell: (product: Product) => (
              <div className="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" aria-label={`Actions for ${product.name}`}>
                      <MoreHorizontal aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => onEdit(product)}>
                      <Pencil aria-hidden="true" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onSelect={() => onDelete(product)}>
                      <Trash2 aria-hidden="true" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
      sorting={{ sortBy, sortOrder, onSortChange: (key) => onSortChange(key as 'name' | 'createdAt' | 'price') }}
    />
  );
}
