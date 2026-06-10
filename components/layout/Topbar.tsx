'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
    Menu, Search, Flame, Bell, ChevronDown, X,
    Check, Loader2, ArrowRight, FileText,
} from 'lucide-react'
import Image from 'next/image'
import { notificationsApi } from '@/lib/api/notifications'
import type { Notification } from '@/lib/types/notifications'
import { useAuth } from '@/lib/AuthContext'
import { useSearch, CATEGORY_LABELS, CATEGORY_COLORS } from '@/hooks/useSearch'
import type { SearchItem, SearchCategory } from '@/hooks/useSearch'

// ─── XP diamond icon ─────────────────────────────────────────────────────────

function DiamondIcon({ className }: { className?: string }) {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={className}>
            <path
                d="M6 3h12l4 6-10 12L2 9z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
                fill="rgba(99,102,241,0.15)"
            />
        </svg>
    )
}

// ─── Search dropdown (Spotlight style) ───────────────────────────────────────

function SearchDropdown({
    query,
    onClose,
    onSelect,
}: {
    query: string
    onClose: () => void
    onSelect: (item: SearchItem) => void
}) {
    const { results, loading } = useSearch(query)
    const router = useRouter()

    const grouped = results.reduce<Partial<Record<SearchCategory, SearchItem[]>>>(
        (acc, item) => {
            if (!acc[item.category]) acc[item.category] = []
            acc[item.category]!.push(item)
            return acc
        },
        {}
    )

    const isEmpty = !loading && results.length === 0 && query.trim().length > 0

    return (
        <div
            className="absolute left-0 top-full mt-2 w-full bg-white rounded-2xl border border-gray-100 z-50 overflow-hidden"
            style={{ boxShadow: '0 16px 48px rgba(15,23,42,0.14)', minWidth: 340 }}
        >
            {loading && (
                <div className="flex items-center justify-center py-6 gap-2 text-slate-400">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-[13px]">Searching…</span>
                </div>
            )}

            {isEmpty && (
                <div className="py-8 text-center">
                    <FileText size={28} className="mx-auto text-slate-200 mb-2" />
                    <p className="text-[13px] text-slate-400">
                        No results for <span className="font-semibold text-slate-600">"{query}"</span>
                    </p>
                </div>
            )}

            {!loading && results.length > 0 && (
                <div className="max-h-[420px] overflow-y-auto py-2">
                    {(Object.entries(grouped) as [SearchCategory, SearchItem[]][]).map(([cat, items]) => (
                        <div key={cat}>
                            <div className="px-4 py-1.5 sticky top-0 bg-white/95 backdrop-blur-sm">
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${CATEGORY_COLORS[cat]}`}>
                                    {CATEGORY_LABELS[cat]}
                                </span>
                            </div>
                            {items.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => { onSelect(item); router.push(item.href) }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50/60 transition-colors text-left group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13.5px] font-semibold text-slate-800 truncate">
                                            {item.title}
                                        </p>
                                        {item.description && (
                                            <p className="text-[11.5px] text-slate-400 truncate mt-0.5">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                    {item.badge && (
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${item.badge === 'FREE' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                                            }`}>
                                            {item.badge}
                                        </span>
                                    )}
                                    <ArrowRight size={13} className="text-slate-300 group-hover:text-indigo-400 shrink-0 transition-colors" />
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            )}

            {results.length > 0 && (
                <div className="border-t border-gray-50 px-4 py-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                        {results.length} result{results.length !== 1 ? 's' : ''}
                    </span>
                    <button
                        onClick={() => { onClose(); router.push(`/search?q=${encodeURIComponent(query.trim())}`) }}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                        View all →
                    </button>
                </div>
            )}
        </div>
    )
}

// ─── Notification dropdown ────────────────────────────────────────────────────

function NotificationDropdown({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await notificationsApi.getAll({ size: 10, unread_only: false })
            setNotifications(res.items ?? [])
        } catch { /* silent */ }
        finally { setLoading(false) }
    }, [])

    useEffect(() => { if (open) load() }, [open, load])

    useEffect(() => {
        function handleOutsideClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose()
        }
        if (open) document.addEventListener('mousedown', handleOutsideClick)
        return () => document.removeEventListener('mousedown', handleOutsideClick)
    }, [open, onClose])

    const markRead = async (id: string) => {
        try {
            await notificationsApi.markAsRead(id)
            setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n))
        } catch { /* ignore */ }
    }

    const markAll = async () => {
        try {
            await notificationsApi.markAllAsRead()
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
        } catch { /* ignore */ }
    }

    if (!open) return null

    return (
        <div
            ref={ref}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-gray-100 z-50 overflow-hidden"
            style={{ boxShadow: '0 8px 32px rgba(15,23,42,0.12)' }}
        >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                <span className="font-bold text-[14px] text-slate-800">Notifications</span>
                <button onClick={markAll} className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                    Mark all as read
                </button>
            </div>
            <div className="max-h-72 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 size={20} className="animate-spin text-indigo-400" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="py-8 text-center text-[13px] text-slate-400">No notifications</div>
                ) : (
                    notifications.map((n) => (
                        <div
                            key={n.id}
                            onClick={() => markRead(n.id)}
                            className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${!n.is_read ? 'bg-indigo-50/40' : ''}`}
                        >
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.is_read ? 'bg-indigo-500' : 'bg-gray-200'}`} />
                            <div className="flex-1 min-w-0">
                                <p className="text-[12.5px] font-semibold text-slate-700 leading-snug">{n.title}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{n.body}</p>
                            </div>
                            {!n.is_read && <Check size={12} className="text-indigo-400 shrink-0 mt-1" />}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

// ─── Notification bell ────────────────────────────────────────────────────────

function NotificationBell() {
    const [count, setCount] = useState(0)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        notificationsApi.getUnreadCount().then((r) => setCount(r.count)).catch(() => { })
    }, [])

    return (
        <div className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                aria-label="Notifications"
                className="relative w-10 h-10 rounded-2xl bg-slate-50 hover:bg-indigo-50 flex items-center justify-center transition-colors group"
            >
                <Bell size={18} className="text-slate-500 group-hover:text-indigo-600 transition-colors" />
                {count > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold bg-indigo-600 text-white flex items-center justify-center">
                        {count > 99 ? '99+' : count}
                    </span>
                )}
            </button>
            <NotificationDropdown open={open} onClose={() => setOpen(false)} />
        </div>
    )
}

// ─── Stat pill ────────────────────────────────────────────────────────────────

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
    return (
        <div className="hidden sm:flex items-center gap-2.5">
            {icon}
            <div>
                <div className="text-[13.5px] font-bold text-slate-800 leading-none">{value}</div>
                <div className="text-[10.5px] text-slate-400 mt-0.5 leading-none">{label}</div>
            </div>
        </div>
    )
}

// ─── User dropdown ────────────────────────────────────────────────────────────

function UserDropdown({ open, onClose, name, level }: { open: boolean; onClose: () => void; name: string; level: number }) {
    const { logout } = useAuth()
    const router = useRouter()
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleOutsideClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose()
        }
        if (open) document.addEventListener('mousedown', handleOutsideClick)
        return () => document.removeEventListener('mousedown', handleOutsideClick)
    }, [open, onClose])

    if (!open) return null

    const items = [
        { label: 'Profile', href: '/profile' },
        { label: 'Settings', href: '/settings' },
        { label: 'Billing', href: '/billing' },
    ]

    return (
        <div
            ref={ref}
            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl border border-gray-100 z-50 overflow-hidden"
            style={{ boxShadow: '0 8px 32px rgba(15,23,42,0.12)' }}
        >
            <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-[12.5px] font-bold text-slate-800">{name}</p>
                <p className="text-[11px] text-slate-400">Level {level}</p>
            </div>
            {items.map((item) => (
                <button
                    key={item.href}
                    onClick={() => { router.push(item.href); onClose() }}
                    className="w-full text-left px-4 py-2.5 text-[13px] text-slate-600 hover:bg-gray-50 transition-colors"
                >
                    {item.label}
                </button>
            ))}
            <div className="border-t border-gray-50">
                <button onClick={() => logout()} className="w-full text-left px-4 py-2.5 text-[13px] text-rose-500 hover:bg-rose-50 transition-colors">
                    Log out
                </button>
            </div>
        </div>
    )
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

export interface TopbarProps {
    onMenuClick: () => void
    user: {
        full_name?: string
        username?: string
        avatar_url?: string
        streak?: number
        xp?: number
        level?: number
    }
}

export function Topbar({ onMenuClick, user }: TopbarProps) {
    const streak = user.streak ?? 0
    const xp = user.xp ?? 0
    const level = user.level ?? 1
    const name = user.full_name || user.username || 'User'
    const avatar = user.avatar_url ?? null

    const [searchQuery, setSearchQuery] = useState('')
    const [searchOpen, setSearchOpen] = useState(false)
    const [userDropOpen, setUserDropOpen] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

    // Close the search dropdown on outside click.
    useEffect(() => {
        function handleOutsideClick(e: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setSearchOpen(false)
            }
        }
        document.addEventListener('mousedown', handleOutsideClick)
        return () => document.removeEventListener('mousedown', handleOutsideClick)
    }, [])

    // Open the dropdown whenever the query is non-empty.
    useEffect(() => {
        setSearchOpen(searchQuery.trim().length > 0)
    }, [searchQuery])

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            setSearchOpen(false)
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
        }
    }

    const clearSearch = () => {
        setSearchQuery('')
        setSearchOpen(false)
        inputRef.current?.focus()
    }

    // ⌘K / Ctrl+K → focus search. Escape → close dropdown.
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                inputRef.current?.focus()
            }
            if (e.key === 'Escape') {
                setSearchOpen(false)
                inputRef.current?.blur()
            }
        }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [])

    return (
        <header
            className="shrink-0 bg-white px-5 md:px-8 flex items-center justify-between gap-4 z-10"
            style={{
                height: 72,
                borderBottom: '1px solid #eef1f7',
                boxShadow: '0 2px 12px rgba(15,23,42,0.03)',
            }}
        >
            {/* ── Left ── */}
            <div className="flex items-center gap-3 min-w-0">
                <button
                    onClick={onMenuClick}
                    aria-label="Open menu"
                    className="md:hidden w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition-colors"
                >
                    <Menu size={19} />
                </button>

                {/* Search with inline dropdown */}
                <div ref={searchRef} className="hidden md:block relative">
                    <form
                        onSubmit={handleSearchSubmit}
                        className="flex items-center gap-2.5 rounded-2xl px-4"
                        style={{
                            width: 320,
                            height: 44,
                            background: '#f8f9fd',
                            border: searchOpen ? '1.5px solid #6366f1' : '1.5px solid #eef1f7',
                            transition: 'border-color 0.15s',
                        }}
                    >
                        <Search size={15} className="text-slate-400 shrink-0" />
                        <input
                            ref={inputRef}
                            id="topbar-search"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => { if (searchQuery.trim()) setSearchOpen(true) }}
                            placeholder="Search pages, tests…"
                            className="flex-1 bg-transparent outline-none text-[13.5px] text-slate-700 placeholder:text-slate-400"
                        />
                        {searchQuery ? (
                            <button type="button" onClick={clearSearch} aria-label="Clear search" className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={13} />
                            </button>
                        ) : (
                            <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium text-slate-400 bg-white border border-slate-200">
                                ⌘K
                            </kbd>
                        )}
                    </form>

                    {searchOpen && (
                        <SearchDropdown
                            query={searchQuery}
                            onClose={() => setSearchOpen(false)}
                            onSelect={() => { setSearchOpen(false); setSearchQuery('') }}
                        />
                    )}
                </div>
            </div>

            {/* ── Right ── */}
            <div className="flex items-center gap-4">
                {/* Mobile: icon-only search button */}
                <button
                    onClick={() => router.push('/search')}
                    aria-label="Search"
                    className="md:hidden w-10 h-10 rounded-2xl bg-slate-50 hover:bg-indigo-50 flex items-center justify-center transition-colors"
                >
                    <Search size={18} className="text-slate-500" />
                </button>

                <StatPill
                    icon={<div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center"><Flame size={16} className="text-orange-500" /></div>}
                    value={streak}
                    label="Day streak"
                />
                <StatPill
                    icon={<div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center"><DiamondIcon className="text-indigo-500" /></div>}
                    value={xp.toLocaleString()}
                    label="XP"
                />

                <NotificationBell />

                <div className="hidden sm:block w-px h-9 bg-slate-100" />

                <div className="relative">
                    <button
                        onClick={() => setUserDropOpen((v) => !v)}
                        className="hidden sm:flex items-center gap-3 hover:bg-slate-50 rounded-2xl px-3 py-2 -mx-3 -my-2 transition-colors group"
                    >
                        {avatar ? (
                            <div className="w-9 h-9 rounded-xl overflow-hidden relative shrink-0" style={{ boxShadow: '0 4px 12px rgba(99,102,241,0.2)' }}>
                                <Image src={avatar} alt={name} fill className="object-cover" />
                            </div>
                        ) : (
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[12px] font-bold shrink-0" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
                                {initials}
                            </div>
                        )}
                        <div className="text-left">
                            <div className="text-[13px] font-semibold text-slate-800 leading-none">{name}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5 leading-none">Level {level}</div>
                        </div>
                        <ChevronDown size={14} className={`text-slate-400 group-hover:text-slate-600 transition-all duration-200 ${userDropOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <UserDropdown open={userDropOpen} onClose={() => setUserDropOpen(false)} name={name} level={level} />
                </div>
            </div>
        </header>
    )
}