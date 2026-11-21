import { http } from '@/lib/api';
import type { Category, CategoryInput } from '@/features/catalog/categories/types';
import { USE_MOCK_API } from '@/lib/api/runtime';
import { mockCreateCategory, mockDeleteCategory, mockGetCategories, mockUpdateCategory } from './mock-categories-api';
import type { ApiResponse, PaginatedData } from '@/lib/api/api-types';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export async function getCategories(page = 1, limit = 10): Promise<PaginatedData<Category>> {
  if (USE_MOCK_API) return mockGetCategories(page, limit);
  const res = await http.get<ApiResponse<PaginatedData<Category>>>(API_ENDPOINTS.CATEGORIES.BASE, {
    params: { page, limit },
  });
  return res.data;
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  if (USE_MOCK_API) return mockCreateCategory(input);
  const res = await http.post<ApiResponse<Category>>(API_ENDPOINTS.CATEGORIES.BASE, input);
  return res.data;
}

export async function updateCategory(id: string, input: CategoryInput): Promise<Category> {
  if (USE_MOCK_API) return mockUpdateCategory(id, input);
  const res = await http.patch<ApiResponse<Category>>(API_ENDPOINTS.CATEGORIES.DETAIL(id), input);
  return res.data;
}

export async function deleteCategory(id: string): Promise<void> {
  if (USE_MOCK_API) {
    return mockDeleteCategory(id);
  }
  await http.delete(API_ENDPOINTS.CATEGORIES.DETAIL(id));
}
