import { useState } from 'react';
import CategoriesTable from '@/features/catalog/categories/components/categories-table';
import type { CategoryFormValues } from '@/features/catalog/categories/schemas/category-schema';
import type { ApiErrorDetail, ApiErrorResponse } from '@/lib/api/api-types';
import { toast } from 'sonner';
import type { Category } from '@/features/catalog/categories/types';
import { useCategories } from '@/features/catalog/categories/hooks/use-categories';
import { PageContainer, PageHeader } from '@/widgets/page-layout/page-container';
import { Button } from '@/components/ui/button';
import { CategoryFormModal } from '@/features/catalog/categories/components/category-form-modal';
import { Dialog } from '@/components/ui/dialog';
import { ActionErrorAlert } from '@/components/feedback/action-error-alert';
import { Plus } from 'lucide-react';

type FormState = { status: 'closed' } | { status: 'create' } | { status: 'edit'; category: Category };

export function CategoriesView() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formState, setFormState] = useState<FormState>({ status: 'closed' });
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [errorFields, setErrorFields] = useState<ApiErrorDetail[] | null>(null);

  const { query, saveMutation, deleteMutation } = useCategories(page, pageSize);

  async function handleSave(values: CategoryFormValues) {
    setErrorFields(null);
    const id = formState.status === 'edit' ? formState.category.id : undefined;

    try {
      await saveMutation.mutateAsync({ id, values });
      if (!id) setPage(1);
      setFormState({ status: 'closed' });
    } catch (err) {
      const error = err as ApiErrorResponse;
      if (error.errors?.length) setErrorFields(error.errors);
      else toast.error(error.message || 'Cannot save the category');
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      if ((query.data?.items.length ?? 0) === 1 && page > 1) {
        setPage(page - 1);
      }
      setDeleteTarget(null);
    } catch {
      // The mutation error remains in React Query and is displayed in the confirmation dialog.
    }
  }

  return (
    <PageContainer>
      <PageHeader
        section="Catalog"
        title="Categories"
        description="Manage catalog categories used to classify products. Deleting a category unassigns its products."
        action={
          <Button
            size="sm"
            onClick={() => {
              setErrorFields(null);
              setFormState({ status: 'create' });
            }}
          >
            <Plus aria-hidden="true" /> New Category
          </Button>
        }
      />

      <CategoryFormModal
        open={formState.status !== 'closed'}
        category={formState.status === 'edit' ? formState.category : null}
        isSaving={saveMutation.isPending}
        errorFields={errorFields}
        onOpenChange={(open) => {
          if (!open && !saveMutation.isPending) setFormState({ status: 'closed' });
        }}
        onSubmit={handleSave}
      />

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeleteTarget(null);
        }}
        title={`Delete “${deleteTarget?.name ?? 'category'}”?`}
        description="This action cannot be undone. Its products will no longer have this category assigned."
        className="max-w-md"
      >
        <div className="space-y-4">
          {deleteMutation.isError && <ActionErrorAlert message="Could not delete this category" />}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete category'}
            </Button>
          </div>
        </div>
      </Dialog>

      <CategoriesTable
        categories={query.data?.items ?? []}
        page={page}
        pageSize={pageSize}
        total={query.data?.total ?? 0}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        isLoading={query.isPending}
        isError={query.isError}
        error={query.error}
        onRetry={() => void query.refetch()}
        onEdit={(category) => {
          setErrorFields(null);
          setFormState({ status: 'edit', category });
        }}
        onDelete={(category) => {
          deleteMutation.reset();
          setDeleteTarget(category);
        }}
      />
    </PageContainer>
  );
}
