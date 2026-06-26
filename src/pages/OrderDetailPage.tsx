import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  CheckCircle2,
  Circle,
  MapPin,
  Phone,
  User,
  CreditCard,
} from 'lucide-react';
import { Badge, type BadgeVariant } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Spinner } from '../components/ui/spinner';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../components/ui/toast';
import { CancelOrderDialog } from '../features/orders/CancelOrderDialog';
import * as ordersApi from '../services/ordersApi';
import {
  CANCELLABLE_STATUSES,
  ORDER_PAYMENT_STATUS_LABELS,
  ORDER_STATUS_LABELS,
  QUERY_KEYS,
} from '../utils/constants';
import {
  formatCurrency,
  formatDateTime,
  formatRelativeTime,
} from '../utils/format';
import type { Order, OrderItem, OrderPaymentStatus, OrderStatus } from '../types';

// ── Status badge map ──────────────────────────────────────────────────────────

const STATUS_BADGE: Record<OrderStatus, BadgeVariant> = {
  placed: 'warning',
  confirmed: 'info',
  preparing: 'orange',
  out_for_delivery: 'purple',
  delivered: 'success',
  cancelled: 'danger',
};

const PAYMENT_BADGE: Record<OrderPaymentStatus, BadgeVariant> = {
  paid: 'success',
  pending: 'warning',
  failed: 'danger',
};

// ── Status timeline ───────────────────────────────────────────────────────────

const TIMELINE_STEPS: { key: keyof Order; label: string }[] = [
  { key: 'placed_at',            label: 'Placed'          },
  { key: 'confirmed_at',         label: 'Confirmed'       },
  { key: 'preparing_at',         label: 'Preparing'       },
  { key: 'out_for_delivery_at',  label: 'Out for Delivery'},
  { key: 'delivered_at',         label: 'Delivered'       },
];

const STATUS_ORDER: OrderStatus[] = [
  'placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered',
];

function StatusTimeline({ order }: { order: Order }) {
  const currentIdx = order.status === 'cancelled'
    ? -1
    : STATUS_ORDER.indexOf(order.status);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="mb-4 text-sm font-semibold text-slate-700">Order Progress</p>

      {order.status === 'cancelled' ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="danger" className="text-sm px-3 py-1">Cancelled</Badge>
            {order.cancelled_at && (
              <span className="text-xs text-slate-500">{formatDateTime(order.cancelled_at)}</span>
            )}
          </div>
          {order.cancel_reason && (
            <p className="text-sm text-slate-600">
              <span className="font-medium">Reason:</span> {order.cancel_reason}
            </p>
          )}
          {order.cancelled_by && (
            <p className="text-xs text-slate-400">Cancelled by {order.cancelled_by.replace('_', ' ')}</p>
          )}
        </div>
      ) : (
        <ol className="flex items-start gap-0">
          {TIMELINE_STEPS.map((step, idx) => {
            const ts = order[step.key] as string | null;
            const done = idx <= currentIdx;
            const current = idx === currentIdx;

            return (
              <li key={step.key} className="flex flex-1 flex-col items-center">
                {/* Connector line + dot row */}
                <div className="flex w-full items-center">
                  {/* Left connector */}
                  <div
                    className={`h-0.5 flex-1 transition-colors ${
                      idx === 0 ? 'invisible' : done ? 'bg-green-400' : 'bg-slate-200'
                    }`}
                  />
                  {/* Dot */}
                  <div className="relative shrink-0">
                    {done ? (
                      <CheckCircle2
                        className={`h-6 w-6 ${current ? 'text-brand-600' : 'text-green-500'}`}
                      />
                    ) : (
                      <Circle className="h-6 w-6 text-slate-300" />
                    )}
                    {current && (
                      <span className="absolute inset-0 animate-ping rounded-full bg-brand-400 opacity-30" />
                    )}
                  </div>
                  {/* Right connector */}
                  <div
                    className={`h-0.5 flex-1 transition-colors ${
                      idx === TIMELINE_STEPS.length - 1 ? 'invisible' : done && idx < currentIdx ? 'bg-green-400' : 'bg-slate-200'
                    }`}
                  />
                </div>

                {/* Label + timestamp */}
                <p
                  className={`mt-2 text-center text-[11px] font-semibold ${
                    done ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </p>
                {ts && (
                  <p className="mt-0.5 text-center text-[10px] text-slate-400">
                    {formatDateTime(ts)}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

// ── Items section ─────────────────────────────────────────────────────────────

function ItemsSection({ order }: { order: Order }) {
  const subtotal = order.items.reduce((s, i) => s + (i as OrderItem).subtotal, 0);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="mb-4 text-sm font-semibold text-slate-700">Items Ordered</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
            <th className="pb-2">Item</th>
            <th className="pb-2 text-center">Qty</th>
            <th className="pb-2 text-right">Unit Price</th>
            <th className="pb-2 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {(order.items as OrderItem[]).map((item, idx) => (
            <tr key={idx} className="border-b border-slate-50 last:border-0">
              <td className="py-2.5 font-medium text-slate-900">{item.name}</td>
              <td className="py-2.5 text-center text-slate-600">{item.qty}</td>
              <td className="py-2.5 text-right tabular-nums text-slate-600">
                {formatCurrency(item.unit_price)}
              </td>
              <td className="py-2.5 text-right tabular-nums text-slate-900">
                {formatCurrency(item.subtotal)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-slate-100">
            <td colSpan={3} className="pt-3 text-right text-xs text-slate-500">Subtotal</td>
            <td className="pt-3 text-right tabular-nums text-slate-700">{formatCurrency(subtotal)}</td>
          </tr>
          {order.delivery_fee > 0 && (
            <tr>
              <td colSpan={3} className="text-right text-xs text-slate-500">Delivery fee</td>
              <td className="text-right tabular-nums text-slate-700">{formatCurrency(order.delivery_fee)}</td>
            </tr>
          )}
          {order.platform_fee > 0 && (
            <tr>
              <td colSpan={3} className="text-right text-xs text-slate-500">Platform fee</td>
              <td className="text-right tabular-nums text-slate-700">{formatCurrency(order.platform_fee)}</td>
            </tr>
          )}
          <tr className="border-t border-slate-200">
            <td colSpan={3} className="pt-2 text-right text-sm font-semibold text-slate-900">Total</td>
            <td className="pt-2 text-right text-base font-bold tabular-nums text-slate-900">
              {formatCurrency(order.total_amount)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ── Customer section ──────────────────────────────────────────────────────────

function CustomerSection({ order }: { order: Order }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="mb-4 text-sm font-semibold text-slate-700">Customer Information</p>
      <div className="flex flex-col gap-3 text-sm">
        {order.customer_name && (
          <div className="flex items-center gap-2 text-slate-700">
            <User className="h-4 w-4 shrink-0 text-slate-400" />
            <span>{order.customer_name}</span>
          </div>
        )}
        {order.customer_phone && (
          <div className="flex items-center gap-2 text-slate-700">
            <Phone className="h-4 w-4 shrink-0 text-slate-400" />
            <span>{order.customer_phone}</span>
          </div>
        )}
        {order.customer_address && (
          <div className="flex items-start gap-2 text-slate-700">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <span>{order.customer_address}</span>
          </div>
        )}
        {!order.customer_name && !order.customer_phone && !order.customer_address && (
          <p className="text-slate-400">No customer information recorded.</p>
        )}
      </div>
    </div>
  );
}

// ── Payment section ───────────────────────────────────────────────────────────

function PaymentSection({ order }: { order: Order }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="mb-4 text-sm font-semibold text-slate-700">Payment Information</p>
      <div className="flex flex-col gap-3 text-sm">
        {order.payment_method && (
          <div className="flex items-center gap-2 text-slate-700">
            <CreditCard className="h-4 w-4 shrink-0 text-slate-400" />
            <span>{order.payment_method}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Status</span>
          <Badge variant={PAYMENT_BADGE[order.payment_status]}>
            {ORDER_PAYMENT_STATUS_LABELS[order.payment_status]}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Amount</span>
          <span className="font-semibold tabular-nums text-slate-900">
            {formatCurrency(order.total_amount)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [cancelOpen, setCancelOpen] = useState(false);

  const { data: order, isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.order(orderId ?? ''),
    queryFn: () => ordersApi.get(orderId as string),
    enabled: Boolean(orderId),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <EmptyState
        title="Order not found"
        description="This order may have been removed or you don't have access to it."
      />
    );
  }

  const canCancel = CANCELLABLE_STATUSES.includes(order.status);

  return (
    <div className="flex flex-col gap-5">
      {/* Back button */}
      <button
        onClick={() => navigate('/orders')}
        className="flex w-fit items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Orders
      </button>

      {/* Order info card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Order
            </p>
            <h1 className="mt-0.5 font-mono text-2xl font-bold tracking-tight text-slate-900">
              {order.order_number}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant={STATUS_BADGE[order.status]}>
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
              <span className="text-sm text-slate-500">
                {formatRelativeTime(order.placed_at)}
              </span>
            </div>
            {order.branch_name && (
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-600">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {order.branch_name}
              </p>
            )}
          </div>
          {canCancel && (
            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              onClick={() => setCancelOpen(true)}
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* Timeline */}
      <StatusTimeline order={order} />

      {/* Items */}
      <ItemsSection order={order} />

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Customer */}
        <CustomerSection order={order} />
        {/* Payment */}
        <PaymentSection order={order} />
      </div>

      {/* Cancel dialog */}
      <CancelOrderDialog
        orderId={order.id}
        orderNumber={order.order_number}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onCancelled={(updated) => {
          queryClient.setQueryData(QUERY_KEYS.order(order.id), updated);
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          setCancelOpen(false);
          toast.success('Order cancelled successfully.');
        }}
      />
    </div>
  );
}
