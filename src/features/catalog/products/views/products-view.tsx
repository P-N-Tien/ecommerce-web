import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getCategories } from '@/features/catalog/categories/api/categories-api';
import type { Category } from '@/features/catalog/categories/types';
import { getProducts, setProductActive } from '@/features/catalog/products/api/products-api';
import { ProductFormModal } from '@/features/catalog/products/components/product-form-modal';
import { ProductTable } from '@/features/catalog/products/components/product-table';
import type { Product } from '@/features/catalog/products/types';
import { getErrorMessage } from '@/lib/api/parse-api-error';
import { PageContainer, PageHeader } from '@/widgets/page-layout/page-container';
import { toast } from 'sonner';
import { useAuth } from '@/app/providers/auth-context';

const PRODUCTS_KEY = ['catalog', 'products'] as const;
const CATEGORIES_KEY = ['catalog', 'categories'] as const;
const DEFAULT_PAGE_SIZE = 10;
const NO_CATEGORIES: Category[] = [];
type ProductModalState = { mode: 'create' | 'edit' | 'delete'; product: Product | null };

export function ProductsView() {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const canManage = hasPermission('manage_products');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const productsQuery = useQuery({
    queryKey: [...PRODUCTS_KEY, page, pageSize],
    queryFn: () => getProducts(page, pageSize),
  });
  const categoriesQuery = useQuery({ queryKey: CATEGORIES_KEY, queryFn: () => getCategories(1, 100) });
  const [modal, setModal] = useState<ProductModalState | null>(null);

  const activeMutation = useMutation({
    mutationFn: ({ id, active }: { id: Product['id']; active: boolean }) => setProductActive(id, active),
    onSuccess: async (_result, variables) => {
      await queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      toast.success(variables.active ? 'Product activated.' : 'Product deactivated.');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not change product status.')),
  });

  const categories = categoriesQuery.data?.items ?? NO_CATEGORIES;

  return (
    <PageContainer>
      <PageHeader
        section="Catalog"
        title="Products"
        description="Manage the products available in your store."
        action={
          canManage ? (
            <Button
              onClick={() => {
                setModal({ mode: 'create', product: null });
              }}
            >
              <Plus aria-hidden="true" /> Add
            </Button>
          ) : undefined
        }
      />

      {modal ? (
        <ProductFormModal
          key={`${modal.mode}-${modal.product?.id ?? 'new'}`}
          open
          mode={modal.mode}
          product={modal.product}
          categories={categories}
          onOpenChange={(open) => {
            if (!open) setModal(null);
          }}
        />
      ) : null}

      <Card>
        <CardContent className="p-0">
          {productsQuery.isPending ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Loading products…</p>
          ) : productsQuery.isError ? (
            <div className="p-6">
              <Alert variant="destructive">
                <AlertTitle>Could not load products</AlertTitle>
                <AlertDescription>
                  <Button variant="outline" size="sm" onClick={() => void productsQuery.refetch()}>
                    Try again
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <ProductTable
              products={productsQuery.data.items}
              page={page}
              pageSize={pageSize}
              total={productsQuery.data.total}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              categories={categories}
              canManage={canManage}
              onEdit={(product) => setModal({ mode: 'edit', product })}
              onDelete={(product) => setModal({ mode: 'delete', product })}
              onToggleActive={(product) => activeMutation.mutate({ id: product.id, active: !product.isActive })}
            />
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
