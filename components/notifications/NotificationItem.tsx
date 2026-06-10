"use client"

import { formatDistanceToNow } from "date-fns"
import { Trash2, Info, CheckCircle, AlertTriangle, XCircle, CreditCard, Star, Shield, Settings } from "lucide-react"
import type { Notification, NotificationType } from "@/lib/types/notifications"

type TypeConfig = {
    icon: React.ReactNode
    bg: string
    border: string
    iconColor: string
    dot: string
}

const typeConfig: Record<NotificationType, TypeConfig> = {
    info: {
        icon: <Info className="w-4 h-4" />,
        bg: "bg-blue-50 dark:bg-blue-500/10",
        border: "border-blue-100 dark:border-blue-500/20",
        iconColor: "text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/20",
        dot: "bg-blue-500",
    },
    success: {
        icon: <CheckCircle className="w-4 h-4" />,
        bg: "bg-emerald-50 dark:bg-emerald-500/10",
        border: "border-emerald-100 dark:border-emerald-500/20",
        iconColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20",
        dot: "bg-emerald-500",
    },
    warning: {
        icon: <AlertTriangle className="w-4 h-4" />,
        bg: "bg-amber-50 dark:bg-amber-500/10",
        border: "border-amber-100 dark:border-amber-500/20",
        iconColor: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/20",
        dot: "bg-amber-500",
    },
    error: {
        icon: <XCircle className="w-4 h-4" />,
        bg: "bg-indigo-50 dark:bg-indigo-500/10",
        border: "border-indigo-100 dark:border-indigo-500/20",
        iconColor: "text-indigo-500 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/20",
        dot: "bg-indigo-500",
    },
    payment: {
        icon: <CreditCard className="w-4 h-4" />,
        bg: "bg-violet-50 dark:bg-violet-500/10",
        border: "border-violet-100 dark:border-violet-500/20",
        iconColor: "text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-500/20",
        dot: "bg-violet-500",
    },
    subscription: {
        icon: <Star className="w-4 h-4" />,
        bg: "bg-indigo-50 dark:bg-indigo-500/10",
        border: "border-indigo-100 dark:border-indigo-500/20",
        iconColor: "text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/20",
        dot: "bg-indigo-500",
    },
    security: {
        icon: <Shield className="w-4 h-4" />,
        bg: "bg-orange-50 dark:bg-orange-500/10",
        border: "border-orange-100 dark:border-orange-500/20",
        iconColor: "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/20",
        dot: "bg-orange-500",
    },
    system: {
        icon: <Settings className="w-4 h-4" />,
        bg: "bg-gray-50 dark:bg-white/5",
        border: "border-gray-100 dark:border-white/10",
        iconColor: "text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/10",
        dot: "bg-gray-400",
    },
}

interface Props {
    notification: Notification
    onRead: (id: string) => void
    onDelete: (id: string) => void
}

export default function NotificationItem({ notification, onRead, onDelete }: Props) {
    const cfg = typeConfig[notification.type] ?? typeConfig.info
    const isUnread = !notification.is_read

    const handleClick = () => {
        if (isUnread) onRead(notification.id)
    }

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation()
        onDelete(notification.id)
    }

    return (
        <div
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleClick()}
            aria-label={`Notification: ${notification.title}${isUnread ? " (unread)" : ""}`}
            className={`
                group relative flex gap-3 p-4 rounded-xl border transition-all cursor-pointer
                ${cfg.bg} ${cfg.border}
                ${isUnread ? "shadow-sm" : "opacity-60"}
                hover:shadow-md hover:opacity-100
                focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
            `}
        >
            {/* Icon */}
            <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 ${cfg.iconColor}`}>
                {cfg.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-start justify-between gap-2 mb-0.5">
                    <p className={`text-sm leading-tight ${isUnread
                        ? "font-semibold text-gray-900 dark:text-gray-100"
                        : "font-normal text-gray-600 dark:text-gray-400"
                        }`}>
                        {notification.title}
                    </p>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap shrink-0 mt-0.5">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {notification.message}
                </p>
            </div>

            {/* Unread dot */}
            {isUnread && (
                <span
                    aria-hidden="true"
                    className={`absolute top-4 right-10 w-2 h-2 rounded-full ${cfg.dot}`}
                />
            )}

            {/* Delete button */}
            <button
                onClick={handleDelete}
                aria-label="Delete notification"
                className="
                    absolute top-3 right-3
                    opacity-0 group-hover:opacity-100
                    transition-opacity duration-150
                    p-1.5 rounded-lg
                    text-gray-400 hover:text-indigo-500
                    hover:bg-white/70 dark:hover:bg-white/10
                    focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-indigo-400
                "
            >
                <Trash2 className="w-3.5 h-3.5" />
            </button>
        </div>
    )
}