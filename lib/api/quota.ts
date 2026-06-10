// lib/api/quota.ts
// All endpoints and types verified against:
//   app/modules/quota/router.py
//   app/modules/quota/schemas.py
//   app/modules/quota/models.py

import { api } from "./client";

// ══════════════════════════════════════════════════════════════════════
// TYPES — mirrors app/modules/quota/schemas.py
// ══════════════════════════════════════════════════════════════════════

/** Mirrors TestTypeEnum from models.py */
export type TestType = "READING" | "LISTENING" | "WRITING" | "SPEAKING";

/** Mirrors QuotaWindowType from models.py */
export type QuotaWindowType = "weekly" | "monthly";

/** Mirrors QuotaItemOut — quota status for a single test type */
export type QuotaItemOut = {
  test_type: TestType;
  used: number;
  limit: number; // -1 = unlimited
  remaining: number; // -1 = unlimited
  resets_at: string; // ISO datetime
  window_type: QuotaWindowType;
};

/**
 * Mirrors QuotaOut — quota status for all test types.
 *
 * Example:
 * {
 *   "tier": "free",
 *   "is_premium": false,
 *   "quotas": {
 *     "READING":   { "used": 2, "limit": 5, "remaining": 3, ... },
 *     "LISTENING": { "used": 1, "limit": 5, "remaining": 4, ... },
 *     "WRITING":   { "used": 0, "limit": 1, "remaining": 1, ... },
 *     "SPEAKING":  null   // not available on FREE tier
 *   }
 * }
 */
export type QuotaOut = {
  tier: string; // "free" | "pro" | "premium" | "grandfathered"
  is_premium: boolean;
  quotas: Record<TestType, QuotaItemOut | null>;
};

/** Mirrors QuotaConfigOut — admin view of a single tier + test type config */
export type QuotaConfigOut = {
  tier: string;
  test_type: TestType;
  limit: number; // -1 = unlimited
  window_type: QuotaWindowType;
  is_premium: boolean;
  description?: string | null;
};

/** Mirrors QuotaConfigUpdate — payload for admin upsert */
export type QuotaConfigUpdate = {
  limit?: number;
  window_type?: QuotaWindowType;
  is_premium?: boolean;
  description?: string | null;
};

// ══════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════

/**
 * Returns true if the user still has quota remaining for the given test type.
 * Use this before starting a test to show a gate UI.
 */
export function hasQuota(quota: QuotaOut, testType: TestType): boolean {
  const item = quota.quotas[testType];
  if (!item) return false; // not available for this tier
  if (item.limit === -1) return true; // unlimited
  return item.remaining > 0;
}

/**
 * Returns a human-readable reset label, e.g. "Resets Monday, 26/05/2025".
 */
export function resetLabel(resets_at: string): string {
  const d = new Date(resets_at);
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return `Resets ${days[d.getDay()]}, ${d.toLocaleDateString()}`;
}

// ══════════════════════════════════════════════════════════════════════
// QUOTA API — mirrors app/modules/quota/router.py
// ══════════════════════════════════════════════════════════════════════

export const quotaApi = {
  // ── User endpoints ────────────────────────────────────────────────

  /**
   * GET /quota/me
   * Returns the authenticated user's weekly quota status for all test types.
   *
   * Tier limits (weekly):
   *   FREE      → Reading: 5,  Listening: 5,  Writing: 1,  Speaking: null
   *   PRO       → Reading: 15, Listening: 15, Writing: 5,  Speaking: 5
   *   PREMIUM   → Reading: 30, Listening: 30, Writing: 20, Speaking: 5
   */
  async getMyQuota(): Promise<QuotaOut> {
    const { data } = await api.get<QuotaOut>("/quota/me");
    return data;
  },

  // ── Admin endpoints ───────────────────────────────────────────────

  /**
   * GET /quota/admin/configs
   * Returns quota configuration for every tier and test type combination.
   * Requires ADMIN role.
   */
  async listConfigs(): Promise<QuotaConfigOut[]> {
    const { data } = await api.get<QuotaConfigOut[]>("/quota/admin/configs");
    return data;
  },

  /**
   * PUT /quota/admin/configs/{tier}/{test_type}
   * Creates or updates the quota limit for a specific tier + test_type.
   *
   * @param tier      "FREE" | "PRO" | "PREMIUM" | "GRANDFATHERED"
   * @param testType  "READING" | "LISTENING" | "WRITING" | "SPEAKING"
   * @param payload   fields to update
   *
   * Requires ADMIN role.
   */
  async upsertConfig(
    tier: string,
    testType: TestType,
    payload: QuotaConfigUpdate,
  ): Promise<QuotaConfigOut> {
    const { data } = await api.put<QuotaConfigOut>(
      `/quota/admin/configs/${tier.toUpperCase()}/${testType}`,
      payload,
    );
    return data;
  },

  /**
   * POST /quota/admin/users/{user_id}/quota/reset
   * Manually resets the weekly quota counters for the specified user.
   * Requires ADMIN role.
   *
   * @param userId  UUID of the user
   * @param tier    current tier of the user — omit to let the backend resolve it from the DB
   */
  async adminResetUserQuota(userId: string, tier?: string): Promise<QuotaOut> {
    const { data } = await api.post<QuotaOut>(
      `/quota/admin/users/${userId}/quota/reset`,
      null,
      tier ? { params: { tier } } : undefined,
    );
    return data;
  },
};
