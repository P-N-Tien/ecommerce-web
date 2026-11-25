import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import type { Category } from '@/features/catalog/categories/types';
import type { ProductFilters } from '@/features/catalog/products/types';
import { Label } from '@/components/ui/label';

type ProductFilterProps = {
  categories: Category[];
  filters: ProductFilters;
  onApply: (filters: ProductFilters) => void;
  onClear: () => void;
};

type FilterValues = { search: string; categoryId: string; status: string; minPrice: string; maxPrice: string };

function toFilterValues(filters: ProductFilters): FilterValues {
  return {
    search: filters.search ?? '',
    categoryId: filters.categoryId ?? '',
    status: filters.isActive === undefined ? '' : filters.isActive ? 'active' : 'inactive',
    minPrice: filters.minPrice === undefined ? '' : String(filters.minPrice),
    maxPrice: filters.maxPrice === undefined ? '' : String(filters.maxPrice),
  };
}

export function ProductFilter({ categories, filters, onApply, onClear }: ProductFilterProps) {
  const [values, setValues] = useState<FilterValues>(() => toFilterValues(filters));
  const [appliedValues, setAppliedValues] = useState<FilterValues>(() => toFilterValues(filters));
  const secondaryCount = [filters.minPrice, filters.maxPrice, filters.categoryId].filter((v) => v !== undefined).length;
  const [isOpenFilter, setIsOpenFilter] = useState<boolean>(secondaryCount > 0);

  const activeFilters = [
    ...(appliedValues.search.trim() ? [{ key: 'search', label: `Search: ${appliedValues.search.trim()}` }] : []),
    ...(appliedValues.minPrice ? [{ key: 'min', label: `Min: ${appliedValues.minPrice || '0'}` }] : []),
    ...(appliedValues.maxPrice ? [{ key: 'max', label: `Max: ${appliedValues.maxPrice || '0'}` }] : []),
    ...(appliedValues.status
      ? [{ key: 'status', label: `Status: ${appliedValues.status === 'active' ? 'Active' : 'Inactive'}` }]
      : []),
    ...(appliedValues.categoryId
      ? [
          {
            key: 'category',
            label: `Category: ${
              categories.find((category) => String(category.id) === appliedValues.categoryId)?.name ??
              appliedValues.categoryId
            }`,
          },
        ]
      : []),
  ];

  function toFilters(nextValues: FilterValues, includeSearch: boolean): ProductFilters {
    return {
      ...(includeSearch && { search: nextValues.search.trim() || undefined }),
      categoryId: nextValues.categoryId || undefined,
      isActive: nextValues.status ? nextValues.status === 'active' : undefined,
      minPrice: nextValues.minPrice !== '' ? Number(nextValues.minPrice) : undefined,
      maxPrice: nextValues.maxPrice !== '' ? Number(nextValues.maxPrice) : undefined,
    };
  }

  function applyAdvancedFilters() {
    applyValues(values);
  }

  function applyValues(nextValues: FilterValues) {
    setAppliedValues(nextValues);
    onApply(toFilters(nextValues, true));
  }

  const selectedFilterCount = [
    appliedValues.status,
    appliedValues.categoryId,
    appliedValues.minPrice,
    appliedValues.maxPrice,
  ].filter(Boolean).length;

  function removeActiveFilter(key: string) {
    const nextValues = { ...values, ...appliedValues };
    if (key === 'search') nextValues.search = '';
    if (key === 'price') {
      nextValues.minPrice = '';
      nextValues.maxPrice = '';
    }
    if (key === 'status') nextValues.status = '';
    if (key === 'category') nextValues.categoryId = '';
    setValues(nextValues);
    applyValues(nextValues);
  }

  function clearFilters() {
    const emptyValues: FilterValues = { search: '', categoryId: '', status: '', minPrice: '', maxPrice: '' };
    setValues(emptyValues);
    setAppliedValues(emptyValues);
    setIsOpenFilter(false);
    onClear();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            applyValues(values);
          }}
          className="flex flex-1 items-center gap-2 min-w-72 max-w-md"
        >
          <Input
            aria-label="Search products"
            placeholder="Search name, SKU, or decription..."
            className="focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            value={values.search}
            onChange={(event) => setValues({ ...values, search: event.target.value })}
          />
          <Button type="button" variant="secondary" aria-label="Search" onClick={() => applyValues(values)}>
            <Search aria-hidden="true" />
          </Button>
        </form>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" size="sm" variant="outline" className="min-w-28 justify-between">
                {values.status === 'active' ? 'Active' : values.status === 'inactive' ? 'Inactive' : 'All statuses'}
                <ChevronDown aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-36">
              {[
                { value: '', label: 'All statuses' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ].map((option) => (
                <DropdownMenuItem
                  key={option.value || 'all'}
                  onSelect={() => {
                    const nextValues = { ...values, status: option.value };
                    setValues(nextValues);
                    applyValues(nextValues);
                  }}
                >
                  {option.label}
                  {values.status === option.value ? <Check aria-hidden="true" className="ml-auto size-4" /> : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            type="button"
            size="sm"
            variant={isOpenFilter ? 'secondary' : 'outline'}
            aria-expanded={isOpenFilter}
            aria-controls="product-advanced-filters"
            onClick={() => setIsOpenFilter(!isOpenFilter)}
          >
            <SlidersHorizontal aria-hidden="true" />
            Filter
            {selectedFilterCount > 0 ? (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {selectedFilterCount}
              </span>
            ) : null}
            {isOpenFilter ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
          </Button>
        </div>
        {activeFilters.length > 0 ? (
          <Button size="sm" type="button" variant="ghost" onClick={clearFilters}>
            Clear filters
          </Button>
        ) : null}
      </div>

      {isOpenFilter ? (
        <div id="product-advanced-filters" className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-2">
              <Label htmlFor="products-min-price" className="text-xs text-muted-foreground">
                Min price
              </Label>
              <Input
                id="products-min-price"
                aria-label="Minimum price"
                type="number"
                min="0"
                step="0.01"
                placeholder="Min price"
                value={values.minPrice}
                className="h-8 w-28 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                onChange={(event) => setValues({ ...values, minPrice: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs">
                <Label htmlFor="products-max-price" className="text-xs text-muted-foreground">
                  Maximum price
                </Label>
                <Input
                  id="products-max-price"
                  aria-label="Maximum price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Max price"
                  value={values.maxPrice}
                  className="h-8 w-28 text-sm focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  onChange={(event) => setValues({ ...values, maxPrice: event.target.value })}
                />
              </label>
            </div>

            <div className="flex gap-0.5 flex-col">
              <Label htmlFor="products-max-price" className="text-xs text-muted-foreground">
                Categories
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="text-xs text-muted-foreground h-8 w-36 justify-between font-normal"
                  >
                    {categories.find((category) => String(category.id) === values.categoryId)?.name ?? 'All categories'}
                    <ChevronDown aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
                  <DropdownMenuItem onSelect={() => setValues({ ...values, categoryId: '' })}>
                    All categories
                    {!values.categoryId ? <Check aria-hidden="true" className="ml-auto size-4" /> : null}
                  </DropdownMenuItem>
                  {categories.map((category) => {
                    const categoryId = String(category.id);
                    return (
                      <DropdownMenuItem key={category.id} onSelect={() => setValues({ ...values, categoryId })}>
                        {category.name}
                        {values.categoryId === categoryId ? (
                          <Check aria-hidden="true" className="ml-auto size-4" />
                        ) : null}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-end">
              <Button type="button" className="h-8 w-28 sm:w-auto" onClick={applyAdvancedFilters}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {!!activeFilters.length ? (
        <div aria-label="Active filters" className="flex flex-wrap items-center gap-2 p-3">
          <span className="mr-1 text-sm text-muted-foreground">Active: </span>
          {activeFilters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => removeActiveFilter(filter.key)}
              aria-label={`Remove ${filter.label} filter`}
              className="inline-flex h-7 items-center gap-1.5 rounded-4xl border bg-primary text-white px-2 text-xs hover:bg-primary/90"
            >
              {filter.label}
              <X aria-hidden="true" className="size-3.5" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
