// lib/types/billing.ts
export type PlanInterval = "monthly" | "yearly" | "lifetime";
export type SubscriptionStatus =
  | "trial"
  | "active"
  | "expired"
  | "cancelled"
  | "paused";
export type PaymentStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded"
  | "cancelled";
export type PaymentProvider = "click" | "payme" | "uzum" | "stripe" | "manual";
export type SubscriptionRequestStatus = "pending" | "approved" | "rejected";
export type DiscountType = "fixed" | "percent";

// ─── Plan ──────────────────────────────────────────────────────────────────
export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  interval: PlanInterval;
  interval_count: number;
  trial_days: number;
  features: Record<string, unknown> | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
}

// ─── Subscription ──────────────────────────────────────────────────────────
export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan: Plan;
  status: SubscriptionStatus;
  start_date: string;
  end_date: string | null;
  trial_end_date: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  auto_renew: boolean;
  created_at: string;
}

export interface SubscribeRequest {
  plan_slug: string;
  auto_renew?: boolean;
  provider?: PaymentProvider;
  promo_code?: string;
}

export interface CancelRequest {
  reason?: string;
}

// ─── Subscription Request (manual screenshot flow) ─────────────────────────
export interface SubscriptionRequest {
  id: string;
  user_id: string;
  plan_id: string;
  plan: Plan;
  screenshot_url: string;
  note: string | null;
  status: SubscriptionRequestStatus;
  promo_code_id: string | null;
  discount_amount: number;
  original_amount: number | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionRequestCreate {
  plan_slug: string;
  screenshot_url: string;
  note?: string;
  promo_code?: string;
}

export interface SubscriptionRequestReview {
  action: "approve" | "reject";
  rejection_reason?: string;
}

export interface PaginatedSubscriptionRequests {
  items: SubscriptionRequest[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// ─── Payment ───────────────────────────────────────────────────────────────
export interface Payment {
  id: string;
  user_id: string;
  subscription_id: string | null;
  plan_id: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  provider_payment_id: string | null;
  description: string | null;
  promo_code_id: string | null;
  discount_amount: number;
  original_amount: number | null;
  paid_at: string | null;
  refunded_at: string | null;
  created_at: string;
}

export interface PaginatedPayments {
  items: Payment[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// ─── Promo Code ────────────────────────────────────────────────────────────
export interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number;
  plan_id: string | null;
  max_uses: number | null;
  uses_count: number;
  one_per_user: boolean;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

export interface PromoCodeCreate {
  code: string;
  description?: string;
  discount_type: DiscountType;
  discount_value: number;
  plan_id?: string;
  max_uses?: number;
  one_per_user?: boolean;
  valid_from?: string;
  valid_until?: string;
  is_active?: boolean;
}

export interface PromoCodeUpdate {
  description?: string;
  discount_value?: number;
  max_uses?: number;
  one_per_user?: boolean;
  valid_until?: string;
  is_active?: boolean;
}

export interface PromoCodeValidateRequest {
  code: string;
  plan_slug: string;
}

export interface PromoCodeValidateOut {
  valid: boolean;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  original_price: number;
  discount_amount: number;
  final_price: number;
  message: string | null;
}

export interface PaginatedPromoCodes {
  items: PromoCode[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
