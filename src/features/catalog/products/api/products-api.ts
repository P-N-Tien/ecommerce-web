import { http } from '@/lib/api';
import { USE_MOCK_API } from '@/lib/api/runtime';
import type { Product, ProductInput } from '@/features/catalog/products/types';
import { mockCreateProduct, mockDeleteProduct, mockGetProducts, mockSetProductActive, mockUpdateProduct } from './mock-products-api';

export type ProductPage = { items: Product[]; total: number; page: number; limit: number; totalPages: number };
type PageResult<T> = T[] | { items: T[]; total?: number; page?: number; limit?: number; totalPages?: number } | { data: T[] | { items: T[]; total?: number; page?: number; limit?: number; totalPages?: number } };
function pageResult<T>(value: PageResult<T>, page: number, limit: number) {
  const outer = value && typeof value === 'object' && 'data' in value ? value.data : value;
  if (Array.isArray(outer)) return { items: outer, total: outer.length, page, limit, totalPages: Math.max(1, Math.ceil(outer.length / limit)) };
  const result = outer && typeof outer === 'object' && 'items' in outer ? outer : { items: [], total: 0 };
  const total = result.total ?? result.items.length;
  return { items: result.items, total, page: result.page ?? page, limit: result.limit ?? limit, totalPages: result.totalPages ?? Math.max(1, Math.ceil(total / limit)) };
}

export async function getProducts(page = 1, limit = 10): Promise<ProductPage> {
  if (USE_MOCK_API) return mockGetProducts(page, limit);
  const { data } = await http.get<PageResult<Product>>('/api/v1/products', { params: { page, limit } });
  return pageResult(data, page, limit);
}

export async function createProduct(input: ProductInput): Promise<Product> {
  if (USE_MOCK_API) return mockCreateProduct(input);
  const { data } = await http.post<Product>('/api/v1/products', { ...input, categoryId: Number(input.categoryId) });
  return data;
}

export async function updateProduct(id: string | number, input: Partial<ProductInput>): Promise<Product> {
  if (USE_MOCK_API) return mockUpdateProduct(id, input);
  const { data } = await http.patch<Product>(`/api/v1/products/${id}`, {
    ...input,
    ...(input.categoryId ? { categoryId: Number(input.categoryId) } : {}),
  });
  return data;
}

export async function deleteProduct(id: string | number): Promise<void> {
  if (USE_MOCK_API) return mockDeleteProduct(id);
  await http.delete(`/api/v1/products/${id}`);
}

export async function setProductActive(id: string | number, active: boolean): Promise<void> {
  if (USE_MOCK_API) return mockSetProductActive(id, active);
  await http.post(`/api/v1/products/${id}/${active ? 'activate' : 'deactivate'}`);
}
