import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { Dialog } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Spinner } from '../../components/ui/spinner';
import { FormField } from '../../components/FormField';
import { useToast } from '../../components/ui/toast';
import * as menuApi from '../../services/menuApi';
import { QUERY_KEYS } from '../../utils/constants';
import { getErrorMessage } from '../../utils/apiError';
import type { Brand, MenuChangeRequest, MenuItem } from '../../types';

const itemSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  price: z
    .number({ invalid_type_error: 'Price is required' })
    .nonnegative('Price must be 0 or more'),
  description: z.string().trim().max(200, 'Too long').optional(),
});

const menuFormSchema = z.object({
  items: z.array(itemSchema).min(1, 'Add at least one item'),
  reason: z.string().trim().max(500, 'Reason is too long').optional(),
});

type MenuFormValues = z.infer<typeof menuFormSchema>;

const EMPTY_ITEM = { name: '', price: 0, description: '' };

export type MenuDialogMode = 'submit' | 'change';

export interface MenuFormDialogProps {
  brandId: string;
  mode: MenuDialogMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Build the menu by hand in either mode:
 * - "submit": POST the brand's initial menu (locks the menu).
 * - "change": file a change request against a locked menu.
 *
 * For importing many items from a file, use Bulk import (see BulkImportDialog).
 */
export function MenuFormDialog({ brandId, mode, open, onOpenChange }: MenuFormDialogProps) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<MenuFormValues>({
    resolver: zodResolver(menuFormSchema),
    defaultValues: { items: [{ ...EMPTY_ITEM }], reason: '' },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  useEffect(() => {
    if (open) reset({ items: [{ ...EMPTY_ITEM }], reason: '' });
  }, [open, reset]);

  const mutation = useMutation<Brand | MenuChangeRequest, unknown, MenuFormValues>({
    mutationFn: (values: MenuFormValues) => {
      const items = values.items as MenuItem[];
      if (mode === 'submit') {
        return menuApi.submit(brandId, { items });
      }
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
      className="max-w-2xl"
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
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        noValidate
      >
        <div className="flex flex-col gap-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-[1fr_7rem_auto] items-start gap-2 rounded-md border border-slate-200 p-3"
            >
              <div className="flex flex-col gap-2">
                <Input
                  placeholder="Item name"
                  aria-label={`Item ${index + 1} name`}
                  invalid={Boolean(errors.items?.[index]?.name)}
                  {...register(`items.${index}.name` as const)}
                />
                {errors.items?.[index]?.name ? (
                  <p className="text-xs font-medium text-red-600">
                    {errors.items[index]?.name?.message}
                  </p>
                ) : null}
                <Textarea
                  rows={2}
                  placeholder="Description (optional)"
                  aria-label={`Item ${index + 1} description`}
                  className="min-h-0"
                  {...register(`items.${index}.description` as const)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Input
                  type="number"
                  step="any"
                  placeholder="Price"
                  aria-label={`Item ${index + 1} price`}
                  invalid={Boolean(errors.items?.[index]?.price)}
                  {...register(`items.${index}.price` as const, { valueAsNumber: true })}
                />
                {errors.items?.[index]?.price ? (
                  <p className="text-xs font-medium text-red-600">
                    {errors.items[index]?.price?.message}
                  </p>
                ) : null}
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove item ${index + 1}`}
                disabled={fields.length === 1}
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          ))}
        </div>

        {typeof errors.items?.message === 'string' ? (
          <p className="text-xs font-medium text-red-600">{errors.items.message}</p>
        ) : null}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => append({ ...EMPTY_ITEM })}
        >
          <Plus className="h-4 w-4" />
          Add item
        </Button>

        {isChange ? (
          <FormField label="Reason" htmlFor="menu-reason" error={errors.reason?.message}>
            <Textarea
              id="menu-reason"
              placeholder="Why is this change needed?"
              {...register('reason')}
            />
          </FormField>
        ) : null}
      </form>
    </Dialog>
  );
}
