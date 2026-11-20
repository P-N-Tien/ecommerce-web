import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { RecordEditorDialog, type EditorField } from '@/widgets/record-editor-dialog';
import type { Category } from '@/features/catalog/categories/types';
import { createProduct, deleteProduct, updateProduct } from '@/features/catalog/products/api/products-api';
import type { Product, ProductInput } from '@/features/catalog/products/types';
import { getErrorMessage } from '@/lib/api/parse-api-error';
import { toast } from 'sonner';

const PRODUCTS_KEY = ['catalog', 'products'] as const;

type ProductFormModalProps = {
  open: boolean;
  mode: 'create' | 'edit' | 'delete';
  product?: Product | null;
  categories: Category[];
  onOpenChange: (open: boolean) => void;
};

export function ProductFormModal({ open, mode, product = null, categories, onOpenChange }: ProductFormModalProps) {
  const queryClient = useQueryClient();
  const fields = useMemo<EditorField[]>(
    () => [
      { name: 'name', label: 'Name', required: true },
      { name: 'sku', label: 'SKU', required: true },
      { name: 'price', label: 'Price', type: 'number', min: 0.01, step: 0.01, required: true },
      { name: 'currency', label: 'Currency', required: true },
      {
        name: 'categoryId',
        label: 'Category',
        type: 'select',
        required: true,
        options: categories.map((category) => ({ value: String(category.id), label: category.name })),
      },
      { name: 'description', label: 'Description', type: 'textarea' },
    ],
    [categories],
  );
  const saveMutation = useMutation({
    mutationFn: (input: ProductInput) =>
      mode === 'edit' && product ? updateProduct(product.id, input) : createProduct(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      toast.success(mode === 'edit' ? 'Product updated.' : 'Product created.');
      onOpenChange(false);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: () => deleteProduct(product!.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      toast.success('Product deleted.');
      onOpenChange(false);
    },
  });
  const error = saveMutation.error ?? deleteMutation.error;
  const errorMessage = error
    ? getErrorMessage(error, mode === 'delete' ? 'Could not delete product.' : 'Could not save product.')
    : null;

  async function save(values: Record<string, string | number>) {
    const input: ProductInput = {
      name: String(values.name).trim(),
      sku: String(values.sku).trim(),
      price: Number(values.price),
      currency: String(values.currency).trim().toUpperCase(),
      categoryId: String(values.categoryId),
      description: String(values.description ?? '').trim(),
      ...(product?.slug ? { slug: product.slug } : {}),
    };
    await saveMutation.mutateAsync(input);
  }

  if (mode === 'delete') {
    return (
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        title={`Delete “${product?.name ?? 'product'}”?`}
        description="This permanently removes the product from the catalog."
      >
        <div className="space-y-4">
          {errorMessage ? (
            <Alert variant="destructive">
              <AlertTitle>Could not delete product</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleteMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending || !product}
              onClick={() => deleteMutation.mutate()}
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete product'}
            </Button>
          </div>
        </div>
      </Dialog>
    );
  }

  return (
    <RecordEditorDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'edit' ? 'Edit product' : 'Add product'}
      description="Product details are stored with the selected category."
      fields={fields}
      initialValues={
        product
          ? {
              name: product.name,
              sku: product.sku,
              price: product.price,
              currency: product.currency,
              categoryId: product.categoryId,
              description: product.description ?? '',
            }
          : { currency: 'USD' }
      }
      isSaving={saveMutation.isPending}
      errorMessage={errorMessage}
      submitLabel={mode === 'edit' ? 'Save changes' : 'Create product'}
      onSubmit={save}
    />
  );
}
