export type Product = {
  id: string | number;
  name: string;
  slug: string;
  description?: string | null;
  sku: string;
  price: number;
  currency: string;
  imageUrl?: string | null;
  categoryId: string | number | null;
  categoryName?: string | null;
  isActive: boolean;
};

export type ProductInput = Omit<Product, 'id' | 'isActive' | 'categoryName' | 'slug'> & {
  categoryId: string | number;
  slug?: string;
};
