"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import clsx from "clsx"
import {
    LayoutDashboard,
    CreditCard,
    Receipt,
    Users,
    ClipboardList,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    ShieldCheck,
    Package,
} from "lucide-react"
import { useAdminAuth } from "@/lib/Adminauthcontext"

const NAV = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Foydalanuvchilar", href: "/admin/users", icon: Users },
    { label: "Planlar", href: "/admin/billing/plans", icon: Package },
    { label: "Obuna so'rovlar", href: "/admin/billing/requests", icon: ClipboardList },
    { label: "To'lovlar", href: "/admin/billing/payments", icon: Receipt },
    { label: "Obunalar", href: "/admin/billing/subscriptions", icon: CreditCard },
]

function Skeleton() {
    return (
        <div className="h-screen flex bg-gray-950 animate-pulse">
            <div className="w-60 bg-gray-900 border-r border-white/5" />
            <div className="flex-1 flex flex-col">
                <div className="h-14 bg-gray-900 border-b border-white/5" />
                <div className="flex-1 p-6 space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-gray-900 rounded-xl" />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { admin, loading, isAdmin, logout } = useAdminAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    useEffect(() => {
        if (!loading && (!admin || !isAdmin)) {
            router.replace("/admin/login")
        }
    }, [loading, admin, isAdmin, router])

    useEffect(() => {
        setMobileOpen(false)
    }, [pathname])

    if (loading) return <Skeleton />
    if (!admin || !isAdmin) return null

    const initials = admin.full_name
        ? admin.full_name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()
        : "A"

    const pageTitle = NAV.find((n) => pathname.startsWith(n.href))?.label ?? "Admin"

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div
                className={clsx(
                    "flex items-center border-b border-white/5 h-14 px-4",
                    collapsed ? "justify-center" : "justify-between"
                )}
            >
                {!collapsed && (
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-red-400" />
                        <span className="text-sm font-bold text-white">Admin Panel</span>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg hover:bg-white/10 text-gray-400 transition"
                >
                    {collapsed ? <Menu size={15} /> : <ChevronLeft size={15} />}
                </button>
                <button
                    onClick={() => setMobileOpen(false)}
                    className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400"
                >
                    <X size={15} />
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
                {NAV.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(item.href + "/")
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                                collapsed && "justify-center",
                                active
                                    ? "bg-red-600/20 text-red-400 border border-red-500/20"
                                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                            )}
                        >
                            <Icon size={16} className="shrink-0" />
                            {!collapsed && <span>{item.label}</span>}
                        </Link>
                    )
                })}
            </nav>

            {/* User footer */}
            <div className={clsx("border-t border-white/5 p-3", collapsed ? "flex flex-col items-center gap-3" : "space-y-3")}>
                {!collapsed && (
                    <div className="flex items-center gap-2.5 px-1">
                        <div className="w-8 h-8 rounded-full bg-red-900/50 text-red-300 flex items-center justify-center text-xs font-bold shrink-0">
                            {initials}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-200 truncate">{admin.full_name || admin.username}</p>
                            <p className="text-[11px] text-gray-500 truncate">{admin.email}</p>
                        </div>
                    </div>
                )}
                {collapsed && (
                    <div className="w-8 h-8 rounded-full bg-red-900/50 text-red-300 flex items-center justify-center text-xs font-bold">
                        {initials}
                    </div>
                )}
                <button
                    onClick={() => { logout(); router.replace("/admin/login") }}
                    className={clsx(
                        "flex items-center gap-2 text-sm text-gray-500 hover:text-red-400 transition rounded-lg px-2 py-1.5 hover:bg-red-500/10 w-full",
                        collapsed && "justify-center"
                    )}
                >
                    <LogOut size={14} />
                    {!collapsed && <span>Chiqish</span>}
                </button>
            </div>
        </div>
    )

    return (
        <div className="flex h-screen bg-gray-950 overflow-hidden">
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-20 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar desktop */}
            <aside
                className={clsx(
                    "hidden md:flex flex-col bg-gray-900 border-r border-white/5 transition-all duration-200 shrink-0",
                    collapsed ? "w-14" : "w-56"
                )}
            >
                <SidebarContent />
            </aside>

            {/* Sidebar mobile */}
            <aside
                className={clsx(
                    "fixed inset-y-0 left-0 z-30 flex flex-col bg-gray-900 border-r border-white/5 w-60 transition-transform duration-200 md:hidden",
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <SidebarContent />
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-gray-900 border-b border-white/5 h-14 px-4 md:px-6 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400"
                        >
                            <Menu size={17} />
                        </button>
                        <h1 className="font-semibold text-gray-200 text-sm md:text-base">{pageTitle}</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-medium text-gray-300 leading-tight">{admin.full_name}</p>
                            <p className="text-[11px] text-gray-600">Admin</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-red-900/50 text-red-300 flex items-center justify-center text-xs font-bold shrink-0">
                            {initials}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
            </div>
        </div>
    )
}