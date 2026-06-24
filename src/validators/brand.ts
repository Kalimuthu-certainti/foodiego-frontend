import { z } from 'zod';

export const brandSchema = z.object({
  name: z.string().trim().min(1, 'Brand name is required').max(120, 'Name is too long'),
});

export type BrandFormValues = z.infer<typeof brandSchema>;
