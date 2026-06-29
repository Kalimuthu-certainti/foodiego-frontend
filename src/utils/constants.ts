// Shared constants: roles, statuses, day labels. Mirrors the backend contract.

import type {
  Role,
  BrandStatus,
  MappingStatus,
  ChangeRequestStatus,
  PayoutStatus,
  DayKey,
  OrderStatus,
  OrderPaymentStatus,
  ReviewStatus,
} from '../types';

// ─── Roles ──────────────────────────────────────────────────────────────────

export const ROLES = {
  BRAND_OWNER: 'BRAND_OWNER',
  ADMIN: 'ADMIN',
  RESTAURANT_MANAGER: 'RESTAURANT_MANAGER',
  RESTAURANT_OPERATOR: 'RESTAURANT_OPERATOR',
  RESTAURANT_SUPPORT_STAFF: 'RESTAURANT_SUPPORT_STAFF',
} as const satisfies Record<Role, Role>;

/** Roles that can be assigned when inviting staff to a brand. */
export const STAFF_ROLES = [
  ROLES.RESTAURANT_MANAGER,
  ROLES.RESTAURANT_OPERATOR,
  ROLES.RESTAURANT_SUPPORT_STAFF,
] as const satisfies readonly Role[];

export const ROLE_LABELS: Record<Role, string> = {
  BRAND_OWNER: 'Brand Owner',
  ADMIN: 'Admin',
  RESTAURANT_MANAGER: 'Restaurant Manager',
  RESTAURANT_OPERATOR: 'Restaurant Operator',
  RESTAURANT_SUPPORT_STAFF: 'Support Staff',
};

// ─── Statuses ────────────────────────────────────────────────────────────────

export const BRAND_STATUS: Record<BrandStatus, BrandStatus> = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
};

export const BRAND_STATUS_LABELS: Record<BrandStatus, string> = {
  pending: 'Pending',
  approved: 'Active',
  rejected: 'Rejected',
};

export const MAPPING_STATUS_LABELS: Record<MappingStatus, string> = {
  invited: 'Invited',
  active: 'Active',
  removed: 'Removed',
};

export const CHANGE_REQUEST_STATUS_LABELS: Record<ChangeRequestStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
};

// ─── Day labels (working hours) ──────────────────────────────────────────────

export const DAY_KEYS: readonly DayKey[] = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
] as const;

export const DAY_LABELS: Record<DayKey, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

// ─── Order statuses ──────────────────────────────────────────────────────────

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  placed: 'Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const ORDER_PAYMENT_STATUS_LABELS: Record<OrderPaymentStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  failed: 'Failed',
};

/** Statuses that a brand owner is allowed to cancel. */
export const CANCELLABLE_STATUSES: OrderStatus[] = ['placed', 'confirmed'];

// ─── Review statuses ─────────────────────────────────────────────────────────

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  approved: 'Approved',
  hidden: 'Hidden',
  flagged: 'Flagged',
};

export const CANCEL_REASONS = [
  'Customer requested cancellation',
  'Item out of stock',
  'Branch closing early',
  'Incorrect order details',
  'Other',
] as const;

// ─── App ─────────────────────────────────────────────────────────────────────

export const APP_NAME = 'FoodieGo';

/** Message shown to the user when the backend returns a scope 403. */
export const SCOPE_DENIED_MESSAGE = 'You can only manage your own brand.';

// ─── React Query keys ──────────────────────────────────────────────────────

export const QUERY_KEYS = {
  brands: ['brands'] as const,
  brand: (id: string) => ['brands', id] as const,
  restaurants: (brandId: string) => ['restaurants', brandId] as const,
  branches: (restaurantId: string) => ['branches', restaurantId] as const,
  staff: (brandId: string) => ['restaurant-users', brandId] as const,
  menuChangeRequests: (brandId: string) => ['menu-change-requests', brandId] as const,
  reports: (brandId: string, from?: string, to?: string) =>
    ['reports', brandId, from ?? null, to ?? null] as const,
  payouts: (brandId: string) => ['payouts', brandId] as const,
  bulkMenuItems: (restaurantId?: string, status?: string) => ['bulk-menu-items', restaurantId ?? 'all', status ?? ''] as const,
  orders: (brandId: string, filters: Record<string, unknown> = {}) =>
    ['orders', brandId, filters] as const,
  order: (id: string) => ['orders', 'detail', id] as const,
  orderSummary: (brandId: string) => ['orders', 'summary', brandId] as const,
  reviews: (brandId: string, filters: Record<string, unknown> = {}) =>
    ['reviews', brandId, filters] as const,
  reviewSummary: (brandId: string) => ['reviews', 'summary', brandId] as const,
};
