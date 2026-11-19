import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FolderPlus, Pencil, Plus, Tag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog } from '@/components/ui/dialog';
import { DataTable } from '@/widgets/data-table';
import type { DataTableColumn } from '@/widgets/data-table';
import { CategoryForm } from '@/features/catalog/categories/components/category-form';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '@/features/catalog/categories/api/categories-api';
import type { Category, CategoryInput } from '@/features/catalog/categories/types';
import type { CategoryFormValues } from '@/features/catalog/categories/schemas/category-schema';
import { getErrorMessage } from '@/lib/api/parse-api-error';

const CATEGORIES_QUERY_KEY = ['catalog', 'categories'] as const;

type CategoryNotice = {
  variant: 'default' | 'destructive';
  title: string;
  message: string;
};

function CategoriesPage() {
  const queryClient = useQueryClient();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<CategoryNotice | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const categoriesQuery = useQuery({ queryKey: CATEGORIES_QUERY_KEY, queryFn: getCategories });

  const saveMutation = useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: CategoryInput }) =>
      id ? updateCategory(id, values) : createCategory(values),
    onSuccess: async (_category, variables) => {
      await queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      setEditingCategory(null);
      setIsCreating(false);
      setFormError(null);
      setNotice({
        variant: 'default',
        title: variables.id ? 'Category updated' : 'Category created',
        message: variables.id ? 'Your category changes have been saved.' : 'The new category has been added.',
      });
    },
    onError: (error) => {
      const message = getErrorMessage(error, 'Could not save this category. Please try again.');
      setFormError(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      setDeleteTarget(null);
      setNotice({ variant: 'default', title: 'Category deleted', message: 'The category has been removed.' });
    },
    onError: (error) => {
      setNotice({
        variant: 'destructive',
        title: 'Could not delete category',
        message: getErrorMessage(error, 'Please try again.'),
      });
    },
  });

  async function handleSave(values: CategoryFormValues) {
    setFormError(null);
    await saveMutation.mutateAsync({ id: editingCategory?.id, values });
  }

  function openCreateForm() {
    setFormError(null);
    setNotice(null);
    setDeleteTarget(null);
    setIsCreating(true);
    setEditingCategory(null);
  }

  function openEditForm(category: Category) {
    setFormError(null);
    setNotice(null);
    setDeleteTarget(null);
    setIsCreating(false);
    setEditingCategory(category);
  }

  function closeForm() {
    if (saveMutation.isPending) return;
    setIsCreating(false);
    setEditingCategory(null);
    setFormError(null);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id);
  }

  const showForm = isCreating || editingCategory !== null;
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
          <Button variant="ghost" size="sm" onClick={() => openEditForm(category)} aria-label={`Edit ${category.name}`}>
            <Pencil aria-hidden="true" /> Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            disabled={deleteMutation.isPending}
            onClick={() => {
              setNotice(null);
              setDeleteTarget(category);
            }}
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
    <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-10">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Catalog</p>
          <h1 className="text-3xl font-semibold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground">Organize products into clear, easy to browse groups.</p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus aria-hidden="true" /> Add category
        </Button>
      </header>

      {notice ? (
        <Alert
          variant={notice.variant}
          role={notice.variant === 'default' ? 'status' : 'alert'}
          aria-live={notice.variant === 'default' ? 'polite' : 'assertive'}
        >
          <AlertTitle>{notice.title}</AlertTitle>
          <AlertDescription>{notice.message}</AlertDescription>
        </Alert>
      ) : null}

      <Dialog
        open={showForm}
        onOpenChange={(open) => {
          if (!open) closeForm();
        }}
        title={editingCategory ? 'Edit category' : 'New category'}
        description={editingCategory ? 'Update the category details.' : 'Add a category to organize your catalog.'}
      >
        <CategoryForm
          category={editingCategory}
          isSaving={saveMutation.isPending}
          errorMessage={formError}
          onCancel={closeForm}
          onSubmit={handleSave}
        />
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeleteTarget(null);
        }}
        title={`Delete “${deleteTarget?.name ?? 'category'}”?`}
        description="This action cannot be undone."
        className="max-w-md"
      >
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDeleteTarget(null)}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={confirmDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? 'Deleting…' : 'Delete category'}
          </Button>
        </div>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          {categoriesQuery.isPending ? (
            <p className="p-8 text-center text-sm text-muted-foreground" role="status">
              Loading categories…
            </p>
          ) : categoriesQuery.isError ? (
            <div className="space-y-3 p-8 text-center">
              <p className="text-sm text-destructive" role="alert">
                {getErrorMessage(categoriesQuery.error, 'Could not load categories.')}
              </p>
              <Button variant="outline" size="sm" onClick={() => void categoriesQuery.refetch()}>
                Try again
              </Button>
            </div>
          ) : (
            <DataTable
              data={categoriesQuery.data ?? []}
              columns={columns}
              getRowId={(category) => category.id}
              scrollRegionLabel="Categories"
              tableClassName="min-w-[600px]"
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
                  <Button variant="outline" onClick={openCreateForm}>
                    <Plus aria-hidden="true" /> Add category
                  </Button>
                </div>
              }
            />
          )}
        </CardContent>
      </Card>
    </main>
  );
}

export default CategoriesPage;
