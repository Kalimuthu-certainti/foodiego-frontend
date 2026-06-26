import { useEffect } from 'react';
import { useFieldArray, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { Dialog } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select } from '../../components/ui/select';
import { Spinner } from '../../components/ui/spinner';
import { FormField } from '../../components/FormField';
import { useToast } from '../../components/ui/toast';
import * as menuApi from '../../services/menuApi';
import { QUERY_KEYS } from '../../utils/constants';
import { getErrorMessage } from '../../utils/apiError';
import type { Brand, MenuChangeRequest } from '../../types';

// String input → optional number (empty string becomes undefined)
const strToOptNum = (min = 0) =>
  z
    .string()
    .transform((v) => {
      const trimmed = v.trim();
      if (!trimmed) return undefined;
      const n = parseFloat(trimmed);
      return Number.isFinite(n) ? n : undefined;
    })
    .pipe(z.number().min(min).optional());

// String input → required number
const strToReqNum = z
  .string()
  .min(1, 'Price is required')
  .transform((v) => parseFloat(v.trim()))
  .pipe(z.number({ invalid_type_error: 'Enter a valid price' }).nonnegative('Must be ≥ 0'));

const itemSchema = z.object({
  name:             z.string().trim().min(1, 'Item name is required'),
  category:         z.string().min(1, 'Category is required'),
  sub_category:     z.string().trim().optional(),
  food_type:        z.enum(['Veg', 'Non-Veg', 'Egg'], { errorMap: () => ({ message: 'Select food type' }) }),
  status:           z.enum(['Active', 'Inactive']).default('Active'),
  spice_level:      z.string().optional(),
  description:      z.string().trim().max(500, 'Max 500 characters').optional(),
  price:            strToReqNum,
  discount_price:   strToOptNum(),
  tax_percent:      strToOptNum(),
  packaging_charge: strToOptNum(),
  calories_kcal:    strToOptNum(),
  allergens:        z.string().trim().optional(),
  available_from:   z.string().optional(),
  available_to:     z.string().optional(),
  image_url:        z.union([z.literal(''), z.string().url('Enter a valid URL')]).optional(),
  display_order:    strToOptNum(),
  is_featured:      z.boolean().default(false),
  is_bestseller:    z.boolean().default(false),
  is_customizable:  z.boolean().default(false),
});

const menuFormSchema = z.object({
  items:  z.array(itemSchema).min(1, 'Add at least one item'),
  reason: z.string().trim().max(500, 'Reason is too long').optional(),
});

// Input type (what the form holds — numbers are strings from <input>)
type MenuFormInput = z.input<typeof menuFormSchema>;
// Output type (after zod transforms — numbers are real numbers)
type MenuFormOutput = z.infer<typeof menuFormSchema>;

const EMPTY_ITEM: z.input<typeof itemSchema> = {
  name: '', category: '', sub_category: '', food_type: 'Veg', status: 'Active',
  spice_level: '', description: '', price: '',
  discount_price: '', tax_percent: '', packaging_charge: '', calories_kcal: '',
  allergens: '', available_from: '', available_to: '', image_url: '',
  display_order: '', is_featured: false, is_bestseller: false, is_customizable: false,
};

const CATEGORIES = ['Beverages', 'Breakfast', 'Desserts', 'Main Course', 'Rice', 'Starters', 'Others'];

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

  const {
    register, handleSubmit, reset, control, formState: { errors },
  } = useForm<MenuFormInput>({
    // zodResolver transforms values at submit time; cast silences the input↔output type mismatch
    resolver: zodResolver(menuFormSchema) as unknown as Resolver<MenuFormInput>,
    defaultValues: { items: [{ ...EMPTY_ITEM }], reason: '' },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  useEffect(() => {
    if (open) reset({ items: [{ ...EMPTY_ITEM }], reason: '' });
  }, [open, reset]);

  const mutation = useMutation<Brand | MenuChangeRequest, unknown, MenuFormOutput>({
    mutationFn: (values) => {
      if (mode === 'submit') return menuApi.submit(brandId, { items: values.items as never[] });
      return menuApi.createChangeRequest({ brandId, items: values.items as never[], reason: values.reason || undefined });
    },
    onSuccess: () => {
      if (mode === 'submit') {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.brand(brandId) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.brands });
        toast.success('Menu submitted and locked.');
      } else {
        toast.success('Change request filed.');
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.menuChangeRequests(brandId) });
      onOpenChange(false);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const isChange = mode === 'change';

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isChange ? 'Request a menu change' : 'Submit menu'}
      description={
        isChange
          ? 'Propose updated menu items. An admin reviews the request before it goes live.'
          : 'Add your menu items. Submitting locks the menu; further edits go through change requests.'
      }
      className="max-w-3xl"
      footer={
        <>
          <Button variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button form="menu-form" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? <Spinner className="h-4 w-4" /> : null}
            {isChange ? 'Submit request' : 'Submit menu'}
          </Button>
        </>
      }
    >
      <form
        id="menu-form"
        className="flex flex-col gap-4"
        onSubmit={handleSubmit((v) => mutation.mutate(v as unknown as MenuFormOutput))}
        noValidate
      >
        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
          {fields.map((field, i) => {
            const e = errors.items?.[i];
            return (
              <div key={field.id} className="rounded-xl border border-slate-200 bg-white">
                {/* Item header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Item {i + 1}
                  </span>
                  <Button
                    type="button" variant="ghost" size="icon"
                    aria-label="Remove item"
                    disabled={fields.length === 1}
                    onClick={() => remove(i)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>

                <div className="flex flex-col gap-4 p-4">
                  {/* Row 1: Name + Category + Food Type */}
                  <div className="grid grid-cols-3 gap-3">
                    <FormField label="Item name" required error={e?.name?.message} className="col-span-1">
                      <Input
                        placeholder="e.g. Paneer Butter Masala"
                        invalid={Boolean(e?.name)}
                        {...register(`items.${i}.name`)}
                      />
                    </FormField>
                    <FormField label="Category" required error={e?.category?.message}>
                      <Select
                        invalid={Boolean(e?.category)}
                        placeholder="Select category"
                        options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                        {...register(`items.${i}.category`)}
                      />
                    </FormField>
                    <FormField label="Food type" required error={e?.food_type?.message}>
                      <Select
                        invalid={Boolean(e?.food_type)}
                        options={[
                          { value: 'Veg', label: '🟢 Veg' },
                          { value: 'Non-Veg', label: '🔴 Non-Veg' },
                          { value: 'Egg', label: '🟡 Egg' },
                        ]}
                        {...register(`items.${i}.food_type`)}
                      />
                    </FormField>
                  </div>

                  {/* Row 2: Sub Category + Status + Spice Level */}
                  <div className="grid grid-cols-3 gap-3">
                    <FormField label="Sub category" error={e?.sub_category?.message}>
                      <Input placeholder="e.g. Juice, Dosa, Biryani" {...register(`items.${i}.sub_category`)} />
                    </FormField>
                    <FormField label="Status" error={e?.status?.message}>
                      <Select
                        options={[
                          { value: 'Active', label: 'Active' },
                          { value: 'Inactive', label: 'Inactive' },
                        ]}
                        {...register(`items.${i}.status`)}
                      />
                    </FormField>
                    <FormField label="Spice level" error={e?.spice_level?.message}>
                      <Select
                        options={[
                          { value: '', label: 'Not applicable' },
                          { value: 'Mild', label: 'Mild' },
                          { value: 'Medium', label: 'Medium' },
                          { value: 'Hot', label: 'Hot' },
                          { value: 'Extra Hot', label: 'Extra Hot' },
                        ]}
                        {...register(`items.${i}.spice_level`)}
                      />
                    </FormField>
                  </div>

                  {/* Description */}
                  <FormField label="Description" error={e?.description?.message}>
                    <Textarea
                      rows={2}
                      className="min-h-0"
                      placeholder="Short description of the item (optional)"
                      {...register(`items.${i}.description`)}
                    />
                  </FormField>

                  {/* Section: Pricing */}
                  <div>
                    <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">Pricing</p>
                    <div className="grid grid-cols-4 gap-3">
                      <FormField label="Price (₹)" required error={e?.price?.message}>
                        <Input type="number" step="any" placeholder="0" invalid={Boolean(e?.price)} {...register(`items.${i}.price`)} />
                      </FormField>
                      <FormField label="Discount (₹)" error={e?.discount_price?.message}>
                        <Input type="number" step="any" placeholder="0.00" {...register(`items.${i}.discount_price`)} />
                      </FormField>
                      <FormField label="Tax (%)" error={e?.tax_percent?.message}>
                        <Input type="number" step="any" placeholder="5" {...register(`items.${i}.tax_percent`)} />
                      </FormField>
                      <FormField label="Packaging (₹)" error={e?.packaging_charge?.message}>
                        <Input type="number" step="any" placeholder="0" {...register(`items.${i}.packaging_charge`)} />
                      </FormField>
                    </div>
                  </div>

                  {/* Section: Nutrition & Allergens */}
                  <div>
                    <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">Nutrition &amp; Allergens</p>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Calories (kcal)" error={e?.calories_kcal?.message}>
                        <Input type="number" step="any" placeholder="e.g. 250" {...register(`items.${i}.calories_kcal`)} />
                      </FormField>
                      <FormField label="Allergens" error={e?.allergens?.message}>
                        <Input placeholder="Dairy, Gluten, Nuts…" {...register(`items.${i}.allergens`)} />
                      </FormField>
                    </div>
                  </div>

                  {/* Section: Availability */}
                  <div>
                    <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">Availability</p>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Available from" error={e?.available_from?.message}>
                        <Input type="time" {...register(`items.${i}.available_from`)} />
                      </FormField>
                      <FormField label="Available to" error={e?.available_to?.message}>
                        <Input type="time" {...register(`items.${i}.available_to`)} />
                      </FormField>
                    </div>
                  </div>

                  {/* Section: Display & Media */}
                  <div>
                    <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">Display &amp; Media</p>
                    <div className="grid grid-cols-4 gap-3">
                      <FormField label="Image URL" error={e?.image_url?.message} className="col-span-3">
                        <Input type="url" placeholder="https://…" invalid={Boolean(e?.image_url)} {...register(`items.${i}.image_url`)} />
                      </FormField>
                      <FormField label="Display order" error={e?.display_order?.message}>
                        <Input type="number" placeholder="1" {...register(`items.${i}.display_order`)} />
                      </FormField>
                    </div>
                  </div>

                  {/* Section: Flags */}
                  <div>
                    <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">Flags</p>
                    <div className="flex flex-wrap gap-5">
                      {(
                        [
                          { name: `items.${i}.is_featured` as const, label: 'Featured' },
                          { name: `items.${i}.is_bestseller` as const, label: 'Bestseller' },
                          { name: `items.${i}.is_customizable` as const, label: 'Customizable' },
                        ] as const
                      ).map(({ name, label }) => (
                        <label key={label} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-300 accent-brand-600"
                            {...register(name)}
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {typeof errors.items?.message === 'string' && (
          <p className="text-xs font-medium text-red-600">{errors.items.message}</p>
        )}

        <Button
          type="button" variant="outline" size="sm" className="self-start"
          onClick={() => append({ ...EMPTY_ITEM })}
        >
          <Plus className="h-4 w-4" />
          Add another item
        </Button>

        {isChange && (
          <FormField label="Reason for change" htmlFor="menu-reason" error={errors.reason?.message}>
            <Textarea
              id="menu-reason"
              placeholder="Why is this change needed?"
              {...register('reason')}
            />
          </FormField>
        )}
      </form>
    </Dialog>
  );
}
