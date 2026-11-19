import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').max(100, 'Use 100 characters or fewer'),
  description: z.string().trim().max(500, 'Use 500 characters or fewer'),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
