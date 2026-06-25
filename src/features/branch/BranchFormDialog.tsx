import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Search, X } from 'lucide-react';
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

interface GeoResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

type SearchStatus = 'idle' | 'searching' | 'error';

interface ManualAddress {
  number: string;
  street: string;
  area: string;
  pincode: string;
}

const emptyManual = (): ManualAddress => ({ number: '', street: '', area: '', pincode: '' });

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

  const [addressQuery, setAddressQuery] = useState('');
  const [searchStatus, setSearchStatus] = useState<SearchStatus>('idle');
  const [searchError, setSearchError] = useState('');
  const [results, setResults] = useState<GeoResult[]>([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [manualOpen, setManualOpen] = useState(false);
  const [manual, setManual] = useState<ManualAddress>(emptyManual());
  const [manualStatus, setManualStatus] = useState<SearchStatus>('idle');
  const [manualError, setManualError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      reset({ name: '', workingHours: emptyWorkingHours() });
      setAddressQuery('');
      setSearchStatus('idle');
      setSearchError('');
      setResults([]);
      setSelectedAddress('');
      setManualOpen(false);
      setManual(emptyManual());
      setManualStatus('idle');
      setManualError('');
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

  const geocode = async (query: string): Promise<GeoResult[]> => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } },
    );
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  };

  const searchAddress = async (query: string) => {
    if (!query.trim()) { setResults([]); return; }
    setSearchStatus('searching');
    setSearchError('');
    try {
      const data = await geocode(query);
      setResults(data);
      if (data.length === 0) setSearchError('No locations found. Try a more specific address.');
      setSearchStatus('idle');
    } catch {
      setSearchStatus('error');
      setSearchError('Could not reach location search. Check your connection and try again.');
    }
  };

  const handleQueryChange = (value: string) => {
    setAddressQuery(value);
    setSelectedAddress('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchAddress(value), 500);
  };

  const pickResult = (result: GeoResult) => {
    setValue('lat', Number(parseFloat(result.lat).toFixed(6)), { shouldValidate: true });
    setValue('lng', Number(parseFloat(result.lon).toFixed(6)), { shouldValidate: true });
    setSelectedAddress(result.display_name);
    setAddressQuery('');
    setResults([]);
  };

  const clearLocation = () => {
    setValue('lat', undefined as unknown as number);
    setValue('lng', undefined as unknown as number);
    setSelectedAddress('');
    setAddressQuery('');
    setResults([]);
    setManualOpen(false);
    setManual(emptyManual());
    setManualError('');
  };

  const findManualLocation = async () => {
    const parts = [manual.number, manual.street, manual.area, manual.pincode].filter(Boolean);
    if (parts.length < 2) {
      setManualError('Please fill in at least Street and Area.');
      return;
    }
    setManualStatus('searching');
    setManualError('');
    try {
      const data = await geocode(parts.join(', '));
      if (data.length === 0) {
        setManualStatus('error');
        setManualError("Couldn't find this address. Check the details and try again.");
        return;
      }
      const first = data[0];
      setValue('lat', Number(parseFloat(first.lat).toFixed(6)), { shouldValidate: true });
      setValue('lng', Number(parseFloat(first.lon).toFixed(6)), { shouldValidate: true });
      const label = [manual.number, manual.street, manual.area, manual.pincode].filter(Boolean).join(', ');
      setSelectedAddress(label);
      setManualOpen(false);
      setManualStatus('idle');
    } catch {
      setManualStatus('error');
      setManualError('Could not reach location search. Check your connection and try again.');
    }
  };

  const coordError = errors.lat?.message ?? errors.lng?.message;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add branch"
      description="Enter the branch name, search for its address, and set its weekly hours."
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
          <div className="flex flex-col gap-2 rounded-md border border-slate-200 p-3">
            {hasCoords && selectedAddress ? (
              <div className="flex items-start gap-2 rounded-md bg-slate-50 px-3 py-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <span className="flex-1 text-sm text-slate-700">{selectedAddress}</span>
                <button
                  type="button"
                  onClick={clearLocation}
                  className="ml-1 shrink-0 text-slate-400 hover:text-slate-600"
                  aria-label="Clear location"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <div className="flex gap-2">
                    <Input
                      id="b-address"
                      placeholder="Search by address, landmark, or area…"
                      value={addressQuery}
                      onChange={(e) => handleQueryChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); searchAddress(addressQuery); }
                      }}
                      invalid={Boolean(coordError)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => searchAddress(addressQuery)}
                      disabled={searchStatus === 'searching'}
                    >
                      {searchStatus === 'searching' ? <Spinner className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                    </Button>
                  </div>

                  {results.length > 0 && (
                    <ul className="absolute z-10 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-md">
                      {results.map((r) => (
                        <li key={r.place_id}>
                          <button
                            type="button"
                            onClick={() => pickResult(r)}
                            className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
                          >
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                            <span className="text-slate-700">{r.display_name}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {(searchStatus === 'error' || (searchStatus === 'idle' && searchError && results.length === 0)) && (
                  <p className="text-xs text-amber-600">{searchError}</p>
                )}

                <div className="border-t border-slate-100 pt-2">
                  <button
                    type="button"
                    onClick={() => { setManualOpen((v) => !v); setManualError(''); }}
                    className="text-xs font-medium text-brand-600 hover:text-brand-700"
                  >
                    {manualOpen ? 'Hide manual entry' : "Can't find it? Enter address manually"}
                  </button>

                  {manualOpen && (
                    <div className="mt-3 flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-2">
                        <FormField label="Building / Unit No." htmlFor="m-number">
                          <Input
                            id="m-number"
                            placeholder="e.g. 42B"
                            value={manual.number}
                            onChange={(e) => setManual((v) => ({ ...v, number: e.target.value }))}
                          />
                        </FormField>
                        <FormField label="Pincode" htmlFor="m-pincode">
                          <Input
                            id="m-pincode"
                            placeholder="e.g. 560001"
                            value={manual.pincode}
                            onChange={(e) => setManual((v) => ({ ...v, pincode: e.target.value }))}
                          />
                        </FormField>
                      </div>
                      <FormField label="Street" htmlFor="m-street">
                        <Input
                          id="m-street"
                          placeholder="e.g. MG Road"
                          value={manual.street}
                          onChange={(e) => setManual((v) => ({ ...v, street: e.target.value }))}
                        />
                      </FormField>
                      <FormField label="Area / Locality" htmlFor="m-area">
                        <Input
                          id="m-area"
                          placeholder="e.g. Koramangala, Bengaluru"
                          value={manual.area}
                          onChange={(e) => setManual((v) => ({ ...v, area: e.target.value }))}
                        />
                      </FormField>

                      {manualError && <p className="text-xs text-amber-600">{manualError}</p>}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="self-start"
                        onClick={findManualLocation}
                        disabled={manualStatus === 'searching'}
                      >
                        {manualStatus === 'searching' ? <Spinner className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                        Find location
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
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
