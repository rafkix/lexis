// lib/api/auth.ts
// All endpoints and types verified against:
//   app/modules/auth/router.py
//   app/modules/auth/schemas.py
//   app/modules/users/router.py
//   app/modules/users/schemas.py

import { api, tokenStore } from "./client";
import type {
  ApiResponse,
  User,
  UserMeta,
  IELTSMeta,
  CEFRMeta,
  IELTSGoal,
  CEFRGoal,
  CEFRLevel,
} from "./user";

// ══════════════════════════════════════════════════════════════════════
// TYPES — mirrors app/modules/auth/schemas.py
// ══════════════════════════════════════════════════════════════════════

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number; // seconds
};

export type MessageResponse = {
  success: boolean;
  message: string;
};

export type LogoutResponse = {
  success: boolean;
  message: string;
};

// mirrors AccountSetupCheckResponse
export type AccountSetupCheckResponse = {
  valid: boolean;
  user_id: string;
  full_name?: string | null;
  email?: string | null;
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

// mirrors DeviceResponse from app/modules/users/schemas.py
export type SessionResponse = {
  id: string;
  ip_address: string | null;
  user_agent: string | null;
  is_revoked: boolean;
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
};

// Meta types are defined in user.ts and imported above.
// Re-export them so existing consumers of auth.ts don't need to change imports.
export type { UserMeta, IELTSMeta, CEFRMeta, IELTSGoal, CEFRGoal, CEFRLevel };

// Re-export so consumers can import MeResponse from auth
export type MeResponse = User;

// ══════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════

function unwrap<T>(res: ApiResponse<T>): T {
  if (!res.success) throw new Error(res.message ?? "Request failed");
  return res.data as T;
}

function saveTokens(data: TokenResponse): void {
  tokenStore.set({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  });
}

// ══════════════════════════════════════════════════════════════════════
// AUTH API
// ══════════════════════════════════════════════════════════════════════

export const authApi = {
  // ── Register ─────────────────────────────────────────────────────
  // POST /auth/register
  // RegisterRequest: full_name, username?, email?, phone?, password
  // At least one of email or phone is required (validated by backend).
  async register(data: {
    full_name: string;
    username?: string;
    email?: string;
    phone?: string;
    password: string;
  }): Promise<TokenResponse> {
    const res = await api.post<TokenResponse>("/auth/register", data);
    saveTokens(res.data);
    return res.data;
  },

  // ── Login ────────────────────────────────────────────────────────
  // POST /auth/login
  // LoginRequest: identifier (username | email | phone), password
  async login(identifier: string, password: string): Promise<TokenResponse> {
    const res = await api.post<TokenResponse>("/auth/login", {
      identifier,
      password,
    });
    saveTokens(res.data);
    return res.data;
  },

  // ── Refresh ──────────────────────────────────────────────────────
  // POST /auth/refresh
  // RefreshRequest: refresh_token
  async refresh(refresh_token: string): Promise<TokenResponse> {
    const res = await api.post<TokenResponse>("/auth/refresh", {
      refresh_token,
    });
    saveTokens(res.data);
    return res.data;
  },

  // ── Logout ───────────────────────────────────────────────────────
  // POST /auth/logout  — body: { refresh_token }
  async logout(refresh_token: string): Promise<LogoutResponse> {
    try {
      const res = await api.post<LogoutResponse>("/auth/logout", {
        refresh_token,
      });
      return res.data;
    } finally {
      tokenStore.clear();
    }
  },

  // POST /auth/logout-all  — requires auth header
  async logoutAll(): Promise<LogoutResponse> {
    try {
      const res = await api.post<LogoutResponse>("/auth/logout-all");
      return res.data;
    } finally {
      tokenStore.clear();
    }
  },

  // ── Current user ─────────────────────────────────────────────────
  // GET /users/me  → ApiResponse<User>
  // NOTE: /auth/me does NOT exist. The user endpoint lives under /users/me.
  async me(): Promise<MeResponse> {
    const res = await api.get<ApiResponse<User>>("/users/me");
    return unwrap(res.data);
  },

  // ── Password — public (unauthenticated) ──────────────────────────
  // POST /auth/password/forgot  — body: { email }
  async forgotPassword(email: string): Promise<MessageResponse> {
    const res = await api.post<MessageResponse>("/auth/password/forgot", {
      email,
    });
    return res.data;
  },

  // POST /auth/password/reset  — body: { token, new_password }
  async resetPassword(
    token: string,
    new_password: string,
  ): Promise<MessageResponse> {
    const res = await api.post<MessageResponse>("/auth/password/reset", {
      token,
      new_password,
    });
    return res.data;
  },

  // ── Password — authenticated ──────────────────────────────────────
  // POST /users/me/password/set  — body: { new_password }
  // For social-login users who have no password yet.
  async setPassword(new_password: string): Promise<MessageResponse> {
    const res = await api.post<ApiResponse<null>>("/users/me/password/set", {
      new_password,
    });
    unwrap(res.data);
    return { success: true, message: res.data.message ?? "Password set" };
  },

  // POST /users/me/password/change  — body: { current_password, new_password }
  async changePassword(
    current_password: string,
    new_password: string,
  ): Promise<MessageResponse> {
    const res = await api.post<ApiResponse<null>>("/users/me/password/change", {
      current_password,
      new_password,
    });
    unwrap(res.data);
    return { success: true, message: res.data.message ?? "Password changed" };
  },

  // ── Email verification ────────────────────────────────────────────
  // POST /auth/email/verify  — body: { token }
  async verifyEmail(token: string): Promise<MessageResponse> {
    const res = await api.post<MessageResponse>("/auth/email/verify", {
      token,
    });
    return res.data;
  },

  // POST /auth/email/resend  — requires auth header
  async resendVerification(): Promise<MessageResponse> {
    const res = await api.post<MessageResponse>("/auth/email/resend");
    return res.data;
  },

  // ── Social auth ───────────────────────────────────────────────────
  // POST /auth/social/google  — body: { id_token }
  async loginGoogle(id_token: string): Promise<TokenResponse> {
    const res = await api.post<TokenResponse>("/auth/social/google", {
      id_token,
    });
    saveTokens(res.data);
    return res.data;
  },

  // POST /auth/social/telegram  — body: { telegram_data }
  async loginTelegram(telegram_data: TelegramAuthData): Promise<TokenResponse> {
    const res = await api.post<TokenResponse>("/auth/social/telegram", {
      telegram_data,
    });
    saveTokens(res.data);
    return res.data;
  },

  // POST /auth/social/google/link  — body: { id_token }  — requires auth
  async linkGoogle(id_token: string): Promise<MessageResponse> {
    const res = await api.post<MessageResponse>("/auth/social/google/link", {
      id_token,
    });
    return res.data;
  },

  // POST /auth/social/telegram/link  — body: { telegram_data }  — requires auth
  async linkTelegram(
    telegram_data: TelegramAuthData,
  ): Promise<MessageResponse> {
    const res = await api.post<MessageResponse>("/auth/social/telegram/link", {
      telegram_data,
    });
    return res.data;
  },

  // ── Account setup (exam-auto-created users) ───────────────────────
  // GET /auth/account-setup?token=...
  async checkAccountSetup(token: string): Promise<AccountSetupCheckResponse> {
    const res = await api.get<AccountSetupCheckResponse>(
      "/auth/account-setup",
      { params: { token } },
    );
    return res.data;
  },

  // POST /auth/account-setup
  // AccountSetupCompleteRequest: { token, username, password }
  async accountSetup(data: {
    token: string;
    username: string;
    password: string;
  }): Promise<TokenResponse> {
    const res = await api.post<TokenResponse>("/auth/account-setup", data);
    saveTokens(res.data);
    return res.data;
  },
};
