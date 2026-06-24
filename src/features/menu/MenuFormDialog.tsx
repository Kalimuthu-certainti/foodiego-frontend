import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Plus, Trash2, Upload } from 'lucide-react';
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

type ParsedItem = { name: string; price: number; description: string };

/**
 * Parse pasted menu items as either a JSON array (`[{name, price, description}]`)
 * or CSV (`name,price,description` per line, optional header). Throws a friendly
 * Error describing the first bad row.
 */
function parseBulkItems(text: string): ParsedItem[] {
  const trimmed = text.trim();
  if (!trimmed) throw new Error('Paste some items first.');

  // JSON array / object.
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    let data: unknown;
    try {
      data = JSON.parse(trimmed);
    } catch {
      throw new Error('That does not look like valid JSON.');
    }
    const rows = Array.isArray(data) ? data : [data];
    return rows.map((row, i) => {
      const r = row as Record<string, unknown>;
      const name = String(r.name ?? '').trim();
      const price = Number(r.price);
      if (!name) throw new Error(`Item ${i + 1}: name is required.`);
      if (!Number.isFinite(price)) throw new Error(`Item ${i + 1}: price must be a number.`);
      return { name, price, description: r.description ? String(r.description) : '' };
    });
  }

  // CSV: name,price,description (a header row with "name" + "price" is skipped).
  const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const hasHeader = /name/i.test(lines[0]) && /price/i.test(lines[0]);
  return lines.slice(hasHeader ? 1 : 0).map((line, i) => {
    const cols = line.split(',').map((c) => c.trim());
    const name = cols[0];
    const price = Number(cols[1]);
    if (!name) throw new Error(`Row ${i + 1}: name is required.`);
    if (!Number.isFinite(price)) throw new Error(`Row ${i + 1}: price must be a number.`);
    return { name, price, description: cols.slice(2).join(', ') };
  });
}

export type MenuDialogMode = 'submit' | 'change';

export interface MenuFormDialogProps {
  brandId: string;
  mode: MenuDialogMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Build the menu in either mode:
 * - "submit": POST the brand's initial menu (locks the menu).
 * - "change": file a change request against a locked menu.
 */
export function MenuFormDialog({ brandId, mode, open, onOpenChange }: MenuFormDialogProps) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    control,
    getValues,
    formState: { errors },
  } = useForm<MenuFormValues>({
    resolver: zodResolver(menuFormSchema),
    defaultValues: { items: [{ ...EMPTY_ITEM }], reason: '' },
  });

  const { fields, append, remove, replace } = useFieldArray({ control, name: 'items' });

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkError, setBulkError] = useState('');

  useEffect(() => {
    if (open) {
      reset({ items: [{ ...EMPTY_ITEM }], reason: '' });
      setBulkOpen(false);
      setBulkText('');
      setBulkError('');
    }
  }, [open, reset]);

  /** Parse the pasted CSV/JSON and merge it into the current item list. */
  const applyBulk = () => {
    let parsed: ParsedItem[];
    try {
      parsed = parseBulkItems(bulkText);
    } catch (err) {
      setBulkError(err instanceof Error ? err.message : 'Could not parse those items.');
      return;
    }
    if (parsed.length === 0) {
      setBulkError('No items found.');
      return;
    }
    // Keep any rows the user already filled in, drop empty placeholders.
    const existing = (getValues('items') ?? []).filter((it) => it.name && it.name.trim());
    replace([...existing, ...parsed]);
    setBulkText('');
    setBulkError('');
    setBulkOpen(false);
  };

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

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ ...EMPTY_ITEM })}
          >
            <Plus className="h-4 w-4" />
            Add item
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setBulkOpen((v) => !v)}
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
        </div>

        {bulkOpen ? (
          <div className="flex flex-col gap-2 rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-600">
              Paste a CSV (<span className="font-mono">name,price,description</span> per line) or a JSON
              array of <span className="font-mono">{'{ name, price, description }'}</span>.
            </p>
            <Textarea
              rows={5}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={'Paneer Tikka,280,Char-grilled cottage cheese\nButter Naan,60\nHyderabadi Biryani,320'}
              className="font-mono text-xs"
              aria-label="Bulk menu items"
            />
            {bulkError ? <p className="text-xs font-medium text-red-600">{bulkError}</p> : null}
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" onClick={applyBulk}>
                Add items
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setBulkOpen(false);
                  setBulkError('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

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
