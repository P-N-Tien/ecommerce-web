import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { ArrowUpRight, ImagePlus, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Category } from '@/features/catalog/categories/types';
import type { Product, ProductInput } from '@/features/catalog/products/types';
import type { InventoryItem } from '@/features/inventory/types';

type ProductFormProps = {
  product?: Product;
  categories: Category[];
  inventory?: InventoryItem;
  isSaving: boolean;
  errorMessage?: string | null;
  onManageStock: () => void;
  onSubmit: (values: ProductInput) => Promise<void>;
};

type ProductFormValues = {
  name: string;
  description: string;
  slug: string;
  sku: string;
  price: string;
  currency: string;
  categoryId: string;
};

type ProductImage = { id: string; src: string; name: string; file?: File };

const MAX_PRODUCT_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function getInitialValues(product?: Product): ProductFormValues {
  return {
    name: product?.name ?? '',
    description: product?.description ?? '',
    slug: product?.slug ?? '',
    sku: product?.sku ?? '',
    price: product ? String(product.price) : '',
    currency: product?.currency ?? 'USD',
    categoryId: product?.categoryId ?? '',
  };
}

export function ProductForm({
  product,
  categories,
  inventory,
  isSaving,
  errorMessage,
  onManageStock,
  onSubmit,
}: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(() => getInitialValues(product));
  const [images, setImages] = useState<ProductImage[]>(() =>
    product?.imageUrl ? [{ id: product.imageUrl, src: product.imageUrl, name: 'Product image' }] : [],
  );
  const [imageError, setImageError] = useState<string | null>(null);
  const imagesRef = useRef(images);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(
    () => () => {
      imagesRef.current.forEach((image) => {
        if (image.file) URL.revokeObjectURL(image.src);
      });
    },
    [],
  );

  function updateValue<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      name: values.name.trim(),
      description: values.description.trim() || null,
      slug: values.slug.trim(),
      sku: values.sku.trim(),
      price: Number(values.price),
      currency: values.currency.trim().toUpperCase(),
      imageUrl: images.find((image) => !image.file)?.src ?? null,
      categoryId: values.categoryId || null,
    });
  }

  function addImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = '';
    const remainingSlots = MAX_PRODUCT_IMAGES - images.length;
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) errors.push(`${file.name} is not an image.`);
      else if (file.size > MAX_IMAGE_SIZE) errors.push(`${file.name} exceeds the 5 MB limit.`);
      else if (validFiles.length < remainingSlots) validFiles.push(file);
      else errors.push(`You can add up to ${MAX_PRODUCT_IMAGES} images.`);
    }

    setImages((current) => [
      ...current,
      ...validFiles.map((file) => {
        const src = URL.createObjectURL(file);
        return { id: src, src, name: file.name, file };
      }),
    ]);
    setImageError(errors.length ? errors.join(' ') : null);
  }

  function removeImage(imageId: string) {
    const image = images.find((item) => item.id === imageId);
    if (image?.file) URL.revokeObjectURL(image.src);
    setImages((current) => current.filter((item) => item.id !== imageId));
    setImageError(null);
  }

  return (
    <form id="product-editor-form" className="space-y-6" onSubmit={(event) => void submit(event)}>
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <section className="space-y-4 rounded-lg border bg-card p-5">
            <div>
              <h2 className="text-base font-semibold">Name and Description</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Set the product name and customer-facing description.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-name">Name</Label>
              <Input
                id="product-name"
                value={values.name}
                onChange={(event) => updateValue('name', event.target.value)}
                required
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-description">Description</Label>
              <textarea
                id="product-description"
                value={values.description}
                onChange={(event) => updateValue('description', event.target.value)}
                rows={5}
                disabled={isSaving}
                placeholder="Describe the product"
                className="flex w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              />
            </div>
          </section>

          <section className="space-y-4 rounded-lg border bg-card p-5">
            <h2 className="text-base font-semibold">Product Details</h2>
            <div className="space-y-2">
              <Label htmlFor="product-slug">Slug</Label>
              <Input
                id="product-slug"
                value={values.slug}
                onChange={(event) => updateValue('slug', event.target.value)}
                required
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-sku">SKU</Label>
              <Input
                id="product-sku"
                value={values.sku}
                onChange={(event) => updateValue('sku', event.target.value)}
                required
                disabled={isSaving}
              />
            </div>
          </section>

          <section className="space-y-4 rounded-lg border bg-card p-5">
            <h2 className="text-base font-semibold">Category</h2>
            <div className="space-y-2">
              <Label htmlFor="product-category">Category</Label>
              <select
                id="product-category"
                value={values.categoryId}
                onChange={(event) => updateValue('categoryId', event.target.value)}
                disabled={isSaving}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              >
                <option value="">Uncategorized</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="space-y-4 rounded-lg border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">Manage stock</h2>
                <p className="mt-1 text-sm text-muted-foreground">Inventory quantities are managed separately.</p>
              </div>
              {product ? (
                <Button type="button" size="sm" variant="outline" onClick={onManageStock}>
                  Inventory <ArrowUpRight aria-hidden="true" />
                </Button>
              ) : null}
            </div>
            {inventory ? (
              <div className="grid grid-cols-3 gap-3 text-sm">
                {[
                  { label: 'Available', value: inventory.availableQuantity },
                  { label: 'Reserved', value: inventory.reservedQuantity },
                  { label: 'Total', value: inventory.totalQuantity },
                ].map((item) => (
                  <div key={item.label} className="rounded-md bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="mt-1 font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
                {product
                  ? 'No inventory record is available for this product.'
                  : 'Save this product before managing its stock.'}
              </p>
            )}
          </section>

          <section className="space-y-4 rounded-lg border bg-card p-5">
            <h2 className="text-base font-semibold">Product Pricing</h2>
            <div className="grid grid-cols-[1fr_5rem] gap-3">
              <div className="space-y-2">
                <Label htmlFor="product-price">Price</Label>
                <Input
                  id="product-price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={values.price}
                  onChange={(event) => updateValue('price', event.target.value)}
                  required
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-currency">Currency</Label>
                <Input
                  id="product-currency"
                  maxLength={3}
                  value={values.currency}
                  onChange={(event) => updateValue('currency', event.target.value)}
                  required
                  disabled={isSaving}
                />
              </div>
            </div>
          </section>

          <section className="space-y-5 rounded-lg border bg-card p-5">
            <div>
              <h2 className="text-base font-semibold">Product Image</h2>
              <p className="mt-1 text-sm text-muted-foreground">Upload up to 5 images. Each image can be up to 5 MB.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="group relative aspect-square overflow-hidden rounded-lg border bg-muted/30"
                >
                  <img src={image.src} alt={image.name} className="size-full object-contain" />
                  {index === 0 ? (
                    <span className="absolute bottom-2 left-2 rounded bg-background/90 px-2 py-1 text-xs font-medium">
                      Primary
                    </span>
                  ) : null}
                  <button
                    type="button"
                    aria-label={`Remove ${image.name}`}
                    onClick={() => removeImage(image.id)}
                    disabled={isSaving}
                    className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 text-foreground shadow hover:bg-background"
                  >
                    <X aria-hidden="true" className="size-4" />
                  </button>
                </div>
              ))}
              {images.length < MAX_PRODUCT_IMAGES ? (
                <label
                  htmlFor="product-images"
                  className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/20 text-muted-foreground hover:bg-muted/40"
                >
                  <ImagePlus aria-hidden="true" className="size-8" />
                  <span className="text-sm">Add images</span>
                  <Input
                    id="product-images"
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={addImages}
                    disabled={isSaving}
                  />
                </label>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">
              {images.length} / {MAX_PRODUCT_IMAGES} images
            </p>
            {imageError ? (
              <p role="alert" className="text-sm text-destructive">
                {imageError}
              </p>
            ) : null}
          </section>
        </div>
      </div>

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertTitle>Could not save product</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}
    </form>
  );
}
