// lib/api/user.ts
// All endpoints and types verified against:
//   app/modules/users/router.py
//   app/modules/users/schemas.py
//   app/modules/auth/schemas.py
//   app/modules/auth/models.py

import { api } from "./client";

// ══════════════════════════════════════════════════════════════════════
// META TYPES — mirrors schemas.py sub-structures exactly
// ══════════════════════════════════════════════════════════════════════

export type IELTSGoal =
  | "university"
  | "immigration"
  | "work"
  | "personal"
  | "other";
export type CEFRGoal =
  | "travel"
  | "business"
  | "academic"
  | "daily"
  | "exam"
  | "other";
export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type IELTSMeta = {
  current_score?: number | null; // 0–9, rounded to 0.5
  listening?: number | null;
  reading?: number | null;
  writing?: number | null;
  speaking?: number | null;
  target_score?: number | null;
  target_listening?: number | null;
  target_reading?: number | null;
  target_writing?: number | null;
  target_speaking?: number | null;
  exam_date?: string | null; // ISO date "YYYY-MM-DD"
  attempts?: number | null;
  goal?: IELTSGoal | null;
  goal_note?: string | null; // max 200 chars
};

export type CEFRMeta = {
  level?: CEFRLevel | null;
  target_level?: CEFRLevel | null;
  goal?: CEFRGoal | null;
  goal_note?: string | null; // max 200 chars
  assessed_at?: string | null; // ISO date "YYYY-MM-DD"
};

// mirrors UserMeta in users/schemas.py
// NOTE: User.meta in DB is never null (default={}), so this is always an object.
// Fields inside may be absent/null.
export type UserMeta = {
  version?: number;
  bio?: string | null; // max 500 chars
  birth_date?: string | null; // ISO date "YYYY-MM-DD"
  ielts?: IELTSMeta | null;
  cefr?: CEFRMeta | null;
};

// ══════════════════════════════════════════════════════════════════════
// API ENVELOPE — mirrors ApiResponse[T] from users/schemas.py
// ══════════════════════════════════════════════════════════════════════

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

// ══════════════════════════════════════════════════════════════════════
// USER TYPES — mirrors UserResponse from users/schemas.py
// ══════════════════════════════════════════════════════════════════════

export type UserStatus = "active" | "blocked" | "pending";

// subscription_tier values from models.py
export type SubscriptionTier = "FREE" | "PRO" | "PREMIUM" | "GRANDFATHERED";

export type User = {
  id: string; // UUID serialized as string
  public_id: string;
  full_name: string | null;
  username: string | null; // 3–30 chars, lowercase, alphanumeric + _
  email: string | null;
  phone: string | null;
  phone_verified: boolean;
  avatar: string | null;
  status: UserStatus;
  is_verified: boolean;
  is_active: boolean;
  roles: string[];
  meta: UserMeta; // never null — DB default is {}
  has_password: boolean; // true when password_hash is set
  subscription_tier: SubscriptionTier;
  xp: number;
  level: number;
  streak: number;
  referral_code: string | null;
  referred_by_id: string | null; // UUID serialized as string
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
};

export type Device = {
  id: string;
  ip_address: string | null;
  user_agent: string | null;
  is_revoked: boolean;
  expires_at: string | null; // ISO datetime
  last_used_at: string | null; // ISO datetime
  created_at: string; // ISO datetime
};

export type ReferralSummary = {
  referral_code: string;
  invited_count: number;
  referral_url: string | null; // relative path e.g. "/register?ref=ABCD1234"
};

// ══════════════════════════════════════════════════════════════════════
// CLIENT-SIDE VALIDATION HELPERS
// Mirror the same rules enforced by backend schemas.py
// ══════════════════════════════════════════════════════════════════════

export type ValidationError = { field: string; message: string };

export function validateUpdateProfile(data: {
  full_name?: string;
  username?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (data.full_name !== undefined) {
    if (data.full_name.trim().length === 0)
      errors.push({ field: "full_name", message: "Name cannot be empty." });
    if (data.full_name.length > 255)
      errors.push({
        field: "full_name",
        message: "Name must be at most 255 characters.",
      });
  }

  if (data.username !== undefined) {
    if (data.username.length < 3)
      errors.push({
        field: "username",
        message: "Username must be at least 3 characters.",
      });
    if (data.username.length > 30)
      errors.push({
        field: "username",
        message: "Username must be at most 30 characters.",
      });
    if (!/^[a-zA-Z0-9_]+$/.test(data.username))
      errors.push({
        field: "username",
        message: "Username may only contain letters, numbers, and underscores.",
      });
  }

  return errors;
}

export function validatePassword(password: string): ValidationError[] {
  const errors: ValidationError[] = [];
  if (password.length < 8)
    errors.push({
      field: "password",
      message: "Password must be at least 8 characters.",
    });
  if (/\s/.test(password))
    errors.push({
      field: "password",
      message: "Password must not contain spaces.",
    });
  return errors;
}

// ══════════════════════════════════════════════════════════════════════
// INTERNAL HELPER
// ══════════════════════════════════════════════════════════════════════

function unwrap<T>(res: ApiResponse<T>): T {
  if (!res.success) throw new Error(res.message ?? "Request failed");
  return res.data as T;
}

// ══════════════════════════════════════════════════════════════════════
// USER API — mirrors app/modules/users/router.py
// ══════════════════════════════════════════════════════════════════════

export const userApi = {
  // ── Profile ──────────────────────────────────────────────────────────

  // GET /users/me
  async me(): Promise<User> {
    const res = await api.get<ApiResponse<User>>("/users/me");
    return unwrap(res.data);
  },

  // GET /users/me/referral
  async getReferral(): Promise<ReferralSummary> {
    const res =
      await api.get<ApiResponse<ReferralSummary>>("/users/me/referral");
    return unwrap(res.data);
  },

  // PUT /users/me — body: { full_name?, username?, meta? }
  // Rules: full_name max 255; username 3–30, alphanumeric+_ (lowercased by server)
  // Use validateUpdateProfile() before calling to surface errors early.
  async updateProfile(data: {
    full_name?: string;
    username?: string;
    meta?: Partial<UserMeta>;
  }): Promise<User> {
    const res = await api.put<ApiResponse<User>>("/users/me", data);
    return unwrap(res.data);
  },

  // DELETE /users/me — body: { password? }
  // password required when has_password=true
  async deleteAccount(password?: string): Promise<string> {
    const res = await api.delete<ApiResponse<null>>("/users/me", {
      data: password !== undefined ? { password } : {},
    });
    unwrap(res.data);
    return res.data.message ?? "Account deleted";
  },

  // ── Avatar ───────────────────────────────────────────────────────────

  // PATCH /users/me/avatar/upload — multipart/form-data, field: "avatar"
  // Accepted: image/jpeg, image/png, image/webp — max 2 MB
  // NOTE: do NOT set Content-Type manually; axios sets it with the correct
  // multipart boundary automatically when body is FormData.
  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("avatar", file);
    const res = await api.patch<ApiResponse<{ avatar: string }>>(
      "/users/me/avatar/upload",
      formData,
      // No Content-Type override — let axios/fetch set it with boundary
    );
    return unwrap(res.data).avatar;
  },

  // PATCH /users/me/avatar/url — body: { avatar_url }
  // avatar_url must start with https://
  async updateAvatarUrl(avatar_url: string): Promise<string> {
    const res = await api.patch<ApiResponse<{ avatar: string }>>(
      "/users/me/avatar/url",
      { avatar_url },
    );
    return unwrap(res.data).avatar;
  },

  // ── Password ─────────────────────────────────────────────────────────

  // POST /users/me/password/set — for social-login users (has_password=false)
  // Use validatePassword() before calling.
  async setPassword(new_password: string): Promise<string> {
    const res = await api.post<ApiResponse<null>>("/users/me/password/set", {
      new_password,
    });
    unwrap(res.data);
    return res.data.message ?? "Password set";
  },

  // POST /users/me/password/change — revokes all other sessions on success
  // Use validatePassword(new_password) before calling.
  async changePassword(data: {
    current_password: string;
    new_password: string;
  }): Promise<string> {
    const res = await api.post<ApiResponse<null>>(
      "/users/me/password/change",
      data,
    );
    unwrap(res.data);
    return res.data.message ?? "Password changed";
  },

  // ── Devices / Sessions ────────────────────────────────────────────────

  // GET /users/me/devices — active sessions only
  async getDevices(): Promise<Device[]> {
    const res = await api.get<ApiResponse<Device[]>>("/users/me/devices");
    return unwrap(res.data);
  },

  // DELETE /users/me/devices/{session_id}
  async revokeDevice(session_id: string): Promise<string> {
    const res = await api.delete<ApiResponse<null>>(
      `/users/me/devices/${session_id}`,
    );
    unwrap(res.data);
    return res.data.message ?? "Device revoked";
  },

  // DELETE /users/me/devices — keeps current_session_id, revokes all others
  async revokeOtherDevices(current_session_id: string): Promise<string> {
    const res = await api.delete<ApiResponse<null>>("/users/me/devices", {
      data: { current_session_id },
    });
    unwrap(res.data);
    return res.data.message ?? "Other devices revoked";
  },

  // ── Phone update (two-step OTP flow) ─────────────────────────────────

  // POST /users/me/phone/request — sends 6-digit OTP via email (60s cooldown)
  async requestPhoneUpdate(phone: string): Promise<{ expires_in: number }> {
    const res = await api.post<ApiResponse<{ expires_in: number }>>(
      "/users/me/phone/request",
      { phone },
    );
    return unwrap(res.data);
  },

  // POST /users/me/phone/verify — validates OTP and updates phone
  async verifyPhoneUpdate(
    phone: string,
    code: string,
  ): Promise<{ phone: string }> {
    const res = await api.post<ApiResponse<{ phone: string }>>(
      "/users/me/phone/verify",
      { phone, code },
    );
    return unwrap(res.data);
  },
};
