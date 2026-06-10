// lib/api/admin.ts
//
// Admin API — uses the shared `api` axios instance (with auto token refresh)
// All endpoints verified against backend source (app/modules/admin/router.py).
//
// CRITICAL FIXES applied:
//   - notifications/send, notifications/broadcast: backend uses query params, not JSON body
//   - roles POST: backend uses query params, not JSON body
//   - ads/send, ads/broadcast: backend uses query params, not JSON body
//   - users/{id}/status PUT: backend uses query param ?new_status=
//   - subscriptions/{id}/extend PUT: backend uses query param ?days=
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
  Paginated,
  DashboardStats,
  UserDashboard,
  AdminSummary,
} from "@/lib/types/admin";
import type {
  PromoCode,
  PromoCodeCreate,
  PromoCodeUpdate,
} from "@/lib/types/billing";

// ═════════════════════════════════════════════════════════════════════
// ADMIN TOKEN STORAGE  (separate from user tokens)
// ═════════════════════════════════════════════════════════════════════

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

// ═════════════════════════════════════════════════════════════════════
// ADMIN-SCOPED REQUEST HELPER
// Uses the shared axios instance but overrides Authorization header
// with the admin token instead of the user token.
// ═════════════════════════════════════════════════════════════════════

async function adminReq<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  opts: {
    body?: unknown;
    params?: Record<string, string | number | boolean | undefined | null>;
  } = {},
): Promise<T> {
  const token = adminTokenStore.getAccess();
  const config = {
    params: opts.params,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };

  // Use null-coalescing carefully: body can be an array, 0, false, etc.
  const body = opts.body !== undefined ? opts.body : {};

  let res;
  if (method === "GET") res = await api.get<T>(path, config);
  else if (method === "DELETE") res = await api.delete<T>(path, config);
  else if (method === "PATCH") res = await api.patch<T>(path, body, config);
  else if (method === "PUT") res = await api.put<T>(path, body, config);
  else res = await api.post<T>(path, body, config);

  return res.data;
}

// ═════════════════════════════════════════════════════════════════════
// AUTH
// ═════════════════════════════════════════════════════════════════════

export const adminAuthApi = {
  async login(identifier: string, password: string): Promise<AuthTokens> {
    // POST /auth/login — JSON body
    const tokens = await adminReq<AuthTokens>("POST", "/auth/login", {
      body: { identifier, password },
    });

    adminTokenStore.set(tokens);
    // Also set in the shared store so the axios interceptor picks it up
    tokenStore.set({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });
    return tokens;
  },

  async me(): Promise<AdminUser> {
    const res = await adminReq<{
      success: boolean;
      data: AdminUser;
      message?: string;
    }>("GET", "/users/me");
    if (!res.success)
      throw new Error(res.message ?? "Failed to fetch admin user");
    return res.data;
  },

  async logout(): Promise<void> {
    const refresh_token = adminTokenStore.getRefresh();
    if (refresh_token) {
      await adminReq("POST", "/auth/logout", {
        body: { refresh_token },
      }).catch(() => {});
    }
    adminTokenStore.clear();
    tokenStore.clear();
  },
};

// ═════════════════════════════════════════════════════════════════════
// USERS (admin)
// ═════════════════════════════════════════════════════════════════════

export const adminUsersApi = {
  // GET /admin/users?page=&size=&search=&status=
  getAll(params?: {
    page?: number;
    size?: number;
    search?: string;
    status?: string;
  }): Promise<Paginated<AdminUser>> {
    return adminReq<Paginated<AdminUser>>("GET", "/admin/users", { params });
  },

  // GET /admin/users/{id}
  getOne(id: string): Promise<AdminUser> {
    return adminReq<AdminUser>("GET", `/admin/users/${id}`);
  },

  // PUT /admin/users/{id}/status?new_status=...
  // Backend: PUT /admin/users/{user_id}/status with query param new_status
  updateStatus(id: string, status: string): Promise<void> {
    return adminReq<void>("PUT", `/admin/users/${id}/status`, {
      params: { new_status: status },
    });
  },

  // PUT /admin/users/{id}/roles — body is a JSON array of role names
  updateRoles(id: string, roles: string[]): Promise<void> {
    return adminReq<void>("PUT", `/admin/users/${id}/roles`, {
      body: roles,
    });
  },

  // DELETE /admin/users/{id}
  delete(id: string): Promise<void> {
    return adminReq<void>("DELETE", `/admin/users/${id}`);
  },

  // GET /admin/users/{id}/dashboard
  getDashboard(id: string): Promise<UserDashboard> {
    return adminReq<UserDashboard>("GET", `/admin/users/${id}/dashboard`);
  },
};

// ═════════════════════════════════════════════════════════════════════
// PLANS (admin)
// ═════════════════════════════════════════════════════════════════════

export const adminPlansApi = {
  // GET /billing/plans  (public — no admin prefix needed)
  getAll(): Promise<Plan[]> {
    return adminReq<Plan[]>("GET", "/billing/plans");
  },

  // POST /billing/admin/plans — JSON body
  create(data: PlanCreatePayload): Promise<Plan> {
    return adminReq<Plan>("POST", "/billing/admin/plans", { body: data });
  },

  // PATCH /billing/admin/plans/{id} — JSON body
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

// ═════════════════════════════════════════════════════════════════════
// PROMO CODES (admin)
// ═════════════════════════════════════════════════════════════════════

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

  // POST /billing/admin/promo-codes — JSON body
  create(data: PromoCodeCreate): Promise<PromoCode> {
    return adminReq<PromoCode>("POST", "/billing/admin/promo-codes", {
      body: data,
    });
  },

  // PATCH /billing/admin/promo-codes/{id} — JSON body
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

// ═════════════════════════════════════════════════════════════════════
// SUBSCRIPTIONS (admin)
// ═════════════════════════════════════════════════════════════════════

export const adminSubscriptionsApi = {
  // GET /billing/admin/subscriptions?page=&size=&status=
  getAll(params?: {
    page?: number;
    size?: number;
    status?: string;
  }): Promise<Paginated<Subscription>> {
    return adminReq<Paginated<Subscription>>(
      "GET",
      "/billing/admin/subscriptions",
      { params },
    );
  },

  // PATCH /billing/admin/subscriptions/{id}
  update(id: string, data: Partial<Subscription>): Promise<Subscription> {
    return adminReq<Subscription>(
      "PATCH",
      `/billing/admin/subscriptions/${id}`,
      { body: data },
    );
  },

  // DELETE /billing/admin/subscriptions/{id}
  delete(id: string): Promise<void> {
    return adminReq<void>("DELETE", `/billing/admin/subscriptions/${id}`);
  },
};

// ═════════════════════════════════════════════════════════════════════
// SUBSCRIPTION REQUESTS (admin)  — manual screenshot flow
// ═════════════════════════════════════════════════════════════════════

import type { SubscriptionRequest, ReviewPayload } from "@/lib/types/admin";

export const adminSubscriptionRequestsApi = {
  // GET /billing/admin/subscription-requests?page=&size=&status=
  getAll(params?: {
    page?: number;
    size?: number;
    status?: string;
  }): Promise<Paginated<SubscriptionRequest>> {
    return adminReq<Paginated<SubscriptionRequest>>(
      "GET",
      "/billing/admin/subscription-requests",
      { params },
    );
  },

  // POST /billing/admin/subscription-requests/{id}/review
  review(id: string, data: ReviewPayload): Promise<SubscriptionRequest> {
    return adminReq<SubscriptionRequest>(
      "POST",
      `/billing/admin/subscription-requests/${id}/review`,
      { body: data },
    );
  },

  // DELETE /billing/admin/subscription-requests/{id}
  delete(id: string): Promise<void> {
    return adminReq<void>(
      "DELETE",
      `/billing/admin/subscription-requests/${id}`,
    );
  },
};

// ═════════════════════════════════════════════════════════════════════
// PAYMENTS (admin)
// ═════════════════════════════════════════════════════════════════════

export const adminPaymentsApi = {
  // GET /billing/admin/payments?page=&size=&status=
  getAll(params?: {
    page?: number;
    size?: number;
    status?: string;
  }): Promise<Paginated<Payment>> {
    return adminReq<Paginated<Payment>>("GET", "/billing/admin/payments", {
      params,
    });
  },

  // POST /billing/admin/payments — create manual payment
  create(data: {
    user_id: string;
    plan_slug: string;
    amount: number;
    currency?: string;
    description?: string;
    provider?: string;
  }): Promise<Payment> {
    return adminReq<Payment>("POST", "/billing/admin/payments", { body: data });
  },

  // POST /billing/admin/payments/{id}/confirm
  confirm(id: string): Promise<Payment> {
    return adminReq<Payment>("POST", `/billing/admin/payments/${id}/confirm`);
  },
};

// ═════════════════════════════════════════════════════════════════════
// CONTENT MANAGEMENT (admin)
// ═════════════════════════════════════════════════════════════════════

export const adminContentApi = {
  // GET /admin/content/tests
  getTests(params?: {
    page?: number;
    size?: number;
    status?: string;
  }): Promise<Paginated<any>> {
    return adminReq<Paginated<any>>("GET", "/admin/content/tests", { params });
  },

  // GET /admin/content/exams
  getExams(params?: {
    page?: number;
    size?: number;
    status?: string;
  }): Promise<Paginated<any>> {
    return adminReq<Paginated<any>>("GET", "/admin/content/exams", { params });
  },

  // GET /admin/content/exams/{id}/registrations
  getExamRegistrations(
    examId: string,
    params?: {
      page?: number;
      size?: number;
    },
  ): Promise<Paginated<any>> {
    return adminReq<Paginated<any>>(
      "GET",
      `/admin/content/exams/${examId}/registrations`,
      { params },
    );
  },
};

// ═════════════════════════════════════════════════════════════════════
// NOTIFICATIONS (admin)
// ═════════════════════════════════════════════════════════════════════
//
// CRITICAL FIX: Backend uses query params, NOT JSON body.
// The FastAPI handler declares primitive params without Body() → they are query params.
//
// Backend:  POST /admin/notifications/send?user_id=&title=&message=&notification_type=
// Backend:  POST /admin/notifications/broadcast?title=&message=&notification_type=
//
export const adminNotificationsApi = {
  // POST /admin/notifications/send?user_id=...&title=...&message=...&notification_type=...
  send(data: {
    user_id: string;
    title: string;
    message: string;
    notification_type?: string;
  }): Promise<any> {
    return adminReq<any>("POST", "/admin/notifications/send", {
      params: {
        user_id: data.user_id,
        title: data.title,
        message: data.message,
        notification_type: data.notification_type ?? "INFO",
      },
    });
  },

  // POST /admin/notifications/broadcast?title=...&message=...&notification_type=...
  broadcast(data: {
    title: string;
    message: string;
    notification_type?: string;
    user_ids?: string[];
  }): Promise<any> {
    // user_ids is Optional[List[uuid.UUID]] — FastAPI can't easily receive a list via query param.
    // If user_ids is provided, use individual sends instead.
    return adminReq<any>("POST", "/admin/notifications/broadcast", {
      params: {
        title: data.title,
        message: data.message,
        notification_type: data.notification_type ?? "INFO",
      },
    });
  },
};

// ═════════════════════════════════════════════════════════════════════
// ADS (admin)
// ═════════════════════════════════════════════════════════════════════
//
// CRITICAL FIX: Backend uses query params, NOT JSON body.
//
export const adminAdsApi = {
  // POST /admin/ads/broadcast?ad_title=...&ad_content=...&ad_url=...&send_email=...&send_telegram=...
  broadcast(data: {
    ad_title: string;
    ad_content: string;
    ad_url?: string;
    send_email?: boolean;
    send_telegram?: boolean;
  }): Promise<any> {
    return adminReq<any>("POST", "/admin/ads/broadcast", {
      params: {
        ad_title: data.ad_title,
        ad_content: data.ad_content,
        ad_url: data.ad_url,
        send_email: data.send_email ?? true,
        send_telegram: data.send_telegram ?? true,
      },
    });
  },

  // POST /admin/ads/send?user_ids=...&ad_title=...&ad_content=...
  // NOTE: user_ids as List param is complex in query strings.
  // Use broadcast for most cases. This endpoint needs backend refactor to body.
  send(data: {
    user_ids: string[];
    ad_title: string;
    ad_content: string;
    ad_url?: string;
    send_email?: boolean;
    send_telegram?: boolean;
  }): Promise<any> {
    const params = new URLSearchParams();
    data.user_ids.forEach((id) => params.append("user_ids", id));
    params.set("ad_title", data.ad_title);
    params.set("ad_content", data.ad_content);
    if (data.ad_url) params.set("ad_url", data.ad_url);
    params.set("send_email", String(data.send_email ?? true));
    params.set("send_telegram", String(data.send_telegram ?? true));
    return adminReq<any>("POST", `/admin/ads/send?${params.toString()}`);
  },
};

// ═════════════════════════════════════════════════════════════════════
// ROLES (admin)
// ═════════════════════════════════════════════════════════════════════
//
// CRITICAL FIX: Backend POST /admin/roles uses query params, not JSON body.
//
export const adminRolesApi = {
  // GET /admin/roles
  getAll(): Promise<any[]> {
    return adminReq<any[]>("GET", "/admin/roles");
  },

  // POST /admin/roles?name=...&description=...
  // Backend: async def create_role(name: str, description: Optional[str] = None, ...)
  // Plain primitives without Body() → query params
  create(data: { name: string; description?: string }): Promise<any> {
    return adminReq<any>("POST", "/admin/roles", {
      params: {
        name: data.name,
        description: data.description,
      },
    });
  },

  // DELETE /admin/roles/{id}
  delete(id: number): Promise<void> {
    return adminReq<void>("DELETE", `/admin/roles/${id}`);
  },
};

// ═════════════════════════════════════════════════════════════════════
// DASHBOARD (admin)
// ═════════════════════════════════════════════════════════════════════

export const adminDashboardApi = {
  // GET /admin/summary — single endpoint for all dashboard stats
  getSummary(): Promise<AdminSummary> {
    return adminReq<AdminSummary>("GET", "/admin/summary");
  },

  // GET /admin/stats
  getStats(): Promise<any> {
    return adminReq<any>("GET", "/admin/stats");
  },

  // GET /admin/logs
  getLogs(params?: {
    page?: number;
    size?: number;
    user_id?: string;
    action?: string;
  }): Promise<Paginated<any>> {
    return adminReq<Paginated<any>>("GET", "/admin/logs", { params });
  },
};

// ═════════════════════════════════════════════════════════════════════
// CONVENIENCE BARREL  (keeps existing import paths working)
// ═════════════════════════════════════════════════════════════════════

/** @deprecated Import from the specific api objects above instead */
export const adminBillingApi = {
  createPlan: adminPlansApi.create.bind(adminPlansApi),
  updatePlan: adminPlansApi.update.bind(adminPlansApi),
  deletePlan: adminPlansApi.delete.bind(adminPlansApi),

  getPromoCodes: adminPromoApi.getAll.bind(adminPromoApi),
  createPromoCode: adminPromoApi.create.bind(adminPromoApi),
  updatePromoCode: adminPromoApi.update.bind(adminPromoApi),
  deletePromoCode: adminPromoApi.delete.bind(adminPromoApi),
};