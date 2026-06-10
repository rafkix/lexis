'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    ChevronLeft, ChevronRight, Crown, X,
    LayoutDashboard, BookMarked, Target, AlignLeft,
    BarChart2, Trophy, Settings, LogOut,
    Wallet,
    User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useAuth } from '@/lib/AuthContext'

// ─── Navigation items ─────────────────────────────────────────────────────────

export const NAV_ITEMS = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Practice", href: "/practice", icon: Target },
    // { label: "Mock Exams", href: "/exams", icon: BookOpen },
    // { label: "Analytics", href: "/analytics", icon: BarChart2 },
    { label: "Billing", href: "/billing", icon: Wallet },
    { label: "Profile", href: "/profile", icon: User },
    { label: "Settings", href: "/settings", icon: Settings },
];


// ─── Logo ─────────────────────────────────────────────────────────────────────

function LexisLogo({ collapsed }: { collapsed: boolean }) {
    if (collapsed) {
        return (
            <div className="flex items-center justify-center">
                <Image
                    src="/android-chrome-512x512.png"
                    alt="Lexis"
                    width={40}
                    height={40}
                    priority
                    className="h-10 w-10 object-contain"
                />
            </div>
        )
    }

    return (
        <div className="flex items-center">
            <Image
                src="/icon.png"
                alt="Lexis"
                width={140}
                height={40}
                priority
                className="h-10 w-auto object-contain"
            />
        </div>
    )
}

// ─── Collapsed tooltip ────────────────────────────────────────────────────────

function Tooltip({ label }: { label: string }) {
    return (
        <span
            className="
                absolute left-full ml-3 px-3 py-1.5 rounded-xl z-50
                text-xs font-semibold whitespace-nowrap
                bg-[#1e1b4b] text-white shadow-xl
                opacity-0 group-hover:opacity-100 pointer-events-none
                transition-opacity duration-150
            "
        >
            {label}
        </span>
    )
}

// ─── Nav link ─────────────────────────────────────────────────────────────────

function NavLink({
    item,
    collapsed,
}: {
    item: (typeof NAV_ITEMS)[0]
    collapsed: boolean
}) {
    const pathname = usePathname()
    const active =
        pathname === item.href ||
        (item.href !== '/dashboard' && pathname.startsWith(item.href))
    const Icon = item.icon

    return (
        <Link
            href={item.href}
            className={cn(
                'group relative flex items-center transition-all duration-200 select-none',
                collapsed
                    ? 'w-11 h-11 mx-auto justify-center rounded-2xl'
                    : 'h-11 px-3.5 rounded-2xl gap-3',
                active
                    ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-[0_8px_20px_rgba(99,102,241,0.35)]'
                    : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
            )}
        >
            <Icon size={18} strokeWidth={2.2} className="shrink-0" />
            {!collapsed && (
                <span className="text-[13.5px] font-semibold">{item.label}</span>
            )}
            {collapsed && <Tooltip label={item.label} />}
        </Link>
    )
}

// ─── Premium upsell card ──────────────────────────────────────────────────────

function PremiumCard() {
    const router = useRouter()

    return (
        <div
            onClick={() => router.push('/billing')}
            className="mx-3 mb-4 rounded-[22px] p-4 overflow-hidden relative cursor-pointer"
            style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                boxShadow: '0 12px 28px rgba(79,70,229,0.3)',
            }}
        >
            {/* Decorative circles */}
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
            <div className="absolute -bottom-3 -left-3 w-14 h-14 rounded-full bg-white/10" />

            <Crown size={22} className="text-amber-300 mb-2.5 relative z-10" />
            <h3 className="text-white font-bold text-[14px] leading-snug relative z-10">
                Go Premium
            </h3>
            <p className="text-indigo-200 text-[11.5px] leading-relaxed mt-1 mb-3.5 relative z-10">
                Unlock AI feedback, advanced analytics, and all premium modules.
            </p>
            <button
                onClick={(e) => { e.stopPropagation(); router.push('/billing') }}
                className="
                    block w-full py-2.5 rounded-xl text-center
                    bg-white text-indigo-600 text-[12.5px] font-bold
                    hover:bg-indigo-50 transition-colors relative z-10
                "
            >
                Upgrade →
            </button>
        </div>
    )
}

// ─── Logout button ────────────────────────────────────────────────────────────

function LogoutButton({ collapsed }: { collapsed: boolean }) {
    const { logout } = useAuth()

    return (
        <button
            onClick={() => logout()}
            className={cn(
                'group relative flex items-center transition-all duration-200 select-none w-full',
                collapsed
                    ? 'w-11 h-11 mx-auto justify-center rounded-2xl'
                    : 'h-11 px-3.5 rounded-2xl gap-3',
                'text-slate-400 hover:bg-rose-50 hover:text-rose-500'
            )}
        >
            <LogOut size={18} strokeWidth={2.2} className="shrink-0" />
            {!collapsed && (
                <span className="text-[13.5px] font-semibold">Log out</span>
            )}
            {collapsed && <Tooltip label="Log out" />}
        </button>
    )
}

// ─── Shared sidebar content ───────────────────────────────────────────────────
// Used by both the desktop sidebar and the mobile drawer.

function SidebarContent({
    collapsed,
    onClose,
    toggleCollapsed,
    isMobile = false,
}: {
    collapsed: boolean
    onClose?: () => void
    toggleCollapsed?: () => void
    isMobile?: boolean
}) {
    // In mobile mode the sidebar is always expanded, so we only apply the
    // collapsed state on desktop.
    const isCollapsed = collapsed && !isMobile

    return (
        <div className="flex flex-col h-full relative">
            {/* Logo row */}
            <div
                className={cn(
                    'h-[72px] flex items-center shrink-0',
                    isCollapsed ? 'justify-center' : 'px-5'
                )}
            >
                <LexisLogo collapsed={isCollapsed} />

                {isMobile && onClose && (
                    <button
                        onClick={onClose}
                        aria-label="Close menu"
                        className="ml-auto w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Divider */}
            <div className="mx-4 mb-3 h-px bg-slate-100" />

            {/* Section label — hidden when collapsed */}
            {!isCollapsed && (
                <p className="px-5 pb-2 text-[10px] font-bold tracking-widest uppercase text-slate-400">
                    Menu
                </p>
            )}

            {/* Navigation links */}
            <nav
                className={cn(
                    'flex-1 overflow-y-auto space-y-1 py-1',
                    isCollapsed ? 'px-2' : 'px-3'
                )}
            >
                {NAV_ITEMS.map((item) => (
                    <NavLink key={item.href} item={item} collapsed={isCollapsed} />
                ))}
            </nav>

            {/* Log out */}
            <div className={cn('pb-2', isCollapsed ? 'px-2' : 'px-3')}>
                <LogoutButton collapsed={isCollapsed} />
            </div>

            {/* Premium card — only shown when the sidebar is expanded */}
            {!isCollapsed && <PremiumCard />}

            {/* Collapse toggle — desktop only */}
            {!isMobile && toggleCollapsed && (
                <button
                    onClick={toggleCollapsed}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    className="
                        absolute -right-3.5 top-[72px]
                        w-7 h-7 rounded-full z-20
                        flex items-center justify-center
                        bg-indigo-600 text-white
                        shadow-[0_4px_14px_rgba(79,70,229,0.4)]
                        hover:bg-indigo-700 transition-colors
                    "
                >
                    {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
                </button>
            )}
        </div>
    )
}

// ─── Desktop sidebar ──────────────────────────────────────────────────────────

export function DesktopSidebar({
    collapsed,
    toggleCollapsed,
}: {
    collapsed: boolean
    toggleCollapsed: () => void
}) {
    return (
        <aside
            className="hidden md:flex flex-col shrink-0 relative transition-[width] duration-300"
            style={{
                width: collapsed ? 76 : 252,
                background: '#ffffff',
                borderRight: '1px solid #eef1f7',
                boxShadow: '4px 0 20px rgba(15,23,42,0.04)',
            }}
        >
            <SidebarContent collapsed={collapsed} toggleCollapsed={toggleCollapsed} />
        </aside>
    )
}

// ─── Mobile sidebar drawer ────────────────────────────────────────────────────

export function MobileSidebar({
    open,
    onClose,
}: {
    open: boolean
    onClose: () => void
}) {
    return (
        <>
            {/* Backdrop */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <aside
                className="fixed inset-y-0 left-0 z-50 w-[252px] md:hidden flex flex-col transition-transform duration-300"
                style={{
                    background: '#ffffff',
                    borderRight: '1px solid #eef1f7',
                    transform: open ? 'translateX(0)' : 'translateX(-100%)',
                    boxShadow: open ? '8px 0 30px rgba(15,23,42,0.1)' : 'none',
                }}
            >
                <SidebarContent collapsed={false} onClose={onClose} isMobile />
            </aside>
        </>
    )
}