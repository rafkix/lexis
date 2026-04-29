// lib/api/client.ts
import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from "axios";

// ══════════════════════════════════════════════════════════════════════
// TOKEN STORE — single source of truth (used by all api modules)
// ══════════════════════════════════════════════════════════════════════

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

export const tokenStore = {
  getAccess(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_KEY);
  },

  getRefresh(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_KEY);
  },

  /** @deprecated use getAccess() / getRefresh() individually */
  get(): { access: string | null; refresh: string | null } {
    return { access: this.getAccess(), refresh: this.getRefresh() };
  },

  set(tokens: { access_token: string; refresh_token?: string }) {
    localStorage.setItem(ACCESS_KEY, tokens.access_token);
    if (tokens.refresh_token) {
      localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
    }
  },

  clear(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },

  hasToken(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem(ACCESS_KEY);
  },
};

// ══════════════════════════════════════════════════════════════════════
// AXIOS INSTANCE
// ══════════════════════════════════════════════════════════════════════

export const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ══════════════════════════════════════════════════════════════════════
// REQUEST INTERCEPTOR — attach Bearer token
// ══════════════════════════════════════════════════════════════════════

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ══════════════════════════════════════════════════════════════════════
// RESPONSE INTERCEPTOR — silent token refresh on 401
// ══════════════════════════════════════════════════════════════════════

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null): void {
  pendingQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  pendingQueue = [];
}

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    const refresh = tokenStore.getRefresh();
    if (!refresh) {
      tokenStore.clear();
      return Promise.reject(error);
    }

    // Queue concurrent requests while refresh is in progress
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((token) => {
        if (original.headers)
          original.headers["Authorization"] = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const res = await axios.post<{
        access_token: string;
        refresh_token: string;
      }>(
        `${api.defaults.baseURL}/auth/refresh`,
        { refresh_token: refresh },
        { headers: { "Content-Type": "application/json" } },
      );

      const { access_token, refresh_token } = res.data;
      tokenStore.set({
        access_token,
        refresh_token,
      });
      processQueue(null, access_token);

      if (original.headers)
        original.headers["Authorization"] = `Bearer ${access_token}`;
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      tokenStore.clear();
      if (typeof window !== "undefined") window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
