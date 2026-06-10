// lib/hooks/useBilling.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billingApi } from "@/lib/api/billing";
import type {
  SubscribeRequest,
  CancelRequest,
  SubscriptionRequestCreate,
  SubscriptionRequestReview,
} from "@/lib/types/billing";
import { toast } from "sonner";

export const BILLING_KEYS = {
  plans: ["billing", "plans"] as const,
  subscription: ["billing", "subscription"] as const,
  history: ["billing", "subscription", "history"] as const,
  payments: (p?: object) => ["billing", "payments", p] as const,
  requests: (p?: object) => ["billing", "requests", p] as const,
  allRequests: (p?: object) => ["billing", "admin", "requests", p] as const,
};

// ─── Plans ──────────────────────────────────────────────────────────────────
export function usePlans() {
  return useQuery({
    queryKey: BILLING_KEYS.plans,
    queryFn: billingApi.getPlans,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Subscription ────────────────────────────────────────────────────────────
export function useMySubscription() {
  return useQuery({
    queryKey: BILLING_KEYS.subscription,
    queryFn: billingApi.getMySubscription,
  });
}

export function useSubscriptionHistory() {
  return useQuery({
    queryKey: BILLING_KEYS.history,
    queryFn: billingApi.getSubscriptionHistory,
  });
}

export function useSubscribe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SubscribeRequest) => billingApi.subscribe(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BILLING_KEYS.subscription });
      qc.invalidateQueries({ queryKey: BILLING_KEYS.history });
      qc.invalidateQueries({ queryKey: ["billing", "payments"] });
      toast.success("Subscription activated!");
    },
    onError: () => toast.error("Something went wrong"),
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CancelRequest) =>
      billingApi.cancelSubscription(data.reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BILLING_KEYS.subscription });
      toast.success("Subscription cancelled");
    },
    onError: () => toast.error("Something went wrong"),
  });
}

// ─── Subscription Requests ───────────────────────────────────────────────────
export function useMySubscriptionRequests(params?: {
  page?: number;
  size?: number;
}) {
  return useQuery({
    queryKey: BILLING_KEYS.requests(params),
    queryFn: () => billingApi.getMySubscriptionRequests(params),
  });
}

/** Admin only */
export function useAllSubscriptionRequests(params?: {
  page?: number;
  size?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: BILLING_KEYS.allRequests(params),
    queryFn: () => billingApi.getAllSubscriptionRequests(params),
  });
}

export function useCreateSubscriptionRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SubscriptionRequestCreate) =>
      billingApi.createSubscriptionRequest(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["billing", "requests"] });
      toast.success("Request submitted! We'll review it shortly.");
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.detail ?? "Failed to submit request"),
  });
}

export function useReviewSubscriptionRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: SubscriptionRequestReview;
    }) => billingApi.reviewSubscriptionRequest(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["billing", "admin", "requests"] });
      qc.invalidateQueries({ queryKey: BILLING_KEYS.subscription });
      toast.success(
        vars.data.action === "approve"
          ? "Request approved — subscription activated"
          : "Request rejected",
      );
    },
    onError: () => toast.error("Something went wrong"),
  });
}

// ─── Payments ────────────────────────────────────────────────────────────────
export function usePayments(params?: {
  page?: number;
  size?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: BILLING_KEYS.payments(params),
    queryFn: () => billingApi.getPayments(params),
  });
}
