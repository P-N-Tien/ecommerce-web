import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCategories } from '@/features/catalog/categories/hooks/use-categories';
import { useProductMutations, useProducts } from '@/features/catalog/products/hooks/use-product-mutations';
import { ProductDeleteDialog } from '@/features/catalog/products/components/product-delete-dialog';
import { ProductTable } from '@/features/catalog/products/components/product-table';
import { ProductFilter } from '@/features/catalog/products/components/product-filter';
import type { Product } from '@/features/catalog/products/types';
import { PageContainer, PageHeader } from '@/widgets/page-layout/page-container';
import { useAuth } from '@/app/providers/auth-context';
import {
  productListFiltersFromSearchParams,
  productListFiltersToSearchParams,
} from '@/features/catalog/products/lib/product-list-filters';

export function ProductsView() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { activeMutation } = useProductMutations();
  const canManage = hasPermission('manage_products');
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => productListFiltersFromSearchParams(searchParams), [searchParams]);
  const productsQuery = useProducts(filters.page, filters.limit, filters);
  const { query: categoriesQuery } = useCategories(1, 100);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const categories = categoriesQuery.data?.items ?? [];

  return (
    <PageContainer>
      <PageHeader
        section="Catalog"
        title="Products"
        description="Browse the catalog and manage product details."
        action={
          canManage && (
            <Button
              size="sm"
              onClick={() => {
                navigate('/products/new');
              }}
            >
              <Plus aria-hidden="true" /> New Product
            </Button>
          )
        }
      />

      {deleteProduct && (
        <ProductDeleteDialog
          product={deleteProduct}
          onOpenChange={(open) => {
            if (!open) setDeleteProduct(null);
          }}
        />
      )}

      <ProductFilter
        key={searchParams.toString()}
        categories={categories}
        filters={filters}
        onApply={(nextFilters) => {
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
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            onSortChange={(sortBy) => {
              const sortOrder =
                filters.sortBy === sortBy
                  ? filters.sortOrder === 'asc'
                    ? 'desc'
                    : 'asc'
                  : sortBy === 'createdAt'
                  ? 'desc'
                  : 'asc';
              setSearchParams(productListFiltersToSearchParams({ ...filters, page: 1, sortBy, sortOrder }));
            }}
            categories={categories}
            canManage={canManage}
            onEdit={(product) => navigate(`/products/${encodeURIComponent(String(product.id))}/edit`)}
            onDelete={setDeleteProduct}
            onToggleActive={(product) => activeMutation.mutate({ id: product.id, active: !product.isActive })}
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
