"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { authService } from "@/lib/api/auth"
import { useRouter } from "next/navigation"
import type { UserMeResponse, AuthResponse } from "@/lib/types/auth"

interface AuthContextType {
  user: UserMeResponse | null
  loading: boolean

  googleLogin: (token: string) => Promise<AuthResponse>
  telegramLogin: (data: any) => Promise<AuthResponse>
  linkAccount: (payload: any) => Promise<void>

  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserMeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    const initAuth = async () => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("access_token")
          : null

      if (!token) {
        setLoading(false)
        return
      }

      try {
        const userData = await authService.getMe()
        setUser(userData)
      } catch (error) {
        console.error("Auth Init Failed:", error)
        localStorage.removeItem("access_token")
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  // =========================
  // 🔐 GOOGLE LOGIN
  // =========================
  const googleLogin = async (token: string) => {
    setLoading(true)

    try {
      const res = await authService.googleLogin({ token })

      if (res.status === "success") {
        const userData = await authService.getMe()
        setUser(userData)
        router.push("/")
      }

      return res
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // 🔐 TELEGRAM LOGIN
  // =========================
  const telegramLogin = async (data: any) => {
    setLoading(true)

    try {
      const res = await authService.telegramLogin({ data })

      if (res.status === "success") {
        const userData = await authService.getMe()
        setUser(userData)
        router.push("/")
      }

      return res
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // 🔗 LINK ACCOUNT
  // =========================
  const linkAccount = async (payload: any) => {
    await authService.linkAccount(payload)

    // 🔥 userni yangilaymiz
    await refreshUser()
  }

  // =========================
  // 🚪 LOGOUT
  // =========================
  const logout = () => {
    authService.logout()
    setUser(null)
    router.push("/auth")
  }

  // =========================
  // 🔄 REFRESH USER
  // =========================
  const refreshUser = async () => {
    const token = localStorage.getItem("access_token")
    if (!token) return

    try {
      const userData = await authService.getMe()
      setUser(userData)
    } catch (error) {
      console.error("User refresh failed", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        googleLogin,
        telegramLogin,
        linkAccount,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// =========================
// HOOK
// =========================
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}