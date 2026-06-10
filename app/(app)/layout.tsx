'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { DesktopSidebar, MobileSidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'

// ─── Full-screen route detection ─────────────────────────────────────────────

const FULLSCREEN_PATTERNS: RegExp[] = [
    /^\/tests\/ielts\/reading\/[^/]+$/,
    /^\/tests\/ielts\/reading\/[^/]+\/result\/[^/]+$/,   // ← tuzatildi
    /^\/tests\/ielts\/listening\/[^/]+$/,
    /^\/tests\/ielts\/writing\/[^/]+$/,
    /^\/tests\/ielts\/speaking\/[^/]+$/,
    /^\/tests\/ielts\/[^/]+$/,
    /^\/tests\/[^/]+$/,
]

function isFullscreenRoute(pathname: string): boolean {
    return FULLSCREEN_PATTERNS.some((pattern) => pattern.test(pathname))
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LayoutSkeleton() {
    return (
        <div className="h-screen flex bg-[#f8f9fd] overflow-hidden">
            <div className="hidden md:block w-[252px] shrink-0 bg-white border-r border-[#eef1f7] animate-pulse" />
            <div className="flex-1 flex flex-col">
                <div className="h-[72px] bg-white border-b border-[#eef1f7] animate-pulse" />
                <div className="flex-1 p-8 space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    )
}

// ─── DashboardLayout ──────────────────────────────────────────────────────────

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, loading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    const [mobileOpen, setMobileOpen] = useState(false)
    const [collapsed, setCollapsed] = useState(false)

    const fullscreen = isFullscreenRoute(pathname)

    useEffect(() => {
        try {
            if (localStorage.getItem('lexis-sidebar-collapsed') === 'true') {
                setCollapsed(true)
            }
        } catch { }
    }, [])

    const toggleCollapsed = () => {
        setCollapsed((prev) => {
            const next = !prev
            try {
                localStorage.setItem('lexis-sidebar-collapsed', String(next))
            } catch { }
            return next
        })
    }

    useEffect(() => {
        setMobileOpen(false)
    }, [pathname])

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login')
        }
    }, [loading, user, router])

    if (loading) return <LayoutSkeleton />
    if (!user) return null

    if (fullscreen) {
        return <>{children}</>
    }

    const streak = user.streak ?? 0
    const xp = user.xp ?? 0
    const level = user.level ?? 1

    return (
        <div className="flex h-screen overflow-hidden bg-[#f8f9fd]">
            <DesktopSidebar
                collapsed={collapsed}
                toggleCollapsed={toggleCollapsed}
            />
            <MobileSidebar
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
            />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Topbar
                    onMenuClick={() => setMobileOpen(true)}
                    user={{
                        full_name: user.full_name ?? undefined,
                        username: user.username ?? undefined,
                        avatar_url: user.avatar ?? undefined,
                        streak,
                        xp,
                        level,
                    }}
                />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}