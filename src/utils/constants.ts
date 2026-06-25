// Shared constants: roles, statuses, day labels. Mirrors the backend contract.

import type {
  Role,
  BrandStatus,
  MappingStatus,
  ChangeRequestStatus,
  PayoutStatus,
  DayKey,
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
  bulkMenuItems: (restaurantId?: string) => ['bulk-menu-items', restaurantId ?? 'all'] as const,
};
