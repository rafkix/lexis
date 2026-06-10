"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Bell, CheckCheck, Trash2, Settings } from "lucide-react"
import NotificationItem from "@/components/notifications/NotificationItem"
import NotificationSettingsModal from "@/components/notifications/NotificationSettings"
import { notificationsApi } from "@/lib/api/notifications"
import type { PaginatedNotifications } from "@/lib/types/notifications"

export default function NotificationsPage() {
    const [data, setData] = useState<PaginatedNotifications | null>(null)
    const [page, setPage] = useState(1)
    const [unreadOnly, setUnreadOnly] = useState(false)
    const [loading, setLoading] = useState(true)
    const [showSettings, setShowSettings] = useState(false)

    const load = async (p = page, unread = unreadOnly) => {
        setLoading(true)
        try {
            const res = await notificationsApi.getAll({ page: p, size: 20, unread_only: unread })
            setData(res)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [page, unreadOnly])

    const handleRead = async (id: string) => {
        await notificationsApi.markAsRead(id)
        setData((prev) =>
            prev
                ? {
                    ...prev,
                    unread_count: Math.max(0, prev.unread_count - 1),
                    items: prev.items.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
                }
                : prev
        )
    }

    const handleDelete = async (id: string) => {
        await notificationsApi.deleteNotification(id)
        setData((prev) =>
            prev ? { ...prev, items: prev.items.filter((n) => n.id !== id) } : prev
        )
        toast.success("Notification deleted")
    }

    const handleMarkAll = async () => {
        const { marked } = await notificationsApi.markAllAsRead()
        setData((prev) =>
            prev
                ? {
                    ...prev,
                    unread_count: 0,
                    items: prev.items.map((n) => ({ ...n, is_read: true })),
                }
                : prev
        )
        toast.success(`${marked} notification${marked !== 1 ? "s" : ""} marked as read`)
    }

    const handleDeleteRead = async () => {
        const { deleted } = await notificationsApi.deleteAllRead()
        await load()
        toast.success(`${deleted} read notification${deleted !== 1 ? "s" : ""} deleted`)
    }

    const switchTab = (unread: boolean) => {
        setUnreadOnly(unread)
        setPage(1)
    }

    return (
        <div className="max-w-2xl mx-auto">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                        <Bell className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Notifications
                    </h1>
                    {!!data?.unread_count && (
                        <span className="
                            bg-indigo-500 text-white text-[11px] font-bold
                            px-2 py-0.5 rounded-full leading-none
                        ">
                            {data.unread_count}
                        </span>
                    )}
                </div>
                <button
                    onClick={() => setShowSettings(true)}
                    aria-label="Notification settings"
                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400"
                >
                    <Settings className="w-5 h-5" />
                </button>
            </div>

            {/* Filters + Actions */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
                {/* Tab toggle */}
                <div className="flex bg-gray-100 dark:bg-white/10 rounded-xl p-1 gap-0.5">
                    {[
                        { label: "All", value: false },
                        { label: "Unread", value: true },
                    ].map(({ label, value }) => (
                        <button
                            key={label}
                            onClick={() => switchTab(value)}
                            className={`
                                px-4 py-1.5 rounded-lg text-sm font-medium transition-all
                                ${unreadOnly === value
                                    ? "bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-gray-100"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                }
                            `}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 ml-auto">
                    {!!data?.unread_count && (
                        <button
                            onClick={handleMarkAll}
                            className="
                                flex items-center gap-1.5 text-sm font-medium
                                text-blue-600 dark:text-blue-400
                                px-3 py-1.5 rounded-xl
                                hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors
                            "
                        >
                            <CheckCheck className="w-4 h-4" />
                            Mark all read
                        </button>
                    )}
                    <button
                        onClick={handleDeleteRead}
                        className="
                            flex items-center gap-1.5 text-sm font-medium
                            text-gray-500 dark:text-gray-400
                            px-3 py-1.5 rounded-xl
                            hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors
                        "
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete read
                    </button>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="h-20 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse"
                        />
                    ))}
                </div>
            ) : !data?.items.length ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                        <Bell className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="text-base font-medium text-gray-500 dark:text-gray-400">
                        No notifications
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                        {unreadOnly
                            ? "You're all caught up — nothing unread"
                            : "No notifications have arrived yet"}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {data.items.map((n) => (
                        <NotificationItem
                            key={n.id}
                            notification={n}
                            onRead={handleRead}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {data && data.pages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="
                            px-4 py-2 rounded-xl text-sm font-medium
                            border border-gray-200 dark:border-white/10
                            text-gray-600 dark:text-gray-400
                            hover:bg-gray-50 dark:hover:bg-white/5
                            disabled:opacity-40 disabled:cursor-not-allowed
                            transition-colors
                        "
                    >
                        ← Previous
                    </button>
                    <span className="text-sm text-gray-400 dark:text-gray-500 tabular-nums">
                        {page} / {data.pages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                        disabled={page === data.pages}
                        className="
                            px-4 py-2 rounded-xl text-sm font-medium
                            border border-gray-200 dark:border-white/10
                            text-gray-600 dark:text-gray-400
                            hover:bg-gray-50 dark:hover:bg-white/5
                            disabled:opacity-40 disabled:cursor-not-allowed
                            transition-colors
                        "
                    >
                        Next →
                    </button>
                </div>
            )}

            {/* Settings modal */}
            {showSettings && (
                <NotificationSettingsModal onClose={() => setShowSettings(false)} />
            )}
        </div>
    )
}