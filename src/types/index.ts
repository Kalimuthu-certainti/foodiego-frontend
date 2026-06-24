// FoodieGo — shared TypeScript types. Mirrors backend snake_case JSON responses.

export type Role =
  | 'BRAND_OWNER'
  | 'ADMIN'
  | 'RESTAURANT_MANAGER'
  | 'RESTAURANT_OPERATOR'
  | 'RESTAURANT_SUPPORT_STAFF';

export type BrandStatus = 'pending' | 'approved' | 'rejected';
export type MappingStatus = 'invited' | 'active' | 'removed';
export type ChangeRequestStatus = 'pending' | 'approved' | 'rejected';
export type PayoutStatus = 'pending' | 'paid';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface Brand {
  id: string;
  owner_id: string;
  name: string;
  status: BrandStatus;
  is_active: boolean;
  menu_locked: boolean;
  reject_reason: string | null;
  created_at: string;
}

export interface Restaurant {
  id: string;
  brand_id: string;
  name: string;
  gst_no: string;
  email: string;
  phone: string;
  created_at: string;
}

/** working_hours JSONB shape: per-day list of open/close windows; empty array = closed. */
export interface WorkingHoursSlot {
  open: string;
  close: string;
}

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type WorkingHours = Partial<Record<DayKey, WorkingHoursSlot[]>>;

export interface Branch {
  id: string;
  restaurant_id: string;
  name: string;
  lat: number;
  lng: number;
  working_hours: WorkingHours;
  is_open: boolean;
}

export interface Mapping {
  id: string;
  user_id: string;
  /** Display name of the staff member (resolved server-side from the user record). */
  user_name: string | null;
  phone: string | null;
  role: Role;
  brand_id: string | null;
  restaurant_id: string | null;
  branch_id: string | null;
  status: MappingStatus;
  created_at: string;
}

export type MenuItem = Record<string, unknown>;

export interface MenuChangeRequest {
  id: string;
  brand_id: string;
  items: MenuItem[];
  status: ChangeRequestStatus;
  reason: string | null;
  created_at: string;
}

export interface Payout {
  id: string;
  brand_id: string;
  period: string;
  gross: number;
  fee: number;
  net: number;
  status: PayoutStatus;
}

export interface ReportRow {
  brand_id: string;
  day: string;
  orders: number;
  revenue: number;
}

// ── Request payloads (camelCase, as the backend accepts) ──

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateBrandInput {
  name: string;
}

export interface UpdateBrandInput {
  name?: string;
}

export interface CreateRestaurantInput {
  brandId: string;
  name: string;
  gstNo?: string;
  email?: string;
  phone: string;
}

export interface CreateBranchInput {
  restaurantId: string;
  name: string;
  lat: number;
  lng: number;
  workingHours: WorkingHours;
}

export interface InviteStaffInput {
  name: string;
  role: Role;
  brandId: string;
  restaurantId?: string;
  branchId?: string;
  phone: string;
}

export interface MenuSubmissionInput {
  items: MenuItem[];
}

export interface CreateMenuChangeRequestInput {
  brandId: string;
  items: MenuItem[];
  reason?: string;
}

export interface ReportQuery {
  from?: string;
  to?: string;
}
