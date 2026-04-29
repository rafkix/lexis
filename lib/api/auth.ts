// lib/api/auth.ts
import { api, tokenStore } from "./client";

// ══════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
};

export type UserMeta = {
  version?: number;
  bio?: string;
  birth_date?: string;
  ielts?: {
    current_score?: number;
    target_score?: number;
    listening?: number;
    reading?: number;
    writing?: number;
    speaking?: number;
    exam_date?: string;
  };
  cefr?: {
    level?: string;
    target_level?: string;
    goal?: string;
  };
};

export type MeResponse = {
  id: string;
  public_id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  phone_verified: boolean;
  telegram_id: string | null;
  avatar: string | null;
  is_verified: boolean;
  is_active: boolean;
  status: "active" | "blocked" | "pending";
  roles: string[];
  meta: UserMeta | null;
  has_active_subscription: boolean;
};

export type SessionResponse = {
  id: string;
  ip_address: string | null;
  user_agent: string | null;
  is_revoked: boolean;
  expires_at: string;
  last_used_at: string | null;
  created_at: string;
};

export type TelegramAuthData = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

export type MessageResponse = { message: string };

// ══════════════════════════════════════════════════════════════════════
// AUTH API
// ══════════════════════════════════════════════════════════════════════

export const authApi = {
  // POST /auth/register
  async register(data: {
    full_name: string;
    username?: string;
    email?: string;
    phone?: string;
    password: string;
  }): Promise<TokenResponse> {
    const res = await api.post<TokenResponse>("/auth/register", data);
    tokenStore.set({
      access_token: res.data.access_token,
      refresh_token: res.data.refresh_token,
    });
    return res.data;
  },

  // POST /auth/login
  async login(identifier: string, password: string): Promise<TokenResponse> {
    const res = await api.post<TokenResponse>("/auth/login", {
      identifier,
      password,
    });
    tokenStore.set({
      access_token: res.data.access_token,
      refresh_token: res.data.refresh_token,
    });
    return res.data;
  },

  // POST /auth/google
  async loginGoogle(id_token: string): Promise<TokenResponse> {
    const res = await api.post<TokenResponse>("/auth/google", {
      provider: "google",
      id_token,
    });
    tokenStore.set({
      access_token: res.data.access_token,
      refresh_token: res.data.refresh_token,
    });
    return res.data;
  },

  // POST /auth/telegram
  async loginTelegram(telegram_data: TelegramAuthData): Promise<TokenResponse> {
    const res = await api.post<TokenResponse>("/auth/telegram", {
      provider: "telegram",
      telegram_data,
    });
    tokenStore.set({
      access_token: res.data.access_token,
      refresh_token: res.data.refresh_token,
    });
    return res.data;
  },

  // POST /auth/refresh
  async refresh(refresh_token: string): Promise<TokenResponse> {
    const res = await api.post<TokenResponse>("/auth/refresh", {
      refresh_token,
    });
    tokenStore.set({
      access_token: res.data.access_token,
      refresh_token: res.data.refresh_token,
    });
    return res.data;
  },

  // GET /auth/me
  async me(): Promise<MeResponse> {
    const res = await api.get<MeResponse>("/auth/me");
    return res.data;
  },

  // GET /auth/sessions
  async getSessions(): Promise<SessionResponse[]> {
    const res = await api.get<SessionResponse[]>("/auth/sessions");
    return res.data;
  },

  // DELETE /auth/sessions/{session_id}
  async revokeSession(session_id: string): Promise<MessageResponse> {
    const res = await api.delete<MessageResponse>(
      `/auth/sessions/${session_id}`,
    );
    return res.data;
  },

  // POST /auth/logout
  async logout(refresh_token: string): Promise<void> {
    try {
      await api.post("/auth/logout", { refresh_token });
    } finally {
      tokenStore.clear();
    }
  },

  // POST /auth/logout-all
  async logoutAll(): Promise<void> {
    try {
      await api.post("/auth/logout-all");
    } finally {
      tokenStore.clear();
    }
  },

  // POST /auth/set-password
  async setPassword(new_password: string): Promise<MessageResponse> {
    const res = await api.post<MessageResponse>("/auth/set-password", {
      new_password,
    });
    return res.data;
  },

  // POST /auth/change-password
  async changePassword(
    current_password: string,
    new_password: string,
  ): Promise<MessageResponse> {
    const res = await api.post<MessageResponse>("/auth/change-password", {
      current_password,
      new_password,
    });
    return res.data;
  },

  // POST /auth/forgot-password
  async forgotPassword(email: string): Promise<MessageResponse> {
    const res = await api.post<MessageResponse>("/auth/forgot-password", {
      email,
    });
    return res.data;
  },

  // POST /auth/reset-password
  async resetPassword(
    token: string,
    new_password: string,
  ): Promise<MessageResponse> {
    const res = await api.post<MessageResponse>("/auth/reset-password", {
      token,
      new_password,
    });
    return res.data;
  },

  // POST /auth/phone/send-code
  async sendPhoneCode(phone: string): Promise<MessageResponse> {
    const res = await api.post<MessageResponse>("/auth/phone/send-code", {
      phone,
    });
    return res.data;
  },

  // POST /auth/phone/verify
  async verifyPhone(phone: string, code: string): Promise<MessageResponse> {
    const res = await api.post<MessageResponse>("/auth/phone/verify", {
      phone,
      code,
    });
    return res.data;
  },
};
