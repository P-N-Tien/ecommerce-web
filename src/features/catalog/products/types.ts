export type Product = {
  id: string | number;
  name: string;
  slug: string;
  sku: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  categoryId: string | null;
  category?: { id: string; name: string } | null;
  categoryName?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductInput = Pick<Product, 'name' | 'slug' | 'sku' | 'price' | 'currency' | 'imageUrl' | 'categoryId'>;

export type ProductFilters = {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
};
