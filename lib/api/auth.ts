import api from './axios'

import {
  GoogleLoginPayload,
  TelegramLoginPayload,
  AuthResponse,
  UserMeResponse,
  LinkAccountPayload,
} from '../types/auth'

export const authService = {
  // =========================
  // 🔐 GOOGLE LOGIN
  // =========================
  googleLogin: async (payload: GoogleLoginPayload) => {
    const { data } = await api.post<AuthResponse>('/auth/google', payload)

    if (data.status === 'success') {
      authService.saveTokens(data)
    }

    return data
  },

  // =========================
  // 🔐 TELEGRAM LOGIN
  // =========================
  telegramLogin: async (payload: TelegramLoginPayload) => {
    const { data } = await api.post<AuthResponse>('/auth/telegram', payload)

    if (data.status === 'success') {
      authService.saveTokens(data)
    }

    return data
  },

  // =========================
  // 🔗 LINK ACCOUNT
  // =========================
  linkAccount: async (payload: LinkAccountPayload) => {
    const { data } = await api.post('/auth/link', payload)

    return data
  },

  // =========================
  // 👤 ME
  // =========================
  getMe: async (): Promise<UserMeResponse> => {
    const { data } = await api.get('/auth/me')
    return data
  },

  // =========================
  // 🚪 LOGOUT
  // =========================
  logout: async () => {
    try {
      await api.post('/auth/logout') // optional (agar backendda bo‘lsa)
    } catch (e) {}

    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')

    window.location.href = '/auth'
  },

  // =========================
  // 💾 SAVE TOKENS
  // =========================
  saveTokens: (data: AuthResponse) => {
    localStorage.setItem('access_token', data.access_token!)
    localStorage.setItem('refresh_token', data.refresh_token!)
  },
}