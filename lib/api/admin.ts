// lib/api/admin.ts
//
// Admin API — uses the shared `api` axios instance (with auto token refresh)
// and the shared `tokenStore` from client.ts.
// Admin tokens are stored under separate keys to avoid collisions with the
// regular user session.
//
import { api, tokenStore } from "./client";
import type {
  AuthTokens,
  AdminUser,
  Plan,
  PlanCreatePayload,
  PlanUpdatePayload,
  Subscription,
  Payment,
  ManualPaymentPayload,
  SubscriptionRequest,
  ReviewPayload,
  Paginated,
  DashboardStats,
} from "@/lib/types/admin";
import type {
  PromoCode,
  PromoCodeCreate,
  PromoCodeUpdate,
} from "@/lib/types/billing";

// ══════════════════════════════════════════════════════════════════════
// ADMIN TOKEN STORAGE  (separate from user tokens)
// ══════════════════════════════════════════════════════════════════════

const ADMIN_ACCESS_KEY = "admin_access_token";
const ADMIN_REFRESH_KEY = "admin_refresh_token";

export const adminTokenStore = {
  getAccess(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ADMIN_ACCESS_KEY);
  },
  getRefresh(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ADMIN_REFRESH_KEY);
  },
  set(tokens: AuthTokens): void {
    localStorage.setItem(ADMIN_ACCESS_KEY, tokens.access_token);
    localStorage.setItem(ADMIN_REFRESH_KEY, tokens.refresh_token);
  },
  clear(): void {
    localStorage.removeItem(ADMIN_ACCESS_KEY);
    localStorage.removeItem(ADMIN_REFRESH_KEY);
  },
};

// ══════════════════════════════════════════════════════════════════════
// ADMIN-SCOPED REQUEST HELPER
// Uses the shared axios instance but overrides Authorization header
// with the admin token instead of the user token.
// ══════════════════════════════════════════════════════════════════════

async function adminReq<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  opts: {
    body?: unknown;
    params?: Record<string, string | number | boolean | undefined>;
  } = {},
): Promise<T> {
  const token = adminTokenStore.getAccess();
  const config = {
    params: opts.params,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };

  let res;
  if (method === "GET") res = await api.get<T>(path, config);
  else if (method === "DELETE") res = await api.delete<T>(path, config);
  else if (method === "PATCH")
    res = await api.patch<T>(path, opts.body ?? {}, config);
  else res = await api.post<T>(path, opts.body ?? {}, config);

  return res.data;
}

// ══════════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════════

export const adminAuthApi = {
  async login(identifier: string, password: string): Promise<AuthTokens> {
    const tokens = await adminReq<AuthTokens>("POST", "/auth/login", {
      body: { identifier, password },
    });

    adminTokenStore.set(tokens);
    tokenStore.set({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });
    return tokens;
  },

  me(): Promise<AdminUser> {
    return adminReq<AdminUser>("GET", "/auth/me");
  },

  async logout(): Promise<void> {
    const refresh_token = adminTokenStore.getRefresh();
    if (refresh_token) {
      await adminReq("POST", "/auth/logout", {
        body: { refresh_token },
      }).catch(() => {});
    }
    adminTokenStore.clear();
  },
};

// ══════════════════════════════════════════════════════════════════════
// PLANS (admin)
// ══════════════════════════════════════════════════════════════════════

export const adminPlansApi = {
  // GET /billing/plans  (public — no admin prefix needed)
  getAll(): Promise<Plan[]> {
    return adminReq<Plan[]>("GET", "/billing/plans");
  },

  // POST /billing/admin/plans
  create(data: PlanCreatePayload): Promise<Plan> {
    return adminReq<Plan>("POST", "/billing/admin/plans", { body: data });
  },

  // PATCH /billing/admin/plans/{id}
  update(id: string, data: PlanUpdatePayload): Promise<Plan> {
    return adminReq<Plan>("PATCH", `/billing/admin/plans/${id}`, {
      body: data,
    });
  },

  // DELETE /billing/admin/plans/{id}
  delete(id: string): Promise<void> {
    return adminReq<void>("DELETE", `/billing/admin/plans/${id}`);
  },
};

// ══════════════════════════════════════════════════════════════════════
// PROMO CODES (admin)
// ══════════════════════════════════════════════════════════════════════

export const adminPromoApi = {
  // GET /billing/admin/promo-codes
  getAll(params?: {
    page?: number;
    size?: number;
    only_active?: boolean;
  }): Promise<Paginated<PromoCode>> {
    return adminReq<Paginated<PromoCode>>("GET", "/billing/admin/promo-codes", {
      params,
    });
  },

  // GET /billing/admin/promo-codes/{id}
  getOne(id: string): Promise<PromoCode> {
    return adminReq<PromoCode>("GET", `/billing/admin/promo-codes/${id}`);
  },

  // POST /billing/admin/promo-codes
  create(data: PromoCodeCreate): Promise<PromoCode> {
    return adminReq<PromoCode>("POST", "/billing/admin/promo-codes", {
      body: data,
    });
  },

  // PATCH /billing/admin/promo-codes/{id}
  update(id: string, data: PromoCodeUpdate): Promise<PromoCode> {
    return adminReq<PromoCode>("PATCH", `/billing/admin/promo-codes/${id}`, {
      body: data,
    });
  },

  // DELETE /billing/admin/promo-codes/{id}
  delete(id: string): Promise<void> {
    return adminReq<void>("DELETE", `/billing/admin/promo-codes/${id}`);
  },
};

// ══════════════════════════════════════════════════════════════════════
// SUBSCRIPTION REQUESTS (admin)
// ══════════════════════════════════════════════════════════════════════

export const adminSubscriptionRequestsApi = {
  // GET /billing/subscription-requests  (admin route, filters all users)
  getAll(params?: {
    page?: number;
    size?: number;
    status?: string;
  }): Promise<Paginated<SubscriptionRequest>> {
    return adminReq<Paginated<SubscriptionRequest>>(
      "GET",
      "/billing/subscription-requests",
      { params },
    );
  },

  // GET /billing/subscription-requests/{id}
  getOne(id: string): Promise<SubscriptionRequest> {
    return adminReq<SubscriptionRequest>(
      "GET",
      `/billing/subscription-requests/${id}`,
    );
  },

  // POST /billing/subscription-requests/{id}/review
  review(id: string, data: ReviewPayload): Promise<SubscriptionRequest> {
    return adminReq<SubscriptionRequest>(
      "POST",
      `/billing/subscription-requests/${id}/review`,
      { body: data },
    );
  },
};

// ══════════════════════════════════════════════════════════════════════
// PAYMENTS (admin)
// ══════════════════════════════════════════════════════════════════════

export const adminPaymentsApi = {
  // GET /billing/payments  (returns all users' payments for admin)
  getAll(params?: {
    page?: number;
    size?: number;
    status?: string;
  }): Promise<Paginated<Payment>> {
    return adminReq<Paginated<Payment>>("GET", "/billing/payments", { params });
  },

  // GET /billing/payments/{id}
  getOne(id: string): Promise<Payment> {
    return adminReq<Payment>("GET", `/billing/payments/${id}`);
  },

  // POST /billing/admin/payments/manual
  createManual(data: ManualPaymentPayload): Promise<Payment> {
    return adminReq<Payment>("POST", "/billing/admin/payments/manual", {
      body: data,
    });
  },

  // POST /billing/admin/payments/{id}/confirm
  confirm(id: string): Promise<Payment> {
    return adminReq<Payment>("POST", `/billing/admin/payments/${id}/confirm`);
  },
};

// ══════════════════════════════════════════════════════════════════════
// DASHBOARD (client-side aggregation)
// ══════════════════════════════════════════════════════════════════════

export const adminDashboardApi = {
  async getStats(): Promise<DashboardStats> {
    const [reqRes, payRes] = await Promise.all([
      adminSubscriptionRequestsApi.getAll({ page: 1, size: 5 }),
      adminPaymentsApi.getAll({ page: 1, size: 5 }),
    ]);

    const totalRevenue = payRes.items
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalUsers: 0, // extend with a /admin/users/count endpoint when ready
      activeSubscriptions: 0, // extend with a /admin/subscriptions/count endpoint
      pendingRequests: reqRes.items.filter((r) => r.status === "pending")
        .length,
      totalRevenue,
      recentPayments: payRes.items,
      recentRequests: reqRes.items,
    };
  },
};

// ══════════════════════════════════════════════════════════════════════
// CONVENIENCE BARREL  (keeps existing import paths working)
// ══════════════════════════════════════════════════════════════════════

/** @deprecated Import from the specific api objects above instead */
export const adminBillingApi = {
  createPlan: adminPlansApi.create,
  updatePlan: adminPlansApi.update,
  deletePlan: adminPlansApi.delete,

  getPromoCodes: adminPromoApi.getAll,
  createPromoCode: adminPromoApi.create,
  updatePromoCode: adminPromoApi.update,
  deletePromoCode: adminPromoApi.delete,

  reviewSubscriptionRequest: adminSubscriptionRequestsApi.review,
  manualPayment: adminPaymentsApi.createManual,
  confirmPayment: adminPaymentsApi.confirm,
};
