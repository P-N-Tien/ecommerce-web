import type { Product, ProductFilters, ProductInput } from '@/features/catalog/products/types';
import { makeMockId, mockDelay, mockNotFound, readMockList, writeMockList } from '@/services/mock/storage';

const KEY = 'ecommerce-admin.demo-products';
const seed: Product[] = [
  {
    id: 'product-101',
    name: 'Wireless Headphones',
    slug: 'wireless-headphones',
    sku: 'ELEC-ANC-001',
    price: 129.99,
    currency: 'USD',
    createdAt: '2025-01-15T08:00:00.000Z',
    updatedAt: '2025-01-15T08:00:00.000Z',
    categoryId: 'cat-electronics',
    categoryName: 'Electronics',
    imageUrl: null,
    isActive: true,
  },
  {
    id: 'product-102',
    name: 'Everyday Backpack',
    slug: 'everyday-backpack',
    sku: 'ACC-BAG-014',
    price: 68,
    currency: 'USD',
    createdAt: '2025-02-20T08:00:00.000Z',
    updatedAt: '2025-02-20T08:00:00.000Z',
    categoryId: 'cat-accessories',
    categoryName: 'Accessories',
    imageUrl: null,
    isActive: true,
  },
  {
    id: 'product-103',
    name: 'Desk Lamp',
    slug: 'desk-lamp',
    sku: 'HOME-LIGHT-009',
    price: 42.5,
    currency: 'USD',
    createdAt: '2025-03-10T08:00:00.000Z',
    updatedAt: '2025-03-10T08:00:00.000Z',
    categoryId: 'cat-home',
    categoryName: 'Home & Living',
    imageUrl: null,
    isActive: false,
  },
];

const read = () => readMockList(KEY, seed);
export async function mockGetProduct(id: string | number): Promise<Product> {
  await mockDelay();
  const product = read().find((item) => String(item.id) === String(id));
  if (!product) throw mockNotFound('Product');
  return product;
}

export async function mockGetProducts(page = 1, limit = 10, filters: ProductFilters = {}) {
  await mockDelay();
  const search = filters.search?.trim().toLowerCase();
  const products = read().filter((product) => {
    const matchesSearch =
      !search || [product.name, product.slug, product.sku].some((value) => value.toLowerCase().includes(search));
    const matchesCategory = !filters.categoryId || product.categoryId === filters.categoryId;
    const matchesStatus = filters.isActive === undefined || product.isActive === filters.isActive;
    const matchesMinPrice = filters.minPrice === undefined || product.price >= filters.minPrice;
    const matchesMaxPrice = filters.maxPrice === undefined || product.price <= filters.maxPrice;
    return matchesSearch && matchesCategory && matchesStatus && matchesMinPrice && matchesMaxPrice;
  });
  const direction = filters.sortOrder === 'asc' ? 1 : -1;
  products.sort((left, right) => {
    if (filters.sortBy === 'price') return (left.price - right.price) * direction;
    if (filters.sortBy === 'name') return left.name.localeCompare(right.name) * direction;
    if (filters.sortBy === 'id') return String(left.id).localeCompare(String(right.id)) * direction;

    const difference = Date.parse(left.createdAt ?? '') - Date.parse(right.createdAt ?? '');
    return (Number.isNaN(difference) ? 0 : difference) * direction;
  });
  return {
    items: products.slice((page - 1) * limit, page * limit),
    total: products.length,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(products.length / limit)),
  };
}
export async function mockCreateProduct(input: ProductInput) {
  await mockDelay();
  const now = new Date().toISOString();
  const product: Product = {
    ...input,
    id: makeMockId('product'),
    categoryName: null,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
  writeMockList(KEY, [product, ...read()]);
  return product;
}
export async function mockUpdateProduct(id: string | number, input: Partial<ProductInput>) {
  await mockDelay();
  const products = read();
  const current = products.find((product) => String(product.id) === String(id));
  if (!current) throw mockNotFound('Product');
  const updated = {
    ...current,
    ...input,
    updatedAt: new Date().toISOString(),
    ...(input.categoryId !== undefined ? { category: null, categoryName: null } : {}),
  };
  writeMockList(
    KEY,
    products.map((product) => (String(product.id) === String(id) ? updated : product)),
  );
  return updated;
}
export async function mockDeleteProduct(id: string | number) {
  await mockDelay();
  const products = read();
  if (!products.some((product) => String(product.id) === String(id))) throw mockNotFound('Product');
  writeMockList(
    KEY,
    products.filter((product) => String(product.id) !== String(id)),
  );
}
export async function mockSetProductActive(id: string | number, isActive: boolean) {
  await mockDelay();
  const products = read();
  if (!products.some((product) => String(product.id) === String(id))) throw mockNotFound('Product');
  writeMockList(
    KEY,
    products.map((product) => (String(product.id) === String(id) ? { ...product, isActive } : product)),
  );
}
