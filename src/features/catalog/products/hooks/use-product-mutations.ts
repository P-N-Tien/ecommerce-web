import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createProduct,
  deleteProduct,
  getProducts,
  setProductActive,
  updateProduct,
} from '@/features/catalog/products/api/products-api';
import type { ProductFilters, ProductInput } from '@/features/catalog/products/types';
import { getErrorMessage } from '@/lib/api/parse-api-error';
import { toast } from 'sonner';

const PRODUCTS_KEY = ['catalog', 'products'] as const;

export function useProductMutations() {
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: ({ id, values }: { id?: string | number; values: ProductInput }) =>
      id === undefined ? createProduct(values) : updateProduct(id, values),
    onSuccess: async (_product, variables) => {
      await queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      toast.success(variables.id === undefined ? 'Product created.' : 'Product updated.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => deleteProduct(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      toast.success('Product deleted.');
    },
  });

  const activeMutation = useMutation({
    mutationFn: ({ id, active }: { id: string | number; active: boolean }) => setProductActive(id, active),
    onSuccess: async (_result, variables) => {
      await queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      toast.success(variables.active ? 'Product activated.' : 'Product deactivated.');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not change product status.')),
  });

  return { saveMutation, deleteMutation, activeMutation };
}

export function useProducts(page: number, pageSize: number, filters: ProductFilters = {}) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, page, pageSize, filters],
    queryFn: () => getProducts(page, pageSize, filters),
  });
}
