import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, FileUp, Upload } from 'lucide-react';
import { Dialog } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Select } from '../../components/ui/select';
import { Spinner } from '../../components/ui/spinner';
import { FormField } from '../../components/FormField';
import { useToast } from '../../components/ui/toast';
import * as restaurantApi from '../../services/restaurantApi';
import * as branchApi from '../../services/branchApi';
import * as bulkUploadApi from '../../services/bulkUploadApi';
import type { BulkUploadResult } from '../../services/bulkUploadApi';
import { QUERY_KEYS } from '../../utils/constants';
import { formatNumber } from '../../utils/format';
import { getErrorMessage } from '../../utils/apiError';

export interface BulkImportDialogProps {
  brandId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BulkImportDialog({ brandId, open, onOpenChange }: BulkImportDialogProps) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [branchId, setBranchId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<BulkUploadResult | null>(null);

  // Silently resolve the restaurant that belongs to this brand
  const { data: restaurants = [] } = useQuery({
    queryKey: QUERY_KEYS.restaurants(brandId),
    queryFn: () => restaurantApi.listByBrand(brandId),
    enabled: open,
  });
  const firstRestaurantId = restaurants[0]?.id;

  const { data: branches = [], isLoading: loadingBranches } = useQuery({
    queryKey: QUERY_KEYS.branches(firstRestaurantId ?? ''),
    queryFn: () => branchApi.listByRestaurant(firstRestaurantId as string),
    enabled: Boolean(firstRestaurantId) && open,
  });

  useEffect(() => {
    if (open) {
      setBranchId('');
      setFile(null);
      setResult(null);
    }
  }, [open]);

  const mutation = useMutation({
    mutationFn: () => {
      const branch = branches.find((b) => b.id === branchId);
      return bulkUploadApi.upload({
        restaurantId: branchId,
        restaurantName: branch?.name ?? 'Branch',
        file: file as File,
      });
    },
    onSuccess: (res) => {
      setResult(res);
      queryClient.invalidateQueries({ queryKey: ['bulk-menu-items'] });
      toast.success(`Imported ${res.importedRows} item(s).`);
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Upload failed.')),
  });

  const canSubmit = Boolean(branchId) && Boolean(file) && !mutation.isPending;

  const noBranches = !loadingBranches && branches.length === 0;
  const placeholderText = loadingBranches
    ? 'Loading branches…'
    : noBranches
    ? 'No branches found — add one first'
    : 'Select a branch';

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Bulk import menu"
      description="Upload a CSV or Excel file to import many menu items at once."
      className="max-w-xl"
      footer={
        <>
          <Button variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>
            {result ? 'Close' : 'Cancel'}
          </Button>
          {!result ? (
            <Button onClick={() => mutation.mutate()} disabled={!canSubmit}>
              {mutation.isPending ? <Spinner className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
              Import
            </Button>
          ) : null}
        </>
      }
    >
      {result ? (
        <ImportResult result={result} />
      ) : (
        <div className="flex flex-col gap-4">
          <FormField
            label="Branch"
            htmlFor="bulk-branch"
            required
            hint="Items will be tagged to this branch"
          >
            <Select
              id="bulk-branch"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              disabled={noBranches || loadingBranches}
            >
              <option value="" disabled>
                {placeholderText}
              </option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="File" required hint="CSV or Excel (.csv, .xlsx) · max 5 MB">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-brand-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-700"
            />
          </FormField>

          {file ? (
            <p className="inline-flex items-center gap-2 text-sm text-slate-600">
              <FileUp className="h-4 w-4 text-brand-600" />
              {file.name}
            </p>
          ) : null}
        </div>
      )}
    </Dialog>
  );
}

function ImportResult({ result }: { result: BulkUploadResult }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="inline-flex items-center gap-2 text-sm font-medium text-green-700">
        <CheckCircle2 className="h-5 w-5" />
        Import finished
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Total" value={result.totalRows} />
        <Stat label="Imported" value={result.importedRows} tone="success" />
        <Stat label="Skipped" value={result.skippedRows} />
        <Stat label="Failed" value={result.invalidRows + result.failedRecordCount} tone="danger" />
      </div>

      {result.errors.length > 0 ? (
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-slate-700">Row errors</p>
          <div className="max-h-48 overflow-y-auto rounded-md border border-slate-200 text-sm">
            {result.errors.map((e, i) => (
              <div
                key={`${e.row}-${i}`}
                className="flex gap-3 border-b border-slate-100 px-3 py-1.5 last:border-0"
              >
                <span className="shrink-0 font-mono text-xs text-slate-400">row {e.row}</span>
                <span className="text-slate-700">{e.error}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'success' | 'danger' }) {
  const color =
    tone === 'success' ? 'text-green-700' : tone === 'danger' ? 'text-red-700' : 'text-slate-900';
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-0.5 font-display text-xl font-semibold ${color}`}>{formatNumber(value)}</p>
    </div>
  );
}
