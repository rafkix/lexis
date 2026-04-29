"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useAdminAuth, AdminAuthProvider } from "@/lib/Adminauthcontext"
import {
    LayoutDashboard, Users, CreditCard, Receipt,
    Tag, Bell, Settings, LogOut, ChevronLeft,
    ShieldCheck, Menu, Loader2, TicketPercent,
    BookOpen,
} from "lucide-react"
import type { AdminUser } from "@/lib/types/admin"

const NAV = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/ielts_reading", label: "IELTS Reading", icon: BookOpen },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/plans", label: "Plans", icon: Tag },
    { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
    { href: "/admin/payments", label: "Payments", icon: Receipt },
    { href: "/admin/promo-codes", label: "Promo Codes", icon: TicketPercent },
    { href: "/admin/notifications", label: "Notifications", icon: Bell },
    { href: "/admin/settings", label: "Settings", icon: Settings },
]

interface SidebarProps {
    admin: AdminUser
    pathname: string
    collapsed: boolean
    onLinkClick: () => void
    onLogout: () => void
}

function SidebarContent({ admin, pathname, collapsed, onLinkClick, onLogout }: SidebarProps) {
    return (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={`flex items-center gap-3 px-4 h-16 border-b border-white/[0.06] ${collapsed ? "justify-center" : ""}`}>
                <div className="w-8 h-8 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-red-400" />
                </div>
                {!collapsed && (
                    <div>
                        <div className="text-sm font-bold text-white tracking-tight leading-none">Lexis</div>
                        <div className="text-[10px] text-gray-600 mt-0.5">Admin Panel</div>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
                {NAV.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href || pathname.startsWith(href + "/")
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={onLinkClick}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group relative
                                ${active
                                    ? "bg-red-500/[0.12] text-red-400 border border-red-500/20"
                                    : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]"
                                } ${collapsed ? "justify-center" : ""}`}
                        >
                            <Icon className={`w-4 h-4 shrink-0 ${active ? "text-red-400" : ""}`} />
                            {!collapsed && <span className="font-medium">{label}</span>}
                            {active && !collapsed && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-400" />
                            )}
                            {collapsed && (
                                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#1a1a2e] border border-white/[0.08] rounded-lg text-xs text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                                    {label}
                                </div>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* User + Logout */}
            <div className="p-3 border-t border-white/[0.06]">
                {!collapsed && (
                    <div className="flex items-center gap-2.5 px-3 py-2 mb-2 rounded-xl bg-white/[0.03]">
                        <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-red-400">
                                {admin.full_name?.[0]?.toUpperCase() ?? "A"}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-white truncate">
                                {admin.full_name ?? admin.username}
                            </div>
                            <div className="text-[10px] text-gray-600 truncate">{admin.email}</div>
                        </div>
                    </div>
                )}
                <button
                    onClick={onLogout}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/[0.08] transition-all ${collapsed ? "justify-center" : ""}`}
                >
                    <LogOut className="w-4 h-4 shrink-0" />
                    {!collapsed && <span>Log out</span>}
                </button>
            </div>
        </div>
    )
}

// ─── Main layout ────────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminAuthProvider>
            <AdminLayoutInner>{children}</AdminLayoutInner>
        </AdminAuthProvider>
    )
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
    const { admin, logout, loading } = useAdminAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    // ✅ Login sahifasini sidebar'siz ko'rsatish
    const isLoginPage = pathname === "/admin/login"

    useEffect(() => {
        if (!loading && !admin && !isLoginPage) router.replace("/admin/login")
    }, [admin, loading, router, isLoginPage])

    // ✅ Login sahifasi — faqat children, hech qanday layout yo'q
    if (isLoginPage) return <>{children}</>

    if (loading) {
        return (
            <div className="min-h-screen bg-[#080810] flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-red-400 animate-spin" />
            </div>
        )
    }

    if (!admin) return null

    const handleLogout = async () => {
        await logout()
        router.replace("/admin/login")
    }

    const sidebarProps: SidebarProps = {
        admin,
        pathname,
        collapsed,
        onLinkClick: () => setMobileOpen(false),
        onLogout: handleLogout,
    }

    return (
        <div className="min-h-screen bg-[#080810] flex">
            {/* Grid background */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)`,
                    backgroundSize: "48px 48px",
                }}
            />

            {/* Desktop Sidebar */}
            <aside
                className={`hidden lg:flex flex-col fixed left-0 top-0 h-full bg-[#0c0c18] border-r border-white/[0.06] transition-all duration-300 z-30
                    ${collapsed ? "w-[60px]" : "w-[220px]"}`}
            >
                <SidebarContent {...sidebarProps} />
                <button
                    onClick={() => setCollapsed((c) => !c)}
                    className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-[#1a1a2e] border border-white/[0.1] flex items-center justify-center text-gray-500 hover:text-white transition"
                >
                    <ChevronLeft className={`w-3 h-3 transition-transform ${collapsed ? "rotate-180" : ""}`} />
                </button>
            </aside>

            {/* Mobile sidebar overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
                    <aside className="absolute left-0 top-0 h-full w-[220px] bg-[#0c0c18] border-r border-white/[0.06] z-50">
                        <SidebarContent {...sidebarProps} />
                    </aside>
                </div>
            )}

            {/* Main */}
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? "lg:ml-[60px]" : "lg:ml-[220px]"}`}>
                {/* Top bar */}
                <header className="sticky top-0 z-20 h-14 bg-[#080810]/80 backdrop-blur border-b border-white/[0.05] flex items-center px-4 gap-3">
                    <button
                        className="lg:hidden text-gray-500 hover:text-white transition"
                        onClick={() => setMobileOpen(true)}
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <span>Admin</span>
                        <span>/</span>
                        <span className="text-gray-400 capitalize">
                            {pathname.split("/").filter(Boolean).slice(1).join(" / ") || "Dashboard"}
                        </span>
                    </div>
                </header>

                <main className="flex-1 p-6 relative z-10">
                    {children}
                </main>
            </div>
        </div>
    )
}