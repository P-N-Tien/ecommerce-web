import type { Category, CategoryInput } from '@/features/catalog/categories/types';

const STORAGE_KEY = 'ecommerce-admin.demo-categories';

const initialCategories: Category[] = [
  { id: 'cat-electronics', name: 'Electronics', slug: 'electronics', description: 'Phones, computers, and everyday technology.' },
  { id: 'cat-home', name: 'Home & Living', slug: 'home-living', description: 'Furniture, decor, and essentials for the home.' },
  { id: 'cat-accessories', name: 'Accessories', slug: 'accessories', description: 'Bags, watches, and personal accessories.' },
  { id: 'cat-sports', name: 'Sports & Outdoors', slug: 'sports-outdoors', description: 'Equipment and apparel for active lifestyles.' },
];

function wait(): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, 220));
}

function readCategories(): Category[] {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return initialCategories;
  try {
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as Category[]) : initialCategories;
  } catch {
    return initialCategories;
  }
}

function writeCategories(categories: Category[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
}

function slugify(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function mockGetCategories(): Promise<Category[]> {
  await wait();
  if (!window.localStorage.getItem(STORAGE_KEY)) writeCategories(initialCategories);
  return readCategories();
}

export async function mockCreateCategory(input: CategoryInput): Promise<Category> {
  await wait();
  const categories = readCategories();
  const category: Category = { id: `cat-${crypto.randomUUID()}`, ...input, slug: slugify(input.name) };
  writeCategories([category, ...categories]);
  return category;
}

export async function mockUpdateCategory(id: string, input: CategoryInput): Promise<Category> {
  await wait();
  const categories = readCategories();
  const current = categories.find((category) => category.id === id);
  if (!current) throw Object.assign(new Error('Category was not found.'), { statusCode: 404 });
  const updated = { ...current, ...input, slug: slugify(input.name) };
  writeCategories(categories.map((category) => category.id === id ? updated : category));
  return updated;
}

export async function mockDeleteCategory(id: string): Promise<void> {
  await wait();
  const categories = readCategories();
  if (!categories.some((category) => category.id === id)) {
    throw Object.assign(new Error('Category was not found.'), { statusCode: 404 });
  }
  writeCategories(categories.filter((category) => category.id !== id));
}
