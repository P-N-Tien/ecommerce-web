import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { useProductMutations } from '@/features/catalog/products/hooks/use-product-mutations';
import type { Product } from '@/features/catalog/products/types';
import { getErrorMessage } from '@/lib/api/parse-api-error';

type ProductDeleteDialogProps = {
  product: Product;
  onOpenChange: (open: boolean) => void;
};

export function ProductDeleteDialog({ product, onOpenChange }: ProductDeleteDialogProps) {
  const { deleteMutation } = useProductMutations();
  const errorMessage = deleteMutation.error ? getErrorMessage(deleteMutation.error, 'Could not delete product.') : null;

  return (
    <Dialog
      open
      onOpenChange={onOpenChange}
      title={`Delete “${product.name}”?`}
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
            disabled={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate(product.id, { onSuccess: () => onOpenChange(false) })}
          >
            {deleteMutation.isPending ? 'Deleting…' : 'Delete product'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
