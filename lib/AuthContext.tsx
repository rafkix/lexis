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
// CONSTANTS
// =====================================================

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/about',
  '/pricing',
  '/contact',
  '/careers',
  '/admin',
  '/admin/login',
]

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )
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
    const access = tokenStore.getAccess()

    if (!access) {
      setUser(null)
      setLoading(false)

      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname
        if (!isPublicRoute(pathname)) {
          // Save intended destination so we can redirect back after login
          sessionStorage.setItem(
            'redirect_after_login',
            pathname + window.location.search
          )
          router.replace('/login')
        }
      }
      return
    }

    try {
      // GET /auth/me — returns MeResponse with has_active_subscription
      const me = await authApi.me()

      // Derive has_password: /auth/me doesn't return it, but /users/me does.
      // We set a default of true here; the settings page uses /users/me directly
      // which returns has_password from the UserResponse schema.
      if (me.has_password === undefined) {
        me.has_password = true
      }

      setUser(me)
    } catch {
      setUser(null)
      tokenStore.clear()
    } finally {
      setLoading(false)
    }
  }, [router])

  const logout = useCallback(async () => {
    const refresh = tokenStore.getRefresh()
    if (refresh) {
      // POST /auth/logout  — body: { refresh_token }
      await authApi.logout(refresh).catch(() => { })
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