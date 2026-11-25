import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCategories } from '@/features/catalog/categories/hooks/use-categories';
import { useProductMutations, useProducts } from '@/features/catalog/products/hooks/use-product-mutations';
import { ProductFormModal } from '@/features/catalog/products/components/product-form-modal';
import { ProductTable } from '@/features/catalog/products/components/product-table';
import { ProductFilter } from '@/features/catalog/products/components/product-filter';
import type { Product } from '@/features/catalog/products/types';
import { PageContainer, PageHeader } from '@/widgets/page-layout/page-container';
import { useAuth } from '@/app/providers/auth-context';
import {
  productListFiltersFromSearchParams,
  productListFiltersToSearchParams,
} from '@/features/catalog/products/lib/product-list-filters';

type ProductModalState = { mode: 'create' | 'edit' | 'delete'; product: Product | null };

export function ProductsView() {
  const { hasPermission } = useAuth();
  const { activeMutation } = useProductMutations();
  const canManage = hasPermission('manage_products');
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => productListFiltersFromSearchParams(searchParams), [searchParams]);
  const productsQuery = useProducts(filters.page, filters.limit, filters);
  const { query: categoriesQuery } = useCategories(1, 100);
  const [modal, setModal] = useState<ProductModalState | null>(null);

  const categories = categoriesQuery.data?.items ?? [];

  return (
    <PageContainer>
      <PageHeader
        section="Catalog"
        title="Products"
        description="Browse the catalog and manage product details."
        action={
          canManage ? (
            <Button
              onClick={() => {
                setModal({ mode: 'create', product: null });
              }}
            >
              <Plus aria-hidden="true" /> New Product
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
      <ProductFilter
        key={searchParams.toString()}
        categories={categories}
        filters={filters}
        onApply={(nextFilters) => {
          console.log('nextFilters', nextFilters);
          setSearchParams(productListFiltersToSearchParams({ ...filters, ...nextFilters, page: 1 }));
        }}
        onClear={() =>
          setSearchParams(
            productListFiltersToSearchParams({
              page: 1,
              limit: filters.limit,
              sortBy: filters.sortBy,
              sortOrder: filters.sortOrder,
            }),
          )
        }
      />
      <Card>
        <CardContent className="p-0">
          <ProductTable
            products={productsQuery?.data?.items ?? []}
            page={filters.page}
            pageSize={filters.limit}
            total={productsQuery?.data?.total || 0}
            onPageChange={(nextPage) =>
              setSearchParams(productListFiltersToSearchParams({ ...filters, page: nextPage }))
            }
            onPageSizeChange={(limit) =>
              setSearchParams(productListFiltersToSearchParams({ ...filters, limit, page: 1 }))
            }
            categories={categories}
            canManage={canManage}
            onEdit={(product) => setModal({ mode: 'edit', product })}
            onDelete={(product) => setModal({ mode: 'delete', product })}
            onToggleActive={(product) => activeMutation.mutate({ id: product.id, active: !product.isActive })}
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
