import type { Product, ProductInput } from '@/features/catalog/products/types';
import { makeMockId, mockDelay, mockNotFound, readMockList, writeMockList } from '@/services/mock/storage';

const KEY = 'ecommerce-admin.demo-products';
const seed: Product[] = [
  { id: 'product-101', name: 'Wireless Headphones', slug: 'wireless-headphones', sku: 'ELEC-ANC-001', price: 129.99, currency: 'USD', categoryId: 'cat-electronics', categoryName: 'Electronics', description: 'Over-ear noise cancelling headphones.', imageUrl: '', isActive: true },
  { id: 'product-102', name: 'Everyday Backpack', slug: 'everyday-backpack', sku: 'ACC-BAG-014', price: 68, currency: 'USD', categoryId: 'cat-accessories', categoryName: 'Accessories', description: 'Weather-resistant commuter backpack.', imageUrl: '', isActive: true },
  { id: 'product-103', name: 'Desk Lamp', slug: 'desk-lamp', sku: 'HOME-LIGHT-009', price: 42.5, currency: 'USD', categoryId: 'cat-home', categoryName: 'Home & Living', description: 'Adjustable LED desk lamp.', imageUrl: '', isActive: false },
];

const read = () => readMockList(KEY, seed);
const slug = (name: string) => name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export async function mockGetProducts(page = 1, limit = 10) {
  await mockDelay();
  const products = read();
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
  const product: Product = { ...input, id: makeMockId('product'), slug: input.slug || slug(input.name), categoryName: null, isActive: true };
  writeMockList(KEY, [product, ...read()]);
  return product;
}
export async function mockUpdateProduct(id: string | number, input: Partial<ProductInput>) {
  await mockDelay();
  const products = read();
  const current = products.find((product) => String(product.id) === String(id));
  if (!current) throw mockNotFound('Product');
  const updated = { ...current, ...input, ...(input.name ? { slug: input.slug || slug(input.name) } : {}) };
  writeMockList(KEY, products.map((product) => String(product.id) === String(id) ? updated : product));
  return updated;
}
export async function mockDeleteProduct(id: string | number) {
  await mockDelay();
  const products = read();
  if (!products.some((product) => String(product.id) === String(id))) throw mockNotFound('Product');
  writeMockList(KEY, products.filter((product) => String(product.id) !== String(id)));
}
export async function mockSetProductActive(id: string | number, isActive: boolean) {
  await mockDelay();
  const products = read();
  if (!products.some((product) => String(product.id) === String(id))) throw mockNotFound('Product');
  writeMockList(KEY, products.map((product) => String(product.id) === String(id) ? { ...product, isActive } : product));
}
