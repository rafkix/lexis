// lib/api/user.ts
import { api } from "./client";
import type { UserMeta } from "./auth";

// ══════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

export type User = {
  id: string;
  public_id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  phone_verified: boolean;
  avatar: string | null;
  status: "active" | "blocked" | "pending";
  is_verified: boolean;
  is_active: boolean;
  roles: string[];
  meta?: UserMeta | null;
  has_password: boolean;
};

export type Device = {
  id: string;
  ip_address: string | null;
  user_agent: string | null;
  expires_at: string | null;
  created_at: string;
};

// ══════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════

function unwrap<T>(res: ApiResponse<T>): T {
  if (!res.success) throw new Error(res.message ?? "Request failed");
  return res.data as T;
}

// ══════════════════════════════════════════════════════════════════════
// USER API
// ══════════════════════════════════════════════════════════════════════

export const userApi = {
  // GET /users/me
  async me(): Promise<User> {
    const res = await api.get<ApiResponse<User>>("/users/me");
    return unwrap(res.data);
  },

  // PUT /users/me
  async updateProfile(data: {
    full_name?: string;
    username?: string;
    meta?: Partial<UserMeta>;
  }): Promise<User> {
    const res = await api.put<ApiResponse<User>>("/users/me", data);
    return unwrap(res.data);
  },

  // DELETE /users/me
  async deleteAccount(password?: string): Promise<string> {
    const res = await api.delete<ApiResponse<null>>("/users/me", {
      data: { password },
    });
    unwrap(res.data);
    return res.data.message ?? "Account deleted";
  },

  // ── Avatar ──────────────────────────────────────────────────────────

  // PATCH /users/me/avatar/upload  (multipart/form-data)
  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("avatar", file);
    const res = await api.patch<ApiResponse<{ avatar: string }>>(
      "/users/me/avatar/upload",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return unwrap(res.data).avatar;
  },

  // PATCH /users/me/avatar/url
  async updateAvatarUrl(avatar_url: string): Promise<string> {
    const res = await api.patch<ApiResponse<{ avatar: string }>>(
      "/users/me/avatar/url",
      { avatar_url },
    );
    return unwrap(res.data).avatar;
  },

  // ── Password ────────────────────────────────────────────────────────

  // POST /users/me/password/set
  async setPassword(new_password: string): Promise<string> {
    const res = await api.post<ApiResponse<null>>("/users/me/password/set", {
      new_password,
    });
    unwrap(res.data);
    return res.data.message ?? "Password set";
  },

  // POST /users/me/password/change
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

  // ── Devices / Sessions ──────────────────────────────────────────────

  // GET /users/me/devices
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

  // DELETE /users/me/devices  (body: current_session_id)
  async revokeOtherDevices(current_session_id: string): Promise<string> {
    const res = await api.delete<ApiResponse<null>>("/users/me/devices", {
      data: { current_session_id },
    });
    unwrap(res.data);
    return res.data.message ?? "Other devices revoked";
  },

  // ── Phone ────────────────────────────────────────────────────────────

  // POST /users/me/phone/request
  async requestPhoneUpdate(phone: string): Promise<{ expires_in: number }> {
    const res = await api.post<ApiResponse<{ expires_in: number }>>(
      "/users/me/phone/request",
      { phone },
    );
    return unwrap(res.data);
  },

  // POST /users/me/phone/verify
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
