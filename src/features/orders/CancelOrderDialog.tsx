import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { Dialog } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Select } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { FormField } from '../../components/FormField';
import { useToast } from '../../components/ui/toast';
import * as ordersApi from '../../services/ordersApi';
import { CANCEL_REASONS } from '../../utils/constants';
import { getErrorMessage } from '../../utils/apiError';
import type { Order } from '../../types';

export interface CancelOrderDialogProps {
  orderId: string;
  orderNumber: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelled: (updated: Order) => void;
}

export function CancelOrderDialog({
  orderId,
  orderNumber,
  open,
  onOpenChange,
  onCancelled,
}: CancelOrderDialogProps) {
  const toast = useToast();
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      ordersApi.cancel(orderId, reason === 'Other' ? customReason.trim() : reason),
    onSuccess: (updated) => {
      onCancelled(updated);
      setReason('');
      setCustomReason('');
    },
    onError: (err) => toast.error(getErrorMessage(err), 'Cancel failed'),
  });

  const finalReason = reason === 'Other' ? customReason.trim() : reason;
  const canSubmit = Boolean(finalReason) && !mutation.isPending;

  function handleClose(open: boolean) {
    if (!open) {
      setReason('');
      setCustomReason('');
    }
    onOpenChange(open);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
      title={`Cancel Order ${orderNumber}`}
      description="This action cannot be undone."
    >
      <div className="flex flex-col gap-4 px-6 pb-6 pt-4">
        <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-700 ring-1 ring-inset ring-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Once cancelled, the customer will be notified and the order cannot be
            reinstated.
          </span>
        </div>

        <FormField label="Reason for cancellation" required>
          <Select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            invalid={mutation.isError && !reason}
          >
            <option value="" disabled>
              Select a reason
            </option>
            {CANCEL_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </FormField>

        {reason === 'Other' && (
          <FormField label="Describe the reason" required>
            <Input
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="e.g. System maintenance, special circumstances…"
              maxLength={200}
            />
          </FormField>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={mutation.isPending}
          >
            Keep Order
          </Button>
          <Button
            variant="destructive"
            disabled={!canSubmit}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? 'Cancelling…' : 'Confirm Cancel'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
