// ─── Auth ──────────────────────────────────────────────────────
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
}

export interface AdminUser {
  id: string;
  public_id: string;
  full_name: string;
  username: string;
  email: string;
  phone: string | null;
  phone_verified: boolean;
  avatar: string | null;
  is_verified: boolean;
  is_active: boolean;
  status: "active" | "pending" | "blocked";
  roles: string[];
  meta: Record<string, unknown>;
  has_password: boolean;
  has_active_subscription: boolean;
  subscription_tier: string; // "FREE" | "PRO" | "PREMIUM" | "GRANDFATHERED"
  created_at: string;
  updated_at: string;
}

// ─── Billing ───────────────────────────────────────────────────
export type PlanInterval =
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "lifetime";

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
  features: Record<string, string | number | boolean> | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
}

export interface PlanCreatePayload {
  name: string;
  slug: string;
  description?: string;
  price: number;
  currency?: string;
  interval?: PlanInterval;
  interval_count?: number;
  trial_days?: number;
  features?: Record<string, string | number | boolean>;
  is_active?: boolean;
  is_featured?: boolean;
  sort_order?: number;
}

export interface PlanUpdatePayload {
  name?: string;
  description?: string;
  price?: number;
  features?: Record<string, string | number | boolean>;
  is_active?: boolean;
  is_featured?: boolean;
  sort_order?: number;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan: Plan;
  status: "trial" | "active" | "expired" | "cancelled" | "paused";
  start_date: string;
  end_date: string | null;
  trial_end_date: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  auto_renew: boolean;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  subscription_id: string | null;
  plan_id: string | null;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded" | "cancelled";
  provider: "click" | "payme" | "uzum" | "stripe" | "manual";
  provider_payment_id: string | null;
  description: string | null;
  promo_code_id: string | null;
  discount_amount: number;
  original_amount: number | null;
  paid_at: string | null;
  refunded_at: string | null;
  created_at: string;
}

export interface ManualPaymentPayload {
  user_id: string;
  plan_slug: string;
  amount: number;
  currency?: string;
  description?: string;
  provider?: "click" | "payme" | "uzum" | "stripe" | "manual";
}

export interface SubscriptionRequest {
  id: string;
  user_id: string;
  user?: Pick<AdminUser, "full_name" | "email" | "phone">;
  plan_id: string;
  plan: Plan;
  screenshot_url: string;
  note: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
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

export interface ReviewPayload {
  action: "approve" | "reject";
  rejection_reason?: string;
}

// ─── Pagination ────────────────────────────────────────────────
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// ─── Dashboard ─────────────────────────────────────────────────
export interface DashboardStats {
  totalUsers: number;
  activeSubscriptions: number;
  pendingRequests: number;
  totalRevenue: number;
  recentPayments: Payment[];
  recentRequests: SubscriptionRequest[];
}

// ─── User Dashboard ─────────────────────────────────────────
export interface UserDashboard {
  user: {
    id: string;
    full_name: string;
    email: string;
    status: string;
    subscription_tier: string;
  };
  tests: {
    total: number;
    completed: number;
    pass_rate: number;
  };
  exams: {
    registrations: number;
  };
  subscriptions: {
    active: number;
    total_spent: number;
  };
  recent_activity: Array<{
    type: string;
    test_id: string;
    status: string;
    score: number;
    created_at: string;
  }>;
}

// ─── Admin Summary ─────────────────────────────────────────
export interface AdminSummary {
  users: {
    total: number;
    active: number;
    blocked: number; // was "inactive" — matches UserStatus.BLOCKED from models.py
  };
  subscriptions: {
    active: number;
    expired: number;
    revenue_total: number;
    revenue_monthly: number;
  };
  tests: {
    total: number;
    completed: number;
    completion_rate: number;
  };
  exams: {
    total: number;
    registrations: number;
  };
  promo_codes: {
    active: number;
  };
  notifications: {
    total: number;
    unread: number;
  };
}
