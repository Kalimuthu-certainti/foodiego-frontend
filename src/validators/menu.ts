import { z } from 'zod';

/** A proposed menu item/change. The backend stores these as opaque JSONB. */
export const menuItemSchema = z.record(z.string(), z.unknown());

export const menuSchema = z.object({
  items: z.array(menuItemSchema).min(1, 'Add at least one menu item'),
  reason: z.string().trim().max(500, 'Reason is too long').optional(),
});

export type MenuFormValues = z.infer<typeof menuSchema>;
