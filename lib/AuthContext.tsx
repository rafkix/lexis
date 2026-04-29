'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import { authApi, MeResponse } from '@/lib/api/auth'
import { tokenStore } from '@/lib/api/client'

// =====================================================
// TYPES
// =====================================================

type AuthState = {
  user: MeResponse | null
  loading: boolean
  isAuthenticated: boolean
}

type AuthContextValue = AuthState & {
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

// =====================================================
// CONTEXT
// =====================================================

const AuthContext = createContext<AuthContextValue | null>(null)

// =====================================================
// PROVIDER
// =====================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const refresh = useCallback(async () => {
    const { access } = tokenStore.get()
    const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password', '/about', '/pricing']
    // refresh() ichida:
    if (!access) {
      setUser(null)
      setLoading(false)

      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname

        // ✅ Public route bo'lsa redirect qilma
        const isPublic = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))
        if (!isPublic) {
          sessionStorage.setItem('redirect_after_login', pathname + window.location.search)
          router.replace('/login')
        }
      }

      return
    }

    try {
      const me = await authApi.me()
      setUser(me)
    } catch {
      setUser(null)
      tokenStore.clear()
    } finally {
      setLoading(false)
    }
  }, [router])

  // FIX: logout tokenni tozalab redirect qiladi
  const logout = useCallback(async () => {
    const { refresh: refreshToken } = tokenStore.get()
    if (refreshToken) {
      await authApi.logout(refreshToken).catch(() => { })
    }
    tokenStore.clear()
    setUser(null)
    router.replace('/login')
  }, [router])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated: !!user, refresh, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// =====================================================
// HOOK
// =====================================================

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
