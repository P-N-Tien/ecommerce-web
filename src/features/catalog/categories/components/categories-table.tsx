import { useMemo, useState } from 'react';
import { FolderPlus, Pencil, Plus, Tag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QueryLoading, QueryStateAlert } from '@/components/feedback/query-state';
import { DataTable } from '@/widgets/data-table';
import type { DataTableColumn } from '@/widgets/data-table';
import type { Category } from '@/features/catalog/categories/types';

type CategoriesTableProps = {
  categories: Category[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  onCreate: () => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
};

export function CategoriesTable({
  categories,
  isLoading,
  isError,
  error,
  onRetry,
  onCreate,
  onEdit,
  onDelete,
}: CategoriesTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.max(1, Math.ceil(categories.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedCategories = useMemo(
    () => categories.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [categories, currentPage, pageSize],
  );
  const columns: DataTableColumn<Category>[] = [
    {
      id: 'category',
      header: 'Category',
      cell: (category) => (
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-primary/10 p-2 text-primary">
            <Tag className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="font-medium">{category.name}</p>
            {category.slug ? <p className="text-xs text-muted-foreground">{category.slug}</p> : null}
          </div>
        </div>
      ),
      headerClassName: 'px-5',
      cellClassName: 'px-5 py-4',
    },
    {
      id: 'description',
      header: 'Description',
      cell: (category) => category.description || '—',
      headerClassName: 'px-5',
      cellClassName: 'max-w-md px-5 py-4 text-muted-foreground',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (category) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(category)} aria-label={`Edit ${category.name}`}>
            <Pencil aria-hidden="true" /> Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(category)}
            aria-label={`Delete ${category.name}`}
          >
            <Trash2 aria-hidden="true" /> Delete
          </Button>
        </div>
      ),
      headerClassName: 'px-5 text-right',
      cellClassName: 'px-5 py-4',
    },
  ];

  return (
    <Card>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 text-center">
            <QueryLoading>Loading categories…</QueryLoading>
          </div>
        ) : isError ? (
          <div className="p-5">
            <QueryStateAlert isError hasData={false} error={error} onRetry={onRetry} resource="categories" />
          </div>
        ) : (
          <DataTable
            data={paginatedCategories}
            columns={columns}
            getRowId={(category) => category.id}
            scrollRegionLabel="Categories"
            tableClassName="min-w-[600px]"
            pagination={{
              page: currentPage,
              pageSize,
              total: categories.length,
              onPageChange: setPage,
              onPageSizeChange: (size) => {
                setPageSize(size);
                setPage(1);
              },
            }}
            emptyState={
              <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                <div className="rounded-full bg-muted p-3">
                  <FolderPlus className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-medium">No categories yet</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create your first category to start organizing products.
                  </p>
                </div>
                <Button variant="outline" onClick={onCreate}>
                  <Plus aria-hidden="true" /> Add category
                </Button>
              </div>
            }
          />
        )}
      </CardContent>
    </Card>
  );
}

export default CategoriesTable;
