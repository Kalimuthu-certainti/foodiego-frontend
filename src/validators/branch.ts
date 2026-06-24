import { z } from 'zod';

/** A single open/close window, e.g. { open: "10:00", close: "22:00" } (HH:MM, 24h). */
const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM (24-hour) format');

export const workingHoursSlotSchema = z
  .object({
    open: timeString,
    close: timeString,
  })
  .refine((slot) => slot.open < slot.close, {
    message: 'Open time must be before close time',
    path: ['close'],
  });

const daySchema = z.array(workingHoursSlotSchema);

/** working_hours JSONB: per-day list of slots; empty array = closed for that day. */
export const workingHoursSchema = z.object({
  mon: daySchema,
  tue: daySchema,
  wed: daySchema,
  thu: daySchema,
  fri: daySchema,
  sat: daySchema,
  sun: daySchema,
});

export const branchSchema = z.object({
  name: z.string().trim().min(1, 'Branch name is required').max(120, 'Name is too long'),
  lat: z
    .number({ invalid_type_error: 'Latitude is required' })
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  lng: z
    .number({ invalid_type_error: 'Longitude is required' })
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  workingHours: workingHoursSchema,
});

export type BranchFormValues = z.infer<typeof branchSchema>;
export type WorkingHoursValues = z.infer<typeof workingHoursSchema>;
