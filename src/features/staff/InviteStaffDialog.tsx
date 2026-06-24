import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Dialog } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Spinner } from '../../components/ui/spinner';
import { FormField } from '../../components/FormField';
import { useToast } from '../../components/ui/toast';
import { staffRoleSchema } from '../../validators/staff';
import * as staffApi from '../../services/staffApi';
import * as restaurantApi from '../../services/restaurantApi';
import * as branchApi from '../../services/branchApi';
import { QUERY_KEYS, ROLE_LABELS, STAFF_ROLES } from '../../utils/constants';
import { getErrorMessage } from '../../utils/apiError';
import type { InviteStaffInput } from '../../types';

/**
 * Local form schema. Optional scope ids accept "" (empty, = brand-wide) from the
 * dropdowns and are stripped before the request; the backend re-validates.
 */
const optionalUuid = (msg: string) => z.string().trim().uuid(msg).or(z.literal('')).optional();

const inviteFormSchema = z.object({
  name: z.string().trim().min(1, "Enter the staff member's name").max(120, 'Name is too long'),
  role: staffRoleSchema,
  phone: z.string().trim().regex(/^\d{10}$/, 'Phone must be exactly 10 digits'),
  restaurantId: optionalUuid('Select a valid restaurant'),
  branchId: optionalUuid('Select a valid branch'),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

const EMPTY: InviteFormValues = {
  name: '',
  role: 'RESTAURANT_MANAGER',
  phone: '',
  restaurantId: '',
  branchId: '',
};

export interface InviteStaffDialogProps {
  brandId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Invite a user to a staff role scoped to this brand (optionally a restaurant/branch). */
export function InviteStaffDialog({ brandId, open, onOpenChange }: InviteStaffDialogProps) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (open) reset(EMPTY);
  }, [open, reset]);

  const restaurantId = watch('restaurantId');

  // A branch belongs to a restaurant — clear the chosen branch whenever the
  // restaurant changes so a stale branch can't be submitted.
  useEffect(() => {
    setValue('branchId', '');
  }, [restaurantId, setValue]);

  const { data: restaurants = [] } = useQuery({
    queryKey: QUERY_KEYS.restaurants(brandId),
    queryFn: () => restaurantApi.listByBrand(brandId),
    enabled: open,
  });

  const { data: branches = [] } = useQuery({
    queryKey: QUERY_KEYS.branches(restaurantId ?? ''),
    queryFn: () => branchApi.listByRestaurant(restaurantId as string),
    enabled: open && Boolean(restaurantId),
  });

  const mutation = useMutation({
    mutationFn: (values: InviteFormValues) => {
      const payload: InviteStaffInput = {
        brandId,
        name: values.name,
        role: values.role,
        phone: values.phone,
        ...(values.restaurantId ? { restaurantId: values.restaurantId } : {}),
        ...(values.branchId ? { branchId: values.branchId } : {}),
      };
      return staffApi.invite(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.staff(brandId) });
      toast.success('Invitation sent.');
      onOpenChange(false);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Invite staff"
      description="Grant a user a staff role on this brand. Scope to a restaurant or branch if needed."
      footer={
        <>
          <Button variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button form="staff-form" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? <Spinner className="h-4 w-4" /> : null}
            Send invite
          </Button>
        </>
      }
    >
      <form
        id="staff-form"
        className="flex flex-col gap-4"
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        noValidate
      >
        <FormField label="Name" htmlFor="s-name" required error={errors.name?.message}>
          <Input
            id="s-name"
            autoFocus
            placeholder="e.g. Asha Rao"
            invalid={Boolean(errors.name)}
            {...register('name')}
          />
        </FormField>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Role" htmlFor="s-role" required error={errors.role?.message}>
            <Select
              id="s-role"
              invalid={Boolean(errors.role)}
              options={STAFF_ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
              {...register('role')}
            />
          </FormField>
          <FormField
            label="Phone"
            htmlFor="s-phone"
            required
            error={errors.phone?.message}
            hint="10 digits"
          >
            <Input id="s-phone" inputMode="numeric" invalid={Boolean(errors.phone)} {...register('phone')} />
          </FormField>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Restaurant"
            htmlFor="s-restaurant"
            error={errors.restaurantId?.message}
            hint="Optional — leave as brand-wide to scope to the whole brand"
          >
            <Select id="s-restaurant" invalid={Boolean(errors.restaurantId)} {...register('restaurantId')}>
              <option value="">Brand-wide (all restaurants)</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField
            label="Branch"
            htmlFor="s-branch"
            error={errors.branchId?.message}
            hint={restaurantId ? 'Optional' : 'Pick a restaurant first'}
          >
            <Select
              id="s-branch"
              disabled={!restaurantId}
              invalid={Boolean(errors.branchId)}
              {...register('branchId')}
            >
              <option value="">{restaurantId ? 'All branches' : '—'}</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
      </form>
    </Dialog>
  );
}
