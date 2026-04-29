// lib/api/billing.ts
import { api } from "./client";
import type {
  Plan,
  Subscription,
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
} from "@/lib/types/billing";

export const billingApi = {
  // ── Plans (public) ──────────────────────────────────────────────────

  // GET /billing/plans
  getPlans(): Promise<Plan[]> {
    return api.get<Plan[]>("/billing/plans").then((r) => r.data);
  },

  // GET /billing/plans/{slug}
  getPlan(slug: string): Promise<Plan> {
    return api.get<Plan>(`/billing/plans/${slug}`).then((r) => r.data);
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

  // POST /billing/subscribe
  subscribe(payload: SubscribeRequest): Promise<Subscription> {
    return api
      .post<Subscription>("/billing/subscribe", payload)
      .then((r) => r.data);
  },

  // POST /billing/subscription/cancel
  cancelSubscription(payload: CancelRequest): Promise<Subscription> {
    return api
      .post<Subscription>("/billing/subscription/cancel", payload)
      .then((r) => r.data);
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

  // GET /billing/subscription-requests/my
  getMySubscriptionRequests(params?: {
    page?: number;
    size?: number;
  }): Promise<PaginatedSubscriptionRequests> {
    return api
      .get<PaginatedSubscriptionRequests>("/billing/subscription-requests/my", {
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

  // ── Promo codes ─────────────────────────────────────────────────────

  // POST /billing/promo-codes/validate
  validatePromo(
    payload: PromoCodeValidateRequest,
  ): Promise<PromoCodeValidateOut> {
    return api
      .post<PromoCodeValidateOut>("/billing/promo-codes/validate", payload)
      .then((r) => r.data);
  },

  // ── Admin: All subscription requests ────────────────────────────────

  // GET /billing/subscription-requests  (admin)
  getAllSubscriptionRequests(params?: {
    page?: number;
    size?: number;
    status?: string;
  }): Promise<PaginatedSubscriptionRequests> {
    return api
      .get<PaginatedSubscriptionRequests>("/billing/subscription-requests", {
        params,
      })
      .then((r) => r.data);
  },

  // POST /billing/subscription-requests/{id}/review
  reviewSubscriptionRequest(
    id: string,
    data: SubscriptionRequestReview,
  ): Promise<SubscriptionRequest> {
    return api
      .post<SubscriptionRequest>(
        `/billing/subscription-requests/${id}/review`,
        data,
      )
      .then((r) => r.data);
  },
};
