import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '@/features/catalog/categories/api/categories-api';
import { CategoryInput } from '@/features/catalog/categories/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useCategories(page: number, pageSize: number) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['catalog', 'categories', page, pageSize],
    queryFn: () => getCategories(page, pageSize),
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, values }: { id?: string; values: CategoryInput }) =>
      id ? updateCategory(id, values) : createCategory(values),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['catalog', 'categories'] });
      toast.success(variables.id ? 'Category updated' : 'Category created');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['catalog', 'categories'] });
      toast.success('Category deleted');
    },
  });

  return { query, saveMutation, deleteMutation };
}
