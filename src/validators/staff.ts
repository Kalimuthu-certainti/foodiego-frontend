import { z } from 'zod';

/** Roles that can be invited as restaurant staff. Mirrors the backend enum. */
export const staffRoleSchema = z.enum([
  'RESTAURANT_MANAGER',
  'RESTAURANT_OPERATOR',
  'RESTAURANT_SUPPORT_STAFF',
]);

export const staffSchema = z.object({
  name: z.string().trim().min(1, "Enter the staff member's name").max(120, 'Name is too long'),
  role: staffRoleSchema,
  phone: z.string().trim().regex(/^\d{10}$/, 'Phone must be exactly 10 digits'),
  brandId: z.string().trim().uuid('Brand scope is required'),
  restaurantId: z.string().trim().uuid('Enter a valid restaurant id').optional(),
  branchId: z.string().trim().uuid('Enter a valid branch id').optional(),
});

export type StaffFormValues = z.infer<typeof staffSchema>;
