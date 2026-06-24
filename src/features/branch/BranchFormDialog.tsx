import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LocateFixed, MapPin } from 'lucide-react';
import { Dialog } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Spinner } from '../../components/ui/spinner';
import { FormField } from '../../components/FormField';
import { useToast } from '../../components/ui/toast';
import { WorkingHoursEditor, emptyWorkingHours } from './WorkingHoursEditor';
import { branchSchema, type BranchFormValues } from '../../validators/branch';
import * as branchApi from '../../services/branchApi';
import { QUERY_KEYS } from '../../utils/constants';
import { getErrorMessage } from '../../utils/apiError';

export interface BranchFormDialogProps {
  restaurantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type GeoStatus = 'idle' | 'locating' | 'error';

/** Add a branch (location + working hours) under a restaurant. */
export function BranchFormDialog({ restaurantId, open, onOpenChange }: BranchFormDialogProps) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: { name: '', workingHours: emptyWorkingHours() },
  });

  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle');
  const [geoError, setGeoError] = useState<string>('');
  const [manualOpen, setManualOpen] = useState(false);

  useEffect(() => {
    if (open) {
      reset({ name: '', workingHours: emptyWorkingHours() });
      setGeoStatus('idle');
      setGeoError('');
      setManualOpen(false);
    }
  }, [open, reset]);

  const mutation = useMutation({
    mutationFn: (values: BranchFormValues) => branchApi.create({ restaurantId, ...values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.branches(restaurantId) });
      toast.success('Branch added.');
      onOpenChange(false);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const lat = watch('lat');
  const lng = watch('lng');
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

  /** Capture the device's current position via the browser Geolocation API. */
  const useCurrentLocation = () => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setGeoStatus('error');
      setGeoError("This device can't share its location. Enter the coordinates manually.");
      setManualOpen(true);
      return;
    }
    setGeoStatus('locating');
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue('lat', Number(pos.coords.latitude.toFixed(6)), { shouldValidate: true });
        setValue('lng', Number(pos.coords.longitude.toFixed(6)), { shouldValidate: true });
        setGeoStatus('idle');
      },
      (err) => {
        setGeoStatus('error');
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission was blocked. Enter the coordinates manually below.'
            : "Couldn't get your location. Enter the coordinates manually below.",
        );
        setManualOpen(true);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const coordError = errors.lat?.message ?? errors.lng?.message;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add branch"
      description="Capture the branch location with GPS (or enter it manually) and set its weekly hours."
      className="max-w-xl"
      footer={
        <>
          <Button variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button form="branch-form" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? <Spinner className="h-4 w-4" /> : null}
            Add
          </Button>
        </>
      }
    >
      <form
        id="branch-form"
        className="flex flex-col gap-4"
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        noValidate
      >
        <FormField label="Name" htmlFor="b-name" required error={errors.name?.message}>
          <Input id="b-name" autoFocus invalid={Boolean(errors.name)} {...register('name')} />
        </FormField>

        <FormField label="Location" required error={coordError}>
          <div className="flex flex-col gap-3 rounded-md border border-slate-200 p-3">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={useCurrentLocation}
                disabled={geoStatus === 'locating'}
              >
                {geoStatus === 'locating' ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <LocateFixed className="h-4 w-4" />
                )}
                {hasCoords ? 'Update with current location' : 'Use my current location'}
              </Button>

              {hasCoords ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-slate-700">
                  <MapPin className="h-4 w-4 text-brand-600" />
                  {(lat as number).toFixed(6)}, {(lng as number).toFixed(6)}
                </span>
              ) : (
                <span className="text-sm text-slate-500">No location set yet</span>
              )}
            </div>

            {geoStatus === 'error' && geoError ? (
              <p className="text-xs font-medium text-amber-600">{geoError}</p>
            ) : null}

            <button
              type="button"
              onClick={() => setManualOpen((v) => !v)}
              className="self-start text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              {manualOpen ? 'Hide manual entry' : 'Enter coordinates manually'}
            </button>

            {manualOpen ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField label="Latitude" htmlFor="b-lat" error={errors.lat?.message}>
                  <Input
                    id="b-lat"
                    type="number"
                    step="any"
                    inputMode="decimal"
                    placeholder="12.9716"
                    invalid={Boolean(errors.lat)}
                    {...register('lat', { valueAsNumber: true })}
                  />
                </FormField>
                <FormField label="Longitude" htmlFor="b-lng" error={errors.lng?.message}>
                  <Input
                    id="b-lng"
                    type="number"
                    step="any"
                    inputMode="decimal"
                    placeholder="77.5946"
                    invalid={Boolean(errors.lng)}
                    {...register('lng', { valueAsNumber: true })}
                  />
                </FormField>
              </div>
            ) : null}
          </div>
        </FormField>

        <FormField label="Working hours" error={errors.workingHours?.message as string | undefined}>
          <Controller
            control={control}
            name="workingHours"
            render={({ field }) => (
              <WorkingHoursEditor value={field.value} onChange={field.onChange} />
            )}
          />
        </FormField>
      </form>
    </Dialog>
  );
}
