import { http } from '@/services/http';
import type { Category, CategoryInput } from '@/features/catalog/categories/types';
import { USE_MOCK_API } from '@/services/http/runtime';
import { mockCreateCategory, mockDeleteCategory, mockGetCategories, mockUpdateCategory } from './mock-categories-api';

type ApiResult<T> = T | { data: T };

function unwrap<T>(value: ApiResult<T>): T {
  return value && typeof value === 'object' && 'data' in value ? value.data : (value as T);
}

export async function getCategories(): Promise<Category[]> {
  if (USE_MOCK_API) return mockGetCategories();
  const { data } = await http.get<ApiResult<Category[]>>('/api/v1/categories');
  return unwrap(data);
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  if (USE_MOCK_API) return mockCreateCategory(input);
  const { data } = await http.post<ApiResult<Category>>('/api/v1/categories', input);
  return unwrap(data);
}

export async function updateCategory(id: string, input: CategoryInput): Promise<Category> {
  if (USE_MOCK_API) return mockUpdateCategory(id, input);
  const { data } = await http.patch<ApiResult<Category>>(`/api/v1/categories/${encodeURIComponent(id)}`, input);
  return unwrap(data);
}

export async function deleteCategory(id: string): Promise<void> {
  if (USE_MOCK_API) return mockDeleteCategory(id);
  await http.delete(`/api/v1/categories/${encodeURIComponent(id)}`);
}
