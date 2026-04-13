// =========================
// 🔐 GOOGLE LOGIN
// =========================
export interface GoogleLoginPayload {
  token: string // ⚠️ id_token emas → backend "token" kutadi
}


// =========================
// 🔐 TELEGRAM LOGIN
// =========================
export interface TelegramLoginPayload {
  data: {
    id: number
    first_name: string
    last_name?: string
    username?: string
    photo_url?: string
    auth_date: number
    hash: string
  }
}


// =========================
// 🔗 LINK ACCOUNT
// =========================
export interface LinkAccountPayload {
  provider: 'google' | 'telegram'
  provider_id: string
}


// =========================
// 🔐 AUTH RESPONSE
// =========================
export type AuthResponse =
  | {
      status: 'success'
      access_token: string
      refresh_token: string
    }
  | {
      status: 'link_required'
      email: string
    }


// =========================
// 👤 USER (ME)
// =========================
export interface UserMeResponse {
  id: string

  full_name: string
  username?: string
  email?: string
  avatar?: string

  roles: string[]
}