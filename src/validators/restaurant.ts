import { z } from 'zod';

export const restaurantSchema = z.object({
  name: z.string().trim().min(1, 'Restaurant name is required').max(120, 'Name is too long'),
  // GST is optional; when provided it must be a full 15-character GSTIN.
  gstNo: z
    .string()
    .trim()
    .length(15, 'GST number must be exactly 15 characters')
    .optional()
    .or(z.literal('')),
  // Email is optional; when provided it must be a valid address.
  email: z.string().trim().email('Enter a valid email').optional().or(z.literal('')),
  phone: z.string().trim().regex(/^\d{10}$/, 'Phone must be exactly 10 digits'),
});

export type RestaurantFormValues = z.infer<typeof restaurantSchema>;
