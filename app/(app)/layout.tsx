'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import clsx from 'clsx'
import {
    LayoutDashboard, Target, User, LogOut,
    Menu, X, ChevronLeft, Wallet, ChevronRight,
    Sparkles, Quote,
} from 'lucide-react'
import NotificationBell from '@/components/notifications/NotificationBell'

const NAV = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Practice', href: '/practice', icon: Target },
    { label: 'Subscription', href: '/billing', icon: Wallet },
    { label: 'Profile', href: '/profile', icon: User },
]

const QUOTES = [
    { text: "The limits of my language mean the limits of my world.", author: "Ludwig Wittgenstein" },
    { text: "One language sets you in a corridor for life. Two languages open every door along the way.", author: "Frank Smith" },
    { text: "To learn a language is to have one more window from which to look at the world.", author: "Chinese Proverb" },
    { text: "Language is the road map of a culture. It tells you where its people come from and where they are going.", author: "Rita Mae Brown" },
    { text: "A different language is a different vision of life.", author: "Federico Fellini" },
    { text: "With languages, you are at home anywhere.", author: "Edmund de Waal" },
    { text: "Learning another language is not only learning different words for the same things, but learning another way to think about things.", author: "Flora Lewis" },
]

// Har kuni bir naqil — sana asosida
function getDailyQuote() {
    const day = Math.floor(Date.now() / 86_400_000)
    return QUOTES[day % QUOTES.length]
}

function QuoteBanner() {
    const q = getDailyQuote()
    return (
        <div className="mx-4 mb-4 rounded-2xl bg-indigo-600/90 px-5 py-4 relative overflow-hidden">
            {/* decorative quote mark */}
            <Quote
                size={48}
                className="absolute -top-2 -right-2 text-white/10 rotate-180"
                strokeWidth={1.5}
            />
            <p className="text-[12.5px] leading-relaxed text-indigo-100 italic pr-6">
                "{q.text}"
            </p>
            <p className="text-[11px] text-indigo-300/70 mt-2 font-medium">
                — {q.author}
            </p>
        </div>
    )
}

function Skeleton() {
    return (
        <div className="h-screen flex bg-indigo-950">
            <div className="w-[230px] bg-indigo-900 animate-pulse border-r border-indigo-800" />
            <div className="flex-1 flex flex-col bg-slate-50">
                <div className="h-[60px] bg-white border-b border-gray-100 animate-pulse" />
                <div className="flex-1 p-6 space-y-4">
                    <div className="h-6 w-48 bg-indigo-100 rounded-xl animate-pulse" />
                    <div className="h-40 bg-white rounded-2xl animate-pulse" />
                </div>
            </div>
        </div>
    )
}

/** Public sahifa headeri */
function PublicHeader() {
    return (
        <header className="h-[60px] bg-indigo-950 border-b border-indigo-800/60 px-6 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
                {/* Logo: indigo fonda invert kerak */}
                <Image
                    src="/header.png"
                    alt="Lexis"
                    width={96}
                    height={30}
                    className="object-contain brightness-0 invert"
                />
            </Link>
            <div className="flex items-center gap-3">
                <Link
                    href="/login"
                    className="text-sm font-medium text-indigo-200 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
                >
                    Log in
                </Link>
                <Link
                    href="/register"
                    className="text-sm font-semibold text-indigo-950 bg-indigo-300 hover:bg-indigo-200 transition-colors px-4 py-1.5 rounded-xl"
                >
                    Sign up
                </Link>
            </div>
        </header>
    )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, logout } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    const isExamPage =
        pathname.startsWith('/tests/ielts/reading/') ||
        pathname === '/tests/ielts/reading' ||
        pathname === '/tests/ielts/' ||
        pathname === '/tests/ielts' ||
        pathname === '/practice/' ||
        pathname === '/practice'

    const isPublicPage = pathname === '/practice'

    useEffect(() => {
        if (!loading && !user && !isPublicPage) router.replace('/login')
    }, [loading, user, router, isPublicPage])

    useEffect(() => { setMobileOpen(false) }, [pathname])

    if (loading) return <Skeleton />

    if (!user && isPublicPage) {
        return (
            <div className="min-h-screen flex flex-col bg-slate-50">
                <PublicHeader />
                <main className="flex-1">{children}</main>
            </div>
        )
    }

    if (!user) return null
    if (isExamPage) return <div className="h-screen bg-white">{children}</div>

    const pageTitle = NAV.find(n => pathname === n.href || pathname.startsWith(n.href + '/'))?.label
        || pathname.split('/').filter(Boolean).pop() || 'Dashboard'

    const initials = user.full_name
        ? user.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
        : user.username?.[0]?.toUpperCase() || 'U'

    const SidebarContent = () => (
        <div className="flex flex-col h-full">

            {/* ── LOGO ── */}
            <div className={clsx(
                'flex items-center h-[60px] px-4 shrink-0 border-b border-indigo-800/50',
                collapsed ? 'justify-center' : 'justify-between'
            )}>
                {!collapsed && (
                    <Image
                        src="/header.png"
                        alt="Lexis"
                        width={88}
                        height={28}
                        className=""
                    />
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden md:flex w-7 h-7 items-center justify-center rounded-lg
                               hover:bg-white/10 text-indigo-400/50 hover:text-white transition-all"
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
                <button
                    onClick={() => setMobileOpen(false)}
                    className="md:hidden w-7 h-7 flex items-center justify-center rounded-lg
                               hover:bg-white/10 text-indigo-400/50"
                >
                    <X size={15} />
                </button>
            </div>

            {/* ── NAV ── */}
            <nav className="flex-1 px-2.5 py-4 space-y-0.5 overflow-y-auto">
                {!collapsed && (
                    <p className="text-[10px] font-semibold uppercase tracking-widest
                                  text-indigo-400/40 px-3 mb-3">
                        Navigation
                    </p>
                )}
                {NAV.map((item) => {
                    const active = pathname === item.href ||
                        (item.href !== '/dashboard' && pathname.startsWith(item.href))
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={collapsed ? item.label : undefined}
                            className={clsx(
                                'relative flex items-center gap-3 px-3 py-2.5 rounded-xl',
                                'text-[13px] font-medium transition-all duration-150 group select-none',
                                collapsed && 'justify-center',
                                active
                                    ? 'bg-indigo-500/25 text-white'
                                    : 'text-indigo-300/60 hover:bg-indigo-500/10 hover:text-indigo-100'
                            )}
                        >
                            {active && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2
                                                 w-0.5 h-5 rounded-full bg-indigo-400" />
                            )}
                            <Icon
                                size={16}
                                className={clsx(
                                    'shrink-0 transition-all',
                                    active ? 'text-indigo-300' : 'opacity-50 group-hover:opacity-80'
                                )}
                            />
                            {!collapsed && <span>{item.label}</span>}
                            {!collapsed && active && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400/80" />
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* ── DAILY QUOTE ── only when expanded */}
            {!collapsed && <QuoteBanner />}

            {/* ── UPGRADE BANNER ── only when expanded */}
            {!collapsed && (
                <div className="mx-4 mb-3 rounded-xl bg-indigo-500/15 border border-indigo-500/20 p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles size={13} className="text-indigo-300" />
                        <span className="text-[12px] font-semibold text-white">Go Premium</span>
                    </div>
                    <p className="text-[11px] text-indigo-300/50 mb-2.5 leading-relaxed">
                        Unlock all tests & AI feedback
                    </p>
                    <Link
                        href="/billing"
                        className="block text-center text-[11px] font-semibold text-indigo-950
                                   bg-indigo-300 hover:bg-indigo-200 rounded-lg py-1.5 transition-colors"
                    >
                        Upgrade now
                    </Link>
                </div>
            )}

            {/* ── USER ── */}
            <div className="border-t border-indigo-800/50 p-3 shrink-0">
                {!collapsed ? (
                    <div className="flex items-center gap-2.5 rounded-xl hover:bg-indigo-500/10 px-2 py-2 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/30 text-indigo-200
                                        flex items-center justify-center text-xs font-bold shrink-0">
                            {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-semibold text-white truncate leading-tight">
                                {user.full_name || user.username}
                            </p>
                            <p className="text-[11px] text-indigo-300/50 truncate">
                                {user.email}
                            </p>
                        </div>
                        <button
                            onClick={logout}
                            title="Log out"
                            className="w-7 h-7 flex items-center justify-center rounded-lg
                                       hover:bg-indigo-500/20 text-indigo-300/40
                                       hover:text-indigo-200 transition-all shrink-0"
                        >
                            <LogOut size={14} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={logout}
                        title="Log out"
                        className="flex w-full items-center justify-center py-2 rounded-lg
                                   hover:bg-indigo-500/20 text-indigo-300/40
                                   hover:text-indigo-200 transition-all"
                    >
                        <LogOut size={15} />
                    </button>
                )}
            </div>
        </div>
    )

    return (
        <div className="flex h-screen bg-slate-50">
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-[2px]"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ── DESKTOP SIDEBAR ── */}
            <aside className={clsx(
                'hidden md:flex flex-col shrink-0 transition-all duration-200',
                'bg-gradient-to-b from-indigo-950 via-indigo-900 to-indigo-950',
                'border-r border-indigo-800/50',
                collapsed ? 'w-[60px]' : 'w-[230px]',
            )}>
                <SidebarContent />
            </aside>

            {/* ── MOBILE SIDEBAR ── */}
            <aside className={clsx(
                'fixed inset-y-0 left-0 z-30 flex flex-col w-64 md:hidden transition-transform duration-200',
                'bg-gradient-to-b from-indigo-950 via-indigo-900 to-indigo-950',
                mobileOpen ? 'translate-x-0' : '-translate-x-full'
            )}>
                <SidebarContent />
            </aside>

            {/* ── MAIN ── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* ── HEADER ── */}
                <header className="bg-white border-b border-gray-100 h-[60px] px-5
                                   flex items-center justify-between shrink-0
                                   shadow-sm shadow-indigo-50/80">
                    <div className="flex items-center gap-3">
                        {/* Mobile: burger + logo */}
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl
                                       hover:bg-indigo-50 text-indigo-400 transition-colors"
                        >
                            <Menu size={18} />
                        </button>
                        {/* 
                          * Mobile da logo ko'rsatiladi (sidebar yopiq bo'lishi mumkin)
                          * Desktop da sidebar ichida logo bor — takrorlanmaslik uchun yashiriladi
                          *
                          * ⚠️  header.png KO'RINMASLIGI SABABI:
                          *     Agar logo qoʻyilgan joy oq (bg-white) bo'lsa va
                          *     rasm ham oq/och rangda bo'lsa — ko'rinmaydi.
                          *     Yechim: logoning qoʻyilgan joyiga mos variant ishlating:
                          *       - Qoʻngʻir/indigo fon → brightness-0 invert (oq logo)
                          *       - Oq fon              → original rangdagi logo (invert YO'Q)
                        */}
                        {/* Oq header foni — bu yerda invert KERAK EMAS */}
                        <div className="md:hidden">
                            <Image
                                src="/header.png"
                                alt="Lexis"
                                width={76}
                                height={24}
                                className="object-contain"
                            />
                        </div>

                        {/* Desktop: page title */}
                        <div className="hidden md:block">
                            <h1 className="text-[15px] font-bold capitalize text-gray-900 tracking-tight">
                                {pageTitle}
                            </h1>
                            <p className="text-[11px] text-gray-400">
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long', month: 'long', day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <NotificationBell />
                        <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-gray-100 ml-1">
                            <div className="text-right">
                                <p className="text-[13px] font-semibold text-gray-800 leading-tight">
                                    {user.full_name || user.username}
                                </p>
                                <p className="text-[11px] text-gray-400">{user.email}</p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white
                                            flex items-center justify-center text-[13px] font-bold
                                            shadow-sm shadow-indigo-200/60">
                                {initials}
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── CONTENT ── */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}