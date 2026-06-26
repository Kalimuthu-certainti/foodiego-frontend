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

export interface UpdateBranchInput {
  name?: string;
  lat?: number;
  lng?: number;
  workingHours?: WorkingHours;
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

// ── Orders ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type OrderPaymentStatus = 'pending' | 'paid' | 'failed';

export interface OrderItem {
  name: string;
  qty: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: string;
  brand_id: string;
  branch_id: string | null;
  branch_name: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  items: OrderItem[];
  total_amount: number;
  platform_fee: number;
  delivery_fee: number;
  net_amount: number;
  payment_method: string | null;
  payment_status: OrderPaymentStatus;
  status: OrderStatus;
  cancel_reason: string | null;
  cancelled_by: string | null;
  placed_at: string;
  confirmed_at: string | null;
  preparing_at: string | null;
  out_for_delivery_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderSummary {
  placed_count: number;
  confirmed_count: number;
  preparing_count: number;
  out_for_delivery_count: number;
  delivered_count: number;
  cancelled_count: number;
}

export interface OrderFilters {
  branch_id?: string;
  status?: OrderStatus | '';
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export type ReviewStatus = 'approved' | 'hidden' | 'flagged';

export interface Review {
  id: string;
  order_id: string | null;
  branch_id: string | null;
  branch_name: string | null;
  brand_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  rating: number;
  review_text: string | null;
  status: ReviewStatus;
  owner_reply: string | null;
  replied_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewSummary {
  total_reviews: number;
  avg_rating: number;
  rating_breakdown: {
    '5_star': number;
    '4_star': number;
    '3_star': number;
    '2_star': number;
    '1_star': number;
  };
}

export interface ReviewFilters {
  branch_id?: string;
  rating?: number | '';
  status?: ReviewStatus | '';
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
}
