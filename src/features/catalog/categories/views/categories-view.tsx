import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { CategoryFormModal } from '@/features/catalog/categories/components/category-form';
import CategoriesTable from '@/features/catalog/categories/components/category-table';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '@/features/catalog/categories/api/categories-api';
import type { Category, CategoryInput } from '@/features/catalog/categories/types';
import type { CategoryFormValues } from '@/features/catalog/categories/schemas/category-schema';
import { getErrorMessage } from '@/lib/api/parse-api-error';
import { PageContainer, PageHeader } from '@/widgets/page-layout/page-container';

const CATEGORIES_QUERY_KEY = ['catalog', 'categories'] as const;

type Notice = {
  variant: 'default' | 'destructive';
  title: string;
  message: string;
};

export function CategoriesView() {
  const queryClient = useQueryClient();
  const categoriesQuery = useQuery({ queryKey: CATEGORIES_QUERY_KEY, queryFn: getCategories });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const saveMutation = useMutation({
    mutationFn: ({ id, values }: { id?: string; values: CategoryInput }) =>
      id ? updateCategory(id, values) : createCategory(values),
    onSuccess: async (_category, variables) => {
      await queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      setIsFormOpen(false);
      setEditingCategory(null);
      setFormError(null);
      setNotice({
        variant: 'default',
        title: variables.id ? 'Category updated' : 'Category created',
        message: variables.id ? 'Your category changes have been saved.' : 'The new category has been added.',
      });
    },
    onError: (error) => setFormError(getErrorMessage(error, 'Could not save this category. Please try again.')),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      setDeleteTarget(null);
      setDeleteError(null);
      setNotice({ variant: 'default', title: 'Category deleted', message: 'The category has been removed.' });
    },
    onError: (error) => setDeleteError(getErrorMessage(error, 'Could not delete this category. Please try again.')),
  });

  function openCreateForm() {
    setEditingCategory(null);
    setFormError(null);
    setNotice(null);
    setIsFormOpen(true);
  }

  function openEditForm(category: Category) {
    setEditingCategory(category);
    setFormError(null);
    setNotice(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    if (saveMutation.isPending) return;
    setIsFormOpen(false);
    setEditingCategory(null);
    setFormError(null);
  }

  async function handleSave(values: CategoryFormValues) {
    setFormError(null);
    await saveMutation.mutateAsync({ id: editingCategory?.id, values });
  }

  function openDeleteDialog(category: Category) {
    setNotice(null);
    setDeleteError(null);
    setDeleteTarget(category);
  }

  function closeDeleteDialog() {
    if (deleteMutation.isPending) return;
    setDeleteTarget(null);
    setDeleteError(null);
  }

  function confirmDelete() {
    if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
  }

  return (
    <PageContainer>
      <PageHeader
        section="Catalog"
        title="Categories"
        description="Manage catalog categories used to classify products. Deleting a category unassigns its products."
        action={
          <Button onClick={openCreateForm}>
            <Plus aria-hidden="true" /> Add category
          </Button>
        }
      />

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

      <CategoryFormModal
        open={isFormOpen}
        category={editingCategory}
        isSaving={saveMutation.isPending}
        errorMessage={formError}
        onOpenChange={(open) => {
          if (open) setIsFormOpen(true);
          else closeForm();
        }}
        onSubmit={handleSave}
      />

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (open) return;
          closeDeleteDialog();
        }}
        title={`Delete “${deleteTarget?.name ?? 'category'}”?`}
        description="This action cannot be undone. Its products will no longer have this category assigned."
        className="max-w-md"
      >
        <div className="space-y-4">
          {deleteError ? (
            <Alert variant="destructive" aria-live="assertive">
              <AlertTitle>Could not delete category</AlertTitle>
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeDeleteDialog} disabled={deleteMutation.isPending}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Deleting…' : 'Delete category'}
            </Button>
          </div>
        </div>
      </Dialog>

      <CategoriesTable
        categories={categoriesQuery.data ?? []}
        isLoading={categoriesQuery.isPending}
        isError={categoriesQuery.isError}
        error={categoriesQuery.error}
        onRetry={() => void categoriesQuery.refetch()}
        onCreate={openCreateForm}
        onEdit={openEditForm}
        onDelete={openDeleteDialog}
      />
    </PageContainer>
  );
}
