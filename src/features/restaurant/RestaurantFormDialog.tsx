import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Spinner } from '../../components/ui/spinner';
import { FormField } from '../../components/FormField';
import { useToast } from '../../components/ui/toast';
import { restaurantSchema, type RestaurantFormValues } from '../../validators/restaurant';
import * as restaurantApi from '../../services/restaurantApi';
import { QUERY_KEYS } from '../../utils/constants';
import { getErrorMessage } from '../../utils/apiError';

export interface RestaurantFormDialogProps {
  brandId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EMPTY: RestaurantFormValues = { name: '', gstNo: '', email: '', phone: '' };

/** Add a restaurant under the active brand. */
export function RestaurantFormDialog({ brandId, open, onOpenChange }: RestaurantFormDialogProps) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RestaurantFormValues>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (open) reset(EMPTY);
  }, [open, reset]);

  const mutation = useMutation({
    mutationFn: (values: RestaurantFormValues) =>
      restaurantApi.create({ brandId, ...values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.restaurants(brandId) });
      toast.success('Restaurant added.');
      onOpenChange(false);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add restaurant"
      description="Restaurants group the branches that operate under this brand."
      footer={
        <>
          <Button variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button form="restaurant-form" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? <Spinner className="h-4 w-4" /> : null}
            Add
          </Button>
        </>
      }
    >
      <form
        id="restaurant-form"
        className="flex flex-col gap-4"
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        noValidate
      >
        <FormField label="Name" htmlFor="r-name" required error={errors.name?.message}>
          <Input id="r-name" autoFocus invalid={Boolean(errors.name)} {...register('name')} />
        </FormField>
        <FormField
          label="GST number"
          htmlFor="r-gst"
          error={errors.gstNo?.message}
          hint="Optional · 15-character GSTIN"
        >
          <Input id="r-gst" invalid={Boolean(errors.gstNo)} {...register('gstNo')} />
        </FormField>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Email" htmlFor="r-email" error={errors.email?.message} hint="Optional">
            <Input id="r-email" type="email" invalid={Boolean(errors.email)} {...register('email')} />
          </FormField>
          <FormField
            label="Phone"
            htmlFor="r-phone"
            required
            error={errors.phone?.message}
            hint="10 digits"
          >
            <Input id="r-phone" inputMode="numeric" invalid={Boolean(errors.phone)} {...register('phone')} />
          </FormField>
        </div>
      </form>
    </Dialog>
  );
}
