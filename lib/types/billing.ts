// lib/types/billing.ts
// Barcha tiplar app/modules/billing/schemas.py ga to'liq mos keladi

// ─── Enums ────────────────────────────────────────────────────────────────────

export type PlanInterval =
  | "daily"
  | "monthly"
  | "yearly"
  | "lifetime";

export type SubscriptionStatus =
  | "active"
  | "trial"
  | "expired"
  | "cancelled"
  | "paused";

export type SubscriptionRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"; // backend models.py ga qo'shildi

export type PaymentStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded"
  | "cancelled";

export type PaymentProvider = "click" | "payme" | "uzum" | "stripe" | "manual";

export type DiscountType = "percent" | "fixed";

// ─── Plan ─────────────────────────────────────────────────────────────────────

export type Plan = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  interval: PlanInterval;
  interval_count: number;
  trial_days: number;
  features: Record<string, string | number | boolean> | null;
  is_active: boolean;
  is_featured: boolean;
  // backend PlanOut da computed_field sifatida is_popular ham qaytariladi
  // is_featured === is_popular, lekin frontend ikkalasini ham ishlatishi mumkin
  is_popular: boolean;
  sort_order: number;
  created_at: string;
};

// ─── Subscription ─────────────────────────────────────────────────────────────

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

// ─── Subscribe / Cancel ───────────────────────────────────────────────────────

export interface SubscribeRequest {
  plan_slug: string;
  auto_renew?: boolean; // default: true
  provider?: PaymentProvider; // default: "manual"
  promo_code?: string | null;
}

export interface CancelRequest {
  reason?: string | null; // max_length: 500
}

// ─── Promo codes ──────────────────────────────────────────────────────────────

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
  description?: string | null;
  discount_type: DiscountType;
  discount_value: number;
  plan_id?: string | null;
  max_uses?: number | null;
  one_per_user?: boolean;
  valid_from?: string | null;
  valid_until?: string | null;
  is_active?: boolean;
}

export interface PromoCodeUpdate {
  description?: string | null;
  discount_value?: number;
  max_uses?: number | null;
  one_per_user?: boolean;
  valid_until?: string | null;
  is_active?: boolean;
  // discount_type va plan_id update da yo'q (backend sxemasiga mos)
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
  discount_percent: number | null;
  original_price: number;
  discount_amount: number;
  final_price: number;
  message: string | null;
}

// ─── Subscription Requests (screenshot flow) ──────────────────────────────────

export interface SubscriptionRequestCreate {
  plan_slug: string;
  screenshot: string; // base64 PNG/JPG/WEBP/PDF (max 10MB), bo'sh string ham qabul qilinadi
  note?: string | null;
  promo_code?: string | null;
  // filename va content_type olib tashlandi — backend SubscriptionRequestCreate da yo'q
}

export interface SubscriptionRequestReview {
  action: "approve" | "reject";
  rejection_reason?: string | null;
}

export interface SubscriptionRequest {
  id: string;
  user_id: string;
  plan_id: string;
  plan: Plan;
  screenshot_url: string; // FIX: filename → screenshot_url (backend SubscriptionRequestOut ga mos)
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

export interface PaginatedSubscriptionRequests {
  items: SubscriptionRequest[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// ─── Payments ─────────────────────────────────────────────────────────────────

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

// ─── Admin / misc ─────────────────────────────────────────────────────────────

export interface SubscriptionUpdate {
  status?: SubscriptionStatus;
  auto_renew?: boolean;
  end_date?: string | null;
  cancel_reason?: string | null;
}

export interface ManualPaymentCreate {
  user_id: string;
  plan_slug: string;
  amount: number;
  currency?: string; // default: "UZS"
  description?: string | null;
  provider?: PaymentProvider; // default: "manual"
}

export interface PaginatedPromoCodes {
  items: PromoCode[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface QuoteRequest {
  plan_slug: string;
  usage?: number; // default: 1
}

export interface QuoteOut {
  estimated_price: number;
  currency: string;
  details: string | null;
}