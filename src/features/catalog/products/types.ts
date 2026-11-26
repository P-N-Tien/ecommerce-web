export type Product = {
  id: string | number;
  name: string;
  description?: string | null;
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

export type ProductInput = Pick<Product, 'name' | 'slug' | 'sku' | 'price' | 'currency' | 'imageUrl' | 'categoryId'> & {
  description?: string | null;
};

export type ProductFilters = {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'createdAt' | 'price' | 'name' | 'id';
  sortOrder?: 'asc' | 'desc';
};

export type ListProductsQuery = {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'createdAt' | 'price' | 'name' | 'id';
  sortOrder?: 'asc' | 'desc';
};

export type ProductListFilters = {
  page: number;
  limit: number;
  sortBy: NonNullable<ListProductsQuery['sortBy']>;
  sortOrder: NonNullable<ListProductsQuery['sortOrder']>;
  search?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: string;
};
