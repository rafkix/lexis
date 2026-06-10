// lib/api/billing.ts
import { api } from "./client";
import type {
  Plan,
  Subscription,
  SubscriptionUpdate,
  Payment,
  PaginatedPayments,
  SubscriptionRequest,
  PaginatedSubscriptionRequests,
  SubscriptionRequestCreate,
  CancelRequest,
  SubscribeRequest,
  PromoCodeValidateRequest,
  PromoCodeValidateOut,
  SubscriptionRequestReview,
  PromoCode,
  PromoCodeCreate,
  PromoCodeUpdate,
  PaginatedPromoCodes,
  ManualPaymentCreate,
  QuoteRequest,
  QuoteOut,
} from "@/lib/types/billing";

export const billingApi = {
  // ── Quote ───────────────────────────────────────────────────────────

  // POST /billing/quote
  getQuote(payload: QuoteRequest): Promise<QuoteOut> {
    return api.post<QuoteOut>("/billing/quote", payload).then((r) => r.data);
  },

  // ── Plans (public) ──────────────────────────────────────────────────

  // GET /billing/plans
  getPlans(): Promise<Plan[]> {
    return api.get<Plan[]>("/billing/plans").then((r) => r.data);
  },

  // GET /billing/plans/{slug}
  getPlan(slug: string): Promise<Plan> {
    return api.get<Plan>(`/billing/plans/${slug}`).then((r) => r.data);
  },

  // ── Plans (admin) ───────────────────────────────────────────────────

  // POST /billing/admin/plans
  createPlan(
    data: Omit<Plan, "id" | "created_at" | "is_popular">,
  ): Promise<Plan> {
    return api.post<Plan>("/billing/admin/plans", data).then((r) => r.data);
  },

  // PATCH /billing/admin/plans/{plan_id}
  updatePlan(
    planId: string,
    data: Partial<Omit<Plan, "id" | "created_at" | "is_popular">>,
  ): Promise<Plan> {
    return api
      .patch<Plan>(`/billing/admin/plans/${planId}`, data)
      .then((r) => r.data);
  },

  // DELETE /billing/admin/plans/{plan_id}
  deletePlan(planId: string): Promise<void> {
    return api.delete(`/billing/admin/plans/${planId}`).then(() => undefined);
  },

  // ── Subscriptions ───────────────────────────────────────────────────

  // GET /billing/subscription
  getMySubscription(): Promise<Subscription | null> {
    return api
      .get<Subscription | null>("/billing/subscription")
      .then((r) => r.data);
  },

  // GET /billing/subscription/history
  getSubscriptionHistory(): Promise<Subscription[]> {
    return api
      .get<Subscription[]>("/billing/subscription/history")
      .then((r) => r.data);
  },

  // POST /billing/subscription
  subscribe(payload: SubscribeRequest): Promise<Subscription> {
    return api
      .post<Subscription>("/billing/subscription", payload)
      .then((r) => r.data);
  },

  // POST /billing/subscription/cancel
  // FIX: DELETE body bilan ishonchsiz edi — POST ga o'zgartirildi (router ga mos)
  // string overload olib tashlandi — faqat CancelRequest qabul qilinadi
  cancelSubscription(payload: CancelRequest): Promise<Subscription> {
    return api
      .post<Subscription>("/billing/subscription/cancel", payload)
      .then((r) => r.data);
  },

  // ── Subscriptions (admin) ───────────────────────────────────────────

  // PATCH /billing/admin/subscriptions/{subscription_id}
  updateSubscription(
    subscriptionId: string,
    data: SubscriptionUpdate,
  ): Promise<Subscription> {
    return api
      .patch<Subscription>(
        `/billing/admin/subscriptions/${subscriptionId}`,
        data,
      )
      .then((r) => r.data);
  },

  // DELETE /billing/admin/subscriptions/{subscription_id}
  deleteSubscription(subscriptionId: string): Promise<void> {
    return api
      .delete(`/billing/admin/subscriptions/${subscriptionId}`)
      .then(() => undefined);
  },

  // ── Subscription requests (manual / screenshot flow) ────────────────

  // POST /billing/subscription-requests
  createSubscriptionRequest(
    payload: SubscriptionRequestCreate,
  ): Promise<SubscriptionRequest> {
    return api
      .post<SubscriptionRequest>("/billing/subscription-requests", payload)
      .then((r) => r.data);
  },

  // GET /billing/subscription-requests
  getMySubscriptionRequests(params?: {
    page?: number;
    size?: number;
  }): Promise<PaginatedSubscriptionRequests> {
    return api
      .get<PaginatedSubscriptionRequests>("/billing/subscription-requests", {
        params,
      })
      .then((r) => r.data);
  },

  // GET /billing/subscription-requests/{id}
  getSubscriptionRequest(id: string): Promise<SubscriptionRequest> {
    return api
      .get<SubscriptionRequest>(`/billing/subscription-requests/${id}`)
      .then((r) => r.data);
  },

  // ── Subscription requests (admin) ───────────────────────────────────

  // GET /billing/admin/subscription-requests
  getAllSubscriptionRequests(params?: {
    page?: number;
    size?: number;
    status?: string;
  }): Promise<PaginatedSubscriptionRequests> {
    return api
      .get<PaginatedSubscriptionRequests>(
        "/billing/admin/subscription-requests",
        { params },
      )
      .then((r) => r.data);
  },

  // POST /billing/admin/subscription-requests/{id}/review
  reviewSubscriptionRequest(
    id: string,
    data: SubscriptionRequestReview,
  ): Promise<SubscriptionRequest> {
    return api
      .post<SubscriptionRequest>(
        `/billing/admin/subscription-requests/${id}/review`,
        data,
      )
      .then((r) => r.data);
  },

  // DELETE /billing/admin/subscription-requests/{id}
  deleteSubscriptionRequest(id: string): Promise<void> {
    return api
      .delete(`/billing/admin/subscription-requests/${id}`)
      .then(() => undefined);
  },

  // ── Payments ────────────────────────────────────────────────────────

  // GET /billing/payments
  getPayments(params?: {
    page?: number;
    size?: number;
    status?: string;
  }): Promise<PaginatedPayments> {
    return api
      .get<PaginatedPayments>("/billing/payments", { params })
      .then((r) => r.data);
  },

  // GET /billing/payments/{id}
  getPayment(id: string): Promise<Payment> {
    return api.get<Payment>(`/billing/payments/${id}`).then((r) => r.data);
  },

  // ── Payments (admin) ────────────────────────────────────────────────

  // GET /billing/admin/payments
  getAllPayments(params?: {
    page?: number;
    size?: number;
    status?: string;
  }): Promise<PaginatedPayments> {
    return api
      .get<PaginatedPayments>("/billing/admin/payments", { params })
      .then((r) => r.data);
  },

  // POST /billing/admin/payments
  createManualPayment(data: ManualPaymentCreate): Promise<Payment> {
    return api
      .post<Payment>("/billing/admin/payments", data)
      .then((r) => r.data);
  },

  // POST /billing/admin/payments/{id}/confirm
  confirmPayment(id: string): Promise<Payment> {
    return api
      .post<Payment>(`/billing/admin/payments/${id}/confirm`)
      .then((r) => r.data);
  },

  // ── Promo codes (public) ─────────────────────────────────────────────

  // POST /billing/promo-codes/validate
  validatePromo(
    payload: PromoCodeValidateRequest,
  ): Promise<PromoCodeValidateOut> {
    return api
      .post<PromoCodeValidateOut>("/billing/promo-codes/validate", payload)
      .then((r) => r.data);
  },

  // ── Promo codes (admin) ──────────────────────────────────────────────

  // GET /billing/admin/promo-codes
  listPromoCodes(params?: {
    page?: number;
    size?: number;
    only_active?: boolean;
  }): Promise<PaginatedPromoCodes> {
    return api
      .get<PaginatedPromoCodes>("/billing/admin/promo-codes", { params })
      .then((r) => r.data);
  },

  // GET /billing/admin/promo-codes/{id}
  getPromoCode(id: string): Promise<PromoCode> {
    return api
      .get<PromoCode>(`/billing/admin/promo-codes/${id}`)
      .then((r) => r.data);
  },

  // POST /billing/admin/promo-codes
  createPromoCode(data: PromoCodeCreate): Promise<PromoCode> {
    return api
      .post<PromoCode>("/billing/admin/promo-codes", data)
      .then((r) => r.data);
  },

  // PATCH /billing/admin/promo-codes/{id}
  updatePromoCode(id: string, data: PromoCodeUpdate): Promise<PromoCode> {
    return api
      .patch<PromoCode>(`/billing/admin/promo-codes/${id}`, data)
      .then((r) => r.data);
  },

  // DELETE /billing/admin/promo-codes/{id}
  deletePromoCode(id: string): Promise<void> {
    return api.delete(`/billing/admin/promo-codes/${id}`).then(() => undefined);
  },
};
