import { http } from '@/lib/api';
import { USE_MOCK_API } from '@/lib/api/runtime';
import type { Product, ProductFilters, ProductInput } from '@/features/catalog/products/types';
import {
  mockCreateProduct,
  mockDeleteProduct,
  mockGetProducts,
  mockSetProductActive,
  mockUpdateProduct,
} from './mock-products-api';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { ApiResponse, PaginatedData } from '@/lib/api/api-types';

export async function getProducts(page = 1, limit = 10, filters: ProductFilters = {}): Promise<PaginatedData<Product>> {
  if (USE_MOCK_API) return mockGetProducts(page, limit, filters);
  const res = await http.get<ApiResponse<PaginatedData<Product>>>(API_ENDPOINTS.PRODUCTS.BASE, {
    params: { page, limit, ...filters },
  });
  return res.data;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  if (USE_MOCK_API) return mockCreateProduct(input);
  const res = await http.post<Product>(API_ENDPOINTS.PRODUCTS.BASE, {
    ...input,
  });
  return res;
}

export async function updateProduct(id: string | number, input: Partial<ProductInput>): Promise<Product> {
  if (USE_MOCK_API) return mockUpdateProduct(id, input);
  const res = await http.patch<Product>(API_ENDPOINTS.PRODUCTS.DETAIL(id), {
    ...input,
  });
  return res;
}

export async function deleteProduct(id: string | number): Promise<void> {
  if (USE_MOCK_API) return mockDeleteProduct(id);
  await http.delete(API_ENDPOINTS.PRODUCTS.DETAIL(id));
}

export async function setProductActive(id: string | number, active: boolean): Promise<void> {
  if (USE_MOCK_API) return mockSetProductActive(id, active);
  await http.post(active ? API_ENDPOINTS.PRODUCTS.ACTIVATE(id) : API_ENDPOINTS.PRODUCTS.DEACTIVATE(id));
}
