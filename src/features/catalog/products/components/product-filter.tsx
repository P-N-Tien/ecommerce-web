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

type ProductFilterProps = {
  categories: Category[];
  onApply: (filters: ProductFilters) => void;
};

type FilterValues = { search: string; categoryId: string; status: string; minPrice: string; maxPrice: string };

const EMPTY_FILTERS: FilterValues = { search: '', categoryId: '', status: '', minPrice: '', maxPrice: '' };

export function ProductFilter({ categories, onApply }: ProductFilterProps) {
  const [values, setValues] = useState<FilterValues>(EMPTY_FILTERS);
  const [appliedValues, setAppliedValues] = useState<FilterValues>(EMPTY_FILTERS);
  const [isExpanded, setIsExpanded] = useState(false);

  function toFilters(nextValues: FilterValues, includeSearch: boolean): ProductFilters {
    return {
      ...(includeSearch && nextValues.search.trim() ? { search: nextValues.search.trim() } : {}),
      ...(nextValues.categoryId ? { categoryId: nextValues.categoryId } : {}),
      ...(nextValues.status ? { isActive: nextValues.status === 'active' } : {}),
      ...(nextValues.minPrice !== '' ? { minPrice: Number(nextValues.minPrice) } : {}),
      ...(nextValues.maxPrice !== '' ? { maxPrice: Number(nextValues.maxPrice) } : {}),
    };
  }

  function applyAdvancedFilters() {
    applyValues(values);
    setIsExpanded(false);
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

  const activeFilters = [
    ...(appliedValues.search.trim() ? [{ key: 'search', label: `Search: ${appliedValues.search.trim()}` }] : []),
    ...(appliedValues.minPrice || appliedValues.maxPrice
      ? [{ key: 'price', label: `Price: ${appliedValues.minPrice || '0'} – ${appliedValues.maxPrice || 'Any'}` }]
      : []),
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
              <Button type="button" variant="outline" className="min-w-36 justify-between">
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
            variant={isExpanded ? 'secondary' : 'outline'}
            aria-expanded={isExpanded}
            aria-controls="product-advanced-filters"
            onClick={() => setIsExpanded((expanded) => !expanded)}
          >
            <SlidersHorizontal aria-hidden="true" />
            Filter
            {selectedFilterCount > 0 ? (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {selectedFilterCount}
              </span>
            ) : null}
            {isExpanded ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
          </Button>
        </div>
      </div>

      {isExpanded ? (
        <div id="product-advanced-filters" className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <label className="space-y-2 text-xs">
              <span>Minimum price</span>
              <Input
                aria-label="Minimum price"
                type="number"
                min="0"
                step="0.01"
                placeholder="Min price"
                value={values.minPrice}
                className="focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                onChange={(event) => setValues({ ...values, minPrice: event.target.value })}
              />
            </label>
            <label className="space-y-2 text-xs">
              <span>Maximum price</span>
              <Input
                aria-label="Maximum price"
                type="number"
                min="0"
                step="0.01"
                placeholder="Max price"
                value={values.maxPrice}
                className="focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                onChange={(event) => setValues({ ...values, maxPrice: event.target.value })}
              />
            </label>
            <label className="space-y-2 text-xs">
              <span>Category</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" className="w-full justify-between font-normal">
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
            </label>
            <div className="flex items-end">
              <Button type="button" className="w-full sm:w-auto" onClick={applyAdvancedFilters}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {activeFilters.length > 0 ? (
        <div aria-label="Active filters" className="flex flex-wrap items-center gap-2 p-3">
          <span className="mr-1 text-sm font-normal">Active: </span>
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
