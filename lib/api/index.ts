// lib/api/index.ts
// Central barrel — import everything from here

export { api, tokenStore } from "./client";

export { authApi } from "./auth";
export type {
  TokenResponse,
  MeResponse,
  SessionResponse,
  UserMeta,
  TelegramAuthData,
  MessageResponse,
} from "./auth";

export { userApi } from "./user";
export type { User, Device, ApiResponse } from "./user";

export { billingApi } from "./billing";
export { notificationsApi } from "./notifications";

export {
  adminAuthApi,
  adminTokenStore,
  adminPlansApi,
  adminPromoApi,
  adminSubscriptionRequestsApi,
  adminPaymentsApi,
  adminDashboardApi,
  /** @deprecated */ adminBillingApi,
} from "./admin";
