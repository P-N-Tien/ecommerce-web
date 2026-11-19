import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { categorySchema, type CategoryFormValues } from '@/features/catalog/categories/schemas/category-schema';
import type { Category } from '@/features/catalog/categories/types';

type CategoryFormProps = {
  category?: Category | null;
  isSaving: boolean;
  errorMessage: string | null;
  onCancel: () => void;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
};

export function CategoryForm({ category, isSaving, errorMessage, onCancel, onSubmit }: CategoryFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: category?.name ?? '', description: category?.description ?? '' },
  });

  useEffect(() => {
    form.reset({ name: category?.name ?? '', description: category?.description ?? '' });
  }, [category, form]);

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit((values) => onSubmit(values).catch(() => undefined))} noValidate>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl><Input {...field} autoFocus maxLength={100} placeholder="For example, Accessories" disabled={isSaving} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description <span className="font-normal text-muted-foreground">(optional)</span></FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  rows={4}
                  maxLength={500}
                  placeholder="Describe the products in this category"
                  disabled={isSaving}
                  className="flex w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {errorMessage ? (
          <Alert variant="destructive" aria-live="assertive">
            <AlertTitle>Could not save category</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>Cancel</Button>
          <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving…' : category ? 'Save changes' : 'Create category'}</Button>
        </div>
      </form>
    </Form>
  );
}
