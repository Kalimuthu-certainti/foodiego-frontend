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

const inviteFormSchema = z.object({
  name:     z.string().trim().min(1, "Enter the staff member's name").max(120, 'Name is too long'),
  role:     staffRoleSchema,
  phone:    z.string().trim().regex(/^\d{10}$/, 'Phone must be exactly 10 digits'),
  branchId: z.string().trim().uuid('Select a valid branch').or(z.literal('')).optional(),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

const EMPTY: InviteFormValues = { name: '', role: 'RESTAURANT_MANAGER', phone: '', branchId: '' };

export interface InviteStaffDialogProps {
  brandId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteStaffDialog({ brandId, open, onOpenChange }: InviteStaffDialogProps) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (open) reset(EMPTY);
  }, [open, reset]);

  // Silently resolve the brand's restaurant — not shown to the user.
  const { data: restaurants = [] } = useQuery({
    queryKey: QUERY_KEYS.restaurants(brandId),
    queryFn: () => restaurantApi.listByBrand(brandId),
    enabled: open,
  });
  const firstRestaurantId = restaurants[0]?.id;

  const { data: branches = [], isLoading: loadingBranches } = useQuery({
    queryKey: QUERY_KEYS.branches(firstRestaurantId ?? ''),
    queryFn: () => branchApi.listByRestaurant(firstRestaurantId as string),
    enabled: open && Boolean(firstRestaurantId),
  });

  const mutation = useMutation({
    mutationFn: (values: InviteFormValues) => {
      const payload: InviteStaffInput = {
        brandId,
        name:  values.name,
        role:  values.role,
        phone: values.phone,
        // Pass the resolved restaurantId when scoping to a branch
        ...(values.branchId && firstRestaurantId ? { restaurantId: firstRestaurantId } : {}),
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

  const noBranches = !loadingBranches && branches.length === 0;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Invite staff"
      description="Grant a user a staff role on this brand. Optionally scope to a specific branch."
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

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Role" htmlFor="s-role" required error={errors.role?.message}>
            <Select
              id="s-role"
              invalid={Boolean(errors.role)}
              options={STAFF_ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
              {...register('role')}
            />
          </FormField>
          <FormField label="Phone" htmlFor="s-phone" required error={errors.phone?.message} hint="10 digits">
            <Input id="s-phone" inputMode="numeric" invalid={Boolean(errors.phone)} {...register('phone')} />
          </FormField>
        </div>

        <FormField
          label="Branch"
          htmlFor="s-branch"
          error={errors.branchId?.message}
          hint="Optional — leave blank to grant brand-wide access"
        >
          <Select
            id="s-branch"
            disabled={noBranches || loadingBranches}
            invalid={Boolean(errors.branchId)}
            {...register('branchId')}
          >
            <option value="">
              {loadingBranches ? 'Loading…' : noBranches ? 'No branches yet' : 'Brand-wide (all branches)'}
            </option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </FormField>
      </form>
    </Dialog>
  );
}
