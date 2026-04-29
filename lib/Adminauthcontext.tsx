"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { adminAuthApi, adminTokenStore } from "@/lib/api/admin"
import type { AdminUser } from "@/lib/types/admin"
import { tokenStore } from "@/lib/api/tokenStore"

interface AdminAuthCtx {
    admin: AdminUser | null
    loading: boolean
    isAdmin: boolean
    login: (identifier: string, password: string) => Promise<void>
    logout: () => Promise<void>
    refresh: () => Promise<void>
}

const Ctx = createContext<AdminAuthCtx | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
    const [admin, setAdmin] = useState<AdminUser | null>(null)
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(async () => {
        if (!adminTokenStore.getAccess()) {
            setAdmin(null)
            setLoading(false)
            return
        }
        try {
            const me = await adminAuthApi.me()
            setAdmin(me)
        } catch {
            setAdmin(null)
            adminTokenStore.clear()
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { refresh() }, [refresh])

    const login = async (identifier: string, password: string) => {
        const tokens = await adminAuthApi.login(identifier, password)

        // 🔥 CRITICAL FIX
        tokenStore.set(tokens)

        await refresh()
    }

    const logout = async () => {
        await adminAuthApi.logout()
        setAdmin(null)
    }

    const isAdmin =
        admin?.roles?.some((r) => ["ADMIN", "superadmin"].includes(r)) ?? false

    return (
        <Ctx.Provider value={{ admin, loading, isAdmin, login, logout, refresh }}>
            {children}
        </Ctx.Provider>
    )
}

export function useAdminAuth() {
    const ctx = useContext(Ctx)
    if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider")
    return ctx
}