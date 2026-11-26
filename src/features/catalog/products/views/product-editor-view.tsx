import { useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useCategories } from '@/features/catalog/categories/hooks/use-categories';
import { ProductForm } from '@/features/catalog/products/components/product-form';
import { useProduct, useProductMutations } from '@/features/catalog/products/hooks/use-product-mutations';
import { getInventory } from '@/features/inventory/api/inventory-api';
import type { ProductInput } from '@/features/catalog/products/types';
import { getErrorMessage } from '@/lib/api/parse-api-error';
import { Breadcrumbs } from '@/widgets/page-layout/breadcrumbs';
import { PageContainer, PageHeader } from '@/widgets/page-layout/page-container';

export function ProductEditorView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const mode = id ? 'edit' : 'create';
  const { query: categoriesQuery } = useCategories(1, 100);
  const productQuery = useProduct(id);
  const inventoryQuery = useQuery({
    queryKey: ['inventory', 'items'],
    queryFn: getInventory,
    enabled: Boolean(id),
  });
  const { saveMutation } = useProductMutations();
  const product = productQuery.data;
  const categories = categoriesQuery.data?.items ?? [];
  const inventory = inventoryQuery.data?.find((item) => String(item.productId) === id);
  const breadcrumbs = [
    { label: 'Products', to: '/products' },
    ...(id ? [{ label: product?.name ?? 'Product' }, { label: 'Edit' }] : [{ label: 'New product' }]),
  ];
  const backButton = (
    <Button type="button" variant="outline" onClick={() => navigate('/products')}>
      Back to products
    </Button>
  );

  async function save(values: ProductInput) {
    try {
      await saveMutation.mutateAsync({ id: product?.id, values });
      navigate('/products');
    } catch {
      // The mutation error is rendered in ProductForm.
    }
  }

  if ((id && productQuery.isPending) || categoriesQuery.isPending) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <Breadcrumbs items={breadcrumbs} />
          <PageHeader section="Catalog" title={mode === 'edit' ? 'Edit product' : 'New product'} action={backButton} />
        </div>
        <p className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">Loading product form…</p>
      </PageContainer>
    );
  }

  if (categoriesQuery.isError || (id && (productQuery.isError || !product))) {
    const error = categoriesQuery.error ?? productQuery.error;
    return (
      <PageContainer>
        <div className="space-y-4">
          <Breadcrumbs items={breadcrumbs} />
          <PageHeader section="Catalog" title={mode === 'edit' ? 'Edit product' : 'New product'} action={backButton} />
        </div>
        <Alert variant="destructive">
          <AlertTitle>Could not load product form</AlertTitle>
          <AlertDescription>
            {error ? getErrorMessage(error, 'Could not load product details.') : 'Product not found.'}
          </AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbs} />
        <PageHeader
          title={mode === 'edit' ? 'Edit product' : 'New product'}
          description={mode === 'edit' ? 'Update the product details.' : 'Add a product to your catalog.'}
          action={
            <>
              <Button type="submit" form="product-editor-form" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Create product'}
              </Button>
            </>
          }
        />
      </div>
      <ProductForm
        key={product?.id ?? 'new-product'}
        product={product}
        categories={categories}
        inventory={inventory}
        isSaving={saveMutation.isPending}
        errorMessage={saveMutation.error ? getErrorMessage(saveMutation.error, 'Could not save product.') : null}
        onManageStock={() => navigate('/inventory')}
        onSubmit={save}
      />
    </PageContainer>
  );
}
