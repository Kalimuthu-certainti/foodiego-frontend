import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { Dialog } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Spinner } from '../../components/ui/spinner';
import { FormField } from '../../components/FormField';
import { useToast } from '../../components/ui/toast';
import * as menuApi from '../../services/menuApi';
import { QUERY_KEYS } from '../../utils/constants';
import { getErrorMessage } from '../../utils/apiError';
import type { Brand, MenuChangeRequest, MenuItem } from '../../types';

const CATEGORIES = ['Beverages', 'Breakfast', 'Desserts', 'Main Course', 'Rice', 'Starters', 'Others'];
const SPICE_LEVELS = ['Mild', 'Medium', 'Hot', 'Extra Hot'];
const ALLERGEN_OPTIONS = ['Dairy', 'Gluten', 'Nuts', 'Shellfish', 'Egg', 'Soy'];

const itemSchema = z.object({
  item_name:        z.string().trim().min(1, 'Item name is required'),
  category:         z.string().min(1, 'Category is required'),
  sub_category:     z.string().trim().optional(),
  description:      z.string().trim().max(300, 'Too long').optional(),
  price:            z.number({ invalid_type_error: 'Price is required' }).nonnegative('Must be ≥ 0'),
  discount_price:   z.number().nonnegative('Must be ≥ 0').optional(),
  tax_percentage:   z.number().min(0).max(100).optional(),
  image_url:        z.string().url('Enter a valid URL').or(z.literal('')).optional(),
  food_type:        z.enum(['Veg', 'Non-Veg', 'Egg'], { required_error: 'Select food type' }),
  spice_level:      z.string().optional(),
  calories:         z.number().nonnegative().optional(),
  allergens:        z.string().optional(),
  status:           z.enum(['active', 'inactive']),
  available_from:   z.string().optional(),
  available_to:     z.string().optional(),
  packaging_charge: z.number().nonnegative().optional(),
  display_order:    z.number().int().nonnegative().optional(),
  is_featured:      z.boolean(),
  is_bestseller:    z.boolean(),
  is_customizable:  z.boolean(),
});

const menuFormSchema = z.object({
  items: z.array(itemSchema).min(1, 'Add at least one item'),
  reason: z.string().trim().max(500, 'Reason is too long').optional(),
});

type MenuFormValues = z.infer<typeof menuFormSchema>;

const EMPTY_ITEM: MenuFormValues['items'][number] = {
  item_name: '', category: '', sub_category: '', description: '',
  price: 0, discount_price: undefined, tax_percentage: 5,
  image_url: '', food_type: 'Veg', spice_level: 'Mild',
  calories: undefined, allergens: '', status: 'active',
  available_from: '', available_to: '', packaging_charge: undefined,
  display_order: undefined, is_featured: false, is_bestseller: false, is_customizable: false,
};

export type MenuDialogMode = 'submit' | 'change';

export interface MenuFormDialogProps {
  brandId: string;
  mode: MenuDialogMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MenuFormDialog({ brandId, mode, open, onOpenChange }: MenuFormDialogProps) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<MenuFormValues>({
    resolver: zodResolver(menuFormSchema),
    defaultValues: { items: [{ ...EMPTY_ITEM }], reason: '' },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  useEffect(() => {
    if (open) reset({ items: [{ ...EMPTY_ITEM }], reason: '' });
  }, [open, reset]);

  const mutation = useMutation<Brand | MenuChangeRequest, unknown, MenuFormValues>({
    mutationFn: (values) => {
      const items = values.items as MenuItem[];
      if (mode === 'submit') return menuApi.submit(brandId, { items });
      return menuApi.createChangeRequest({ brandId, items, reason: values.reason || undefined });
    },
    onSuccess: () => {
      if (mode === 'submit') {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.brand(brandId) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.brands });
        toast.success('Menu submitted. It is now locked.');
      } else {
        toast.success('Change request filed.');
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.menuChangeRequests(brandId) });
      onOpenChange(false);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const isChange = mode === 'change';

  const err = (i: number) => errors.items?.[i];

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isChange ? 'Request a menu change' : 'Submit menu'}
      description={
        isChange
          ? 'Propose the updated menu. An admin reviews the request before it goes live.'
          : 'Add your menu items. Submitting locks the menu; further edits go through change requests.'
      }
      className="max-w-3xl"
      footer={
        <>
          <Button variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button form="menu-form" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? <Spinner className="h-4 w-4" /> : null}
            {isChange ? 'Submit request' : 'Submit menu'}
          </Button>
        </>
      }
    >
      <form id="menu-form" className="flex flex-col gap-6" onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
        {fields.map((field, i) => (
          <div key={field.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            {/* Card header */}
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Item {i + 1}</span>
              <button type="button" disabled={fields.length === 1} onClick={() => remove(i)}
                className="text-slate-400 hover:text-red-500 disabled:opacity-30">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Section: Basic info */}
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Basic Info</p>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField label="Item Name" required error={err(i)?.item_name?.message}>
                <Input placeholder="e.g. Paneer Butter Masala" invalid={Boolean(err(i)?.item_name)}
                  {...register(`items.${i}.item_name`)} />
              </FormField>

              <FormField label="Category" required error={err(i)?.category?.message}>
                <Select placeholder="Select category" invalid={Boolean(err(i)?.category)}
                  {...register(`items.${i}.category`)}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </FormField>

              <FormField label="Sub Category" error={err(i)?.sub_category?.message}>
                <Input placeholder="e.g. Juice, Dosa, Biryani" {...register(`items.${i}.sub_category`)} />
              </FormField>

              <FormField label="Food Type" required error={err(i)?.food_type?.message}>
                <Select invalid={Boolean(err(i)?.food_type)} {...register(`items.${i}.food_type`)}>
                  <option value="Veg">🟢 Veg</option>
                  <option value="Non-Veg">🔴 Non-Veg</option>
                  <option value="Egg">🟡 Egg</option>
                </Select>
              </FormField>

              <FormField label="Status" required error={err(i)?.status?.message}>
                <Select {...register(`items.${i}.status`)}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </FormField>

              <FormField label="Spice Level" error={err(i)?.spice_level?.message}>
                <Select {...register(`items.${i}.spice_level`)}>
                  {SPICE_LEVELS.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </FormField>

              <FormField label="Description" error={err(i)?.description?.message} className="sm:col-span-2">
                <Textarea rows={2} placeholder="Short description of the item (optional)"
                  className="min-h-0" {...register(`items.${i}.description`)} />
              </FormField>
            </div>

            {/* Section: Pricing */}
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Pricing</p>
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <FormField label="Price (₹)" required error={err(i)?.price?.message}>
                <Input type="number" step="any" min={0} placeholder="0.00"
                  invalid={Boolean(err(i)?.price)}
                  {...register(`items.${i}.price`, { valueAsNumber: true })} />
              </FormField>

              <FormField label="Discount Price (₹)" error={err(i)?.discount_price?.message}>
                <Input type="number" step="any" min={0} placeholder="0.00"
                  {...register(`items.${i}.discount_price`, { valueAsNumber: true })} />
              </FormField>

              <FormField label="Tax (%)" error={err(i)?.tax_percentage?.message}>
                <Input type="number" step="any" min={0} max={100} placeholder="5"
                  {...register(`items.${i}.tax_percentage`, { valueAsNumber: true })} />
              </FormField>

              <FormField label="Packaging Charge (₹)" error={err(i)?.packaging_charge?.message}>
                <Input type="number" step="any" min={0} placeholder="0"
                  {...register(`items.${i}.packaging_charge`, { valueAsNumber: true })} />
              </FormField>
            </div>

            {/* Section: Nutrition & Allergens */}
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Nutrition & Allergens</p>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField label="Calories (kcal)" error={err(i)?.calories?.message}>
                <Input type="number" min={0} placeholder="e.g. 250"
                  {...register(`items.${i}.calories`, { valueAsNumber: true })} />
              </FormField>

              <FormField label="Allergens" error={err(i)?.allergens?.message}>
                <Input placeholder={ALLERGEN_OPTIONS.join(', ')}
                  {...register(`items.${i}.allergens`)} />
              </FormField>
            </div>

            {/* Section: Availability */}
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Availability</p>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField label="Available From" error={err(i)?.available_from?.message}>
                <Input type="time" {...register(`items.${i}.available_from`)} />
              </FormField>

              <FormField label="Available To" error={err(i)?.available_to?.message}>
                <Input type="time" {...register(`items.${i}.available_to`)} />
              </FormField>
            </div>

            {/* Section: Display & Media */}
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Display & Media</p>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField label="Image URL" error={err(i)?.image_url?.message} className="sm:col-span-2">
                <Input placeholder="https://..." {...register(`items.${i}.image_url`)} />
              </FormField>

              <FormField label="Display Order" error={err(i)?.display_order?.message}>
                <Input type="number" min={0} placeholder="1"
                  {...register(`items.${i}.display_order`, { valueAsNumber: true })} />
              </FormField>
            </div>

            {/* Flags */}
            <div className="flex flex-wrap gap-5">
              {(
                [
                  { name: `items.${i}.is_featured`,     label: 'Featured' },
                  { name: `items.${i}.is_bestseller`,   label: 'Bestseller' },
                  { name: `items.${i}.is_customizable`, label: 'Customizable' },
                ] as const
              ).map(({ name, label }) => (
                <label key={name} className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-brand-600"
                    {...register(name)} />
                  {label}
                </label>
              ))}
            </div>
          </div>
        ))}

        {typeof errors.items?.message === 'string' && (
          <p className="text-xs font-medium text-red-600">{errors.items.message}</p>
        )}

        <Button type="button" variant="outline" size="sm" className="self-start"
          onClick={() => append({ ...EMPTY_ITEM })}>
          <Plus className="h-4 w-4" /> Add item
        </Button>

        {isChange && (
          <FormField label="Reason for change" htmlFor="menu-reason" error={errors.reason?.message}>
            <Textarea id="menu-reason" placeholder="Why is this change needed?" {...register('reason')} />
          </FormField>
        )}
      </form>
    </Dialog>
  );
}
