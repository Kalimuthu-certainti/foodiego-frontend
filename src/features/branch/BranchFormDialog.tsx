import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, MapPin, Search, X } from 'lucide-react';
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
import { cn } from '../../utils/cn';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

async function nominatimSearch(query: string): Promise<NominatimResult[]> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
      { headers: { 'Accept-Language': 'en' } },
    );
    if (!res.ok) return [];
    return res.json() as Promise<NominatimResult[]>;
  } catch {
    return [];
  }
}

export interface BranchFormDialogProps {
  restaurantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

  // ── Address search ──────────────────────────────────────────────────────────
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const [locationError, setLocationError] = useState('');

  // ── Manual entry fallback ───────────────────────────────────────────────────
  const [manualOpen, setManualOpen] = useState(false);
  const [building, setBuilding] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [pincode, setPincode] = useState('');
  const [geocoding, setGeocoding] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const lat = watch('lat');
  const lng = watch('lng');
  const hasLocation = Number.isFinite(lat) && Number.isFinite(lng);

  // Reset all state when dialog opens
  useEffect(() => {
    if (open) {
      reset({ name: '', workingHours: emptyWorkingHours() });
      setQuery('');
      setResults([]);
      setShowDropdown(false);
      setSelectedLabel('');
      setLocationError('');
      setManualOpen(false);
      setBuilding('');
      setStreet('');
      setArea('');
      setPincode('');
    }
  }, [open, reset]);

  // Debounced search as user types
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      const data = await nominatimSearch(query);
      setResults(data);
      setShowDropdown(true);
      setIsSearching(false);
    }, 450);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  const pickResult = (r: NominatimResult) => {
    setValue('lat', Number(parseFloat(r.lat).toFixed(6)), { shouldValidate: true });
    setValue('lng', Number(parseFloat(r.lon).toFixed(6)), { shouldValidate: true });
    // Show only the first 3 parts of the display name for brevity
    setSelectedLabel(r.display_name.split(',').slice(0, 3).join(',').trim());
    setQuery('');
    setShowDropdown(false);
    setLocationError('');
    setManualOpen(false);
  };

  const clearLocation = () => {
    setValue('lat', undefined as unknown as number);
    setValue('lng', undefined as unknown as number);
    setSelectedLabel('');
    setLocationError('');
  };

  const geocodeManual = async () => {
    const parts = [building, street, area, pincode].filter(Boolean);
    if (parts.length === 0) {
      setLocationError('Fill in at least one address field before searching.');
      return;
    }
    setGeocoding(true);
    setLocationError('');
    const data = await nominatimSearch(parts.join(', '));
    setGeocoding(false);
    if (data.length === 0) {
      setLocationError("Couldn't find this address. Try adjusting the details and search again.");
      return;
    }
    pickResult(data[0]);
  };

  const mutation = useMutation({
    mutationFn: (values: BranchFormValues) => branchApi.create({ restaurantId, ...values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.branches(restaurantId) });
      toast.success('Branch added.');
      onOpenChange(false);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const coordError = errors.lat?.message ?? errors.lng?.message;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add branch"
      description="Search for the branch address and set its weekly opening hours."
      className="max-w-xl"
      footer={
        <>
          <Button variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button form="branch-form" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? <Spinner className="h-4 w-4" /> : null}
            Add branch
          </Button>
        </>
      }
    >
      <form
        id="branch-form"
        className="flex flex-col gap-5"
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        noValidate
      >
        <FormField label="Branch name" htmlFor="b-name" required error={errors.name?.message}>
          <Input id="b-name" autoFocus invalid={Boolean(errors.name)} placeholder="e.g. Koramangala" {...register('name')} />
        </FormField>

        {/* ── Location field ── */}
        <div className="flex flex-col gap-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Location <span className="ml-0.5 text-red-500">*</span>
          </label>

          {/* Selected location badge */}
          {hasLocation && selectedLabel ? (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
              <span className="min-w-0 flex-1 truncate text-sm text-slate-800">{selectedLabel}</span>
              <button
                type="button"
                onClick={clearLocation}
                className="rounded p-0.5 text-slate-400 hover:text-slate-600"
                aria-label="Clear location"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            /* Search input with dropdown */
            <div ref={dropdownRef} className="relative">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                {isSearching ? (
                  <Spinner className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                ) : null}
                <input
                  type="text"
                  placeholder="Search address, area, or landmark…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => results.length > 0 && setShowDropdown(true)}
                  className={cn(
                    'flex h-10 w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900',
                    'placeholder:text-slate-400 transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:border-brand-400',
                    'hover:border-slate-400',
                  )}
                />
              </div>

              {showDropdown && results.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-pop">
                  {results.map((r) => (
                    <li key={r.place_id}>
                      <button
                        type="button"
                        className="flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm hover:bg-slate-50"
                        onMouseDown={() => pickResult(r)}
                      >
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" />
                        <span className="text-slate-700">{r.display_name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {showDropdown && !isSearching && query.trim().length >= 3 && results.length === 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-pop">
                  <p className="text-sm text-slate-500">No results found. Try the manual entry below.</p>
                </div>
              )}
            </div>
          )}

          {/* Manual address fallback */}
          <button
            type="button"
            onClick={() => setManualOpen((v) => !v)}
            className="self-start text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            {manualOpen ? 'Hide manual entry' : "Can't find it? Enter address manually"}
          </button>

          {manualOpen && (
            <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField label="Building / Unit No" htmlFor="b-building">
                  <Input
                    id="b-building"
                    placeholder="e.g. 42B, 3rd Floor"
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                  />
                </FormField>
                <FormField label="Pincode" htmlFor="b-pincode">
                  <Input
                    id="b-pincode"
                    inputMode="numeric"
                    placeholder="e.g. 560034"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                  />
                </FormField>
              </div>
              <FormField label="Street" htmlFor="b-street">
                <Input
                  id="b-street"
                  placeholder="e.g. 100 Feet Road"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
              </FormField>
              <FormField label="Area / Locality" htmlFor="b-area">
                <Input
                  id="b-area"
                  placeholder="e.g. Koramangala, Bangalore"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                />
              </FormField>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={geocodeManual}
                disabled={geocoding}
                className="self-start"
              >
                {geocoding ? <Spinner className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                Find location
              </Button>
            </div>
          )}

          {locationError && (
            <p className="text-xs font-medium text-red-600" role="alert">{locationError}</p>
          )}
          {coordError && !locationError && (
            <p className="text-xs font-medium text-red-600" role="alert">Please select a location above.</p>
          )}
        </div>

        {/* ── Working hours ── */}
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
