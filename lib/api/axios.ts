import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  withCredentials: true, // 🔥 COOKIE UCHUN SHART
  headers: {
    "Content-Type": "application/json",
  },
});

// ❗ TOKEN HEADER YO‘Q (cookie ishlatyapsan)

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        const currentUrl = window.location.href;

        window.location.href = `https://auth.enwis.uz?redirect=${encodeURIComponent(currentUrl)}`;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
