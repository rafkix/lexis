import { create } from "zustand"
import { persist } from "zustand/middleware"

type AuthState = {
  user: any
  setAccessToken(access_token: any): unknown
  refreshToken: any
  token: string | null
  hydrated: boolean
  setToken: (token: string) => void
  logout: () => void
  setHydrated: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      hydrated: false,

      setAccessToken: (access_token: any) => {
        try {
          localStorage.setItem("access_token", access_token)
        } catch {}
        set({ token: access_token })
      },

      setToken: (token) => set({ token }),

        logout: () => {
            try {
              localStorage.removeItem("access_token")
            } catch {}
            set({ token: null, user: null })
        },
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      },
    }
  )
)
