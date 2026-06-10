"use client"

import { useEffect, useRef, useState } from "react"
import { Bell, CreditCard, Star, Shield, Check } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { notificationsApi } from "@/lib/api/notifications"
import type { Notification, NotificationType } from "@/lib/types/notifications"

const typeIcon: Partial<Record<NotificationType, React.ReactNode>> = {
    payment: <CreditCard className="w-3.5 h-3.5" />,
    subscription: <Star className="w-3.5 h-3.5" />,
    security: <Shield className="w-3.5 h-3.5" />,
}

const typeColor: Partial<Record<NotificationType, string>> = {
    payment: "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400",
    subscription: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
    security: "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
}

function NotificationIcon({ type }: { type: NotificationType }) {
    const icon = typeIcon[type] ?? <Bell className="w-3.5 h-3.5" />
    const color = typeColor[type] ?? "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400"
    return (
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
            {icon}
        </div>
    )
}

export default function NotificationBell() {
    const [count, setCount] = useState(0)
    const [open, setOpen] = useState(false)
    const [items, setItems] = useState<Notification[]>([])
    const [loading, setLoading] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    // Refresh unread count every 30 seconds
    useEffect(() => {
        const fetchCount = async () => {
            try {
                const { count } = await notificationsApi.getUnreadCount()
                setCount(count)
            } catch { }
        }
        fetchCount()
        const interval = setInterval(fetchCount, 30_000)
        return () => clearInterval(interval)
    }, [])

    // Load latest 5 notifications when dropdown opens
    useEffect(() => {
        if (!open) return
        setLoading(true)
        notificationsApi
            .getAll({ size: 5 })
            .then((res) => setItems(res.items))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [open])

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false)
        }
        document.addEventListener("keydown", handler)
        return () => document.removeEventListener("keydown", handler)
    }, [])

    const handleMarkAll = async () => {
        try {
            await notificationsApi.markAllAsRead()
            setCount(0)
            setItems((prev) => prev.map((n) => ({ ...n, is_read: true })))
        } catch { }
    }

    return (
        <div className="relative" ref={ref}>
            {/* Bell button */}
            <button
                onClick={() => setOpen((v) => !v)}
                aria-label={`Notifications${count > 0 ? `, ${count} unread` : ""}`}
                aria-expanded={open}
                className={`
                    relative p-2 rounded-xl transition-colors
                    hover:bg-gray-100 dark:hover:bg-white/10
                    ${open ? "bg-gray-100 dark:bg-white/10" : ""}
                `}
            >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                {count > 0 && (
                    <span className="
                        absolute -top-1 -right-1
                        min-w-[18px] h-[18px] px-1
                        bg-indigo-500 text-white text-[10px] font-bold
                        rounded-full flex items-center justify-center
                        ring-2 ring-white dark:ring-gray-900
                    ">
                        {count > 99 ? "99+" : count}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="
                    absolute right-0 top-12 w-80
                    bg-white dark:bg-gray-900
                    rounded-2xl shadow-xl
                    border border-gray-100 dark:border-white/10
                    z-50 overflow-hidden
                ">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/10">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                Notifications
                            </h3>
                            {count > 0 && (
                                <span className="
                                    text-[10px] font-semibold px-1.5 py-0.5 rounded-full
                                    bg-blue-100 text-blue-600
                                    dark:bg-blue-500/20 dark:text-blue-400
                                ">
                                    {count} new
                                </span>
                            )}
                        </div>
                        {count > 0 && (
                            <button
                                onClick={handleMarkAll}
                                className="
                                    flex items-center gap-1
                                    text-xs text-blue-600 dark:text-blue-400
                                    hover:text-blue-800 dark:hover:text-blue-300
                                    font-medium transition-colors
                                "
                            >
                                <Check className="w-3 h-3" />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="divide-y divide-gray-50 dark:divide-white/5 max-h-80 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex gap-3 items-start animate-pulse">
                                        <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-white/5 shrink-0" />
                                        <div className="flex-1 space-y-1.5">
                                            <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-3/4" />
                                            <div className="h-2.5 bg-gray-100 dark:bg-white/5 rounded w-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-2">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                                    <Bell className="w-5 h-5 text-gray-400" />
                                </div>
                                <p className="text-sm text-gray-400 dark:text-gray-500">
                                    No notifications yet
                                </p>
                            </div>
                        ) : (
                            items.map((n) => (
                                <div
                                    key={n.id}
                                    className={`
                                        flex gap-3 px-4 py-3 transition-colors
                                        hover:bg-gray-50 dark:hover:bg-white/5
                                        ${!n.is_read ? "bg-blue-50/40 dark:bg-blue-500/5" : ""}
                                    `}
                                >
                                    <NotificationIcon type={n.type} />
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs leading-tight truncate ${!n.is_read
                                            ? "font-semibold text-gray-900 dark:text-gray-100"
                                            : "font-medium text-gray-700 dark:text-gray-300"
                                            }`}>
                                            {n.title}
                                        </p>
                                        <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                                            {n.message}
                                        </p>
                                        <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1">
                                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                    {!n.is_read && (
                                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" aria-hidden="true" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <Link
                        href="/profile/settings/notifications"
                        onClick={() => setOpen(false)}
                        className="
                            flex items-center justify-center gap-1
                            text-xs text-blue-600 dark:text-blue-400 font-medium
                            py-3 border-t border-gray-100 dark:border-white/10
                            hover:bg-gray-50 dark:hover:bg-white/5 transition-colors
                        "
                    >
                        View all notifications →
                    </Link>
                </div>
            )}
        </div>
    )
}