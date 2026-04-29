"use client"

import { useEffect, useState } from "react"
import { X, Mail, Send, MessageSquare, Bell, CreditCard, Star, Shield, Megaphone } from "lucide-react"
import { toast } from "sonner"
import { notificationsApi } from "@/lib/api/notifications"
import type { NotificationSettings } from "@/lib/types/notifications"

type SettingKey = keyof NotificationSettings

interface SettingItem {
    key: SettingKey
    label: string
    description: string
    icon: React.ReactNode
    group: "channels" | "types"
}

const settingItems: SettingItem[] = [
    {
        key: "email_enabled",
        label: "Email",
        description: "Receive updates via email",
        icon: <Mail className="w-4 h-4" />,
        group: "channels",
    },
    {
        key: "telegram_enabled",
        label: "Telegram",
        description: "Get instant Telegram messages",
        icon: <Send className="w-4 h-4" />,
        group: "channels",
    },
    {
        key: "sms_enabled",
        label: "SMS",
        description: "Text messages to your phone",
        icon: <MessageSquare className="w-4 h-4" />,
        group: "channels",
    },
    {
        key: "push_enabled",
        label: "Push notifications",
        description: "Browser & app push alerts",
        icon: <Bell className="w-4 h-4" />,
        group: "channels",
    },
    {
        key: "payment_notifications",
        label: "Payment alerts",
        description: "Transactions and billing updates",
        icon: <CreditCard className="w-4 h-4" />,
        group: "types",
    },
    {
        key: "subscription_notifications",
        label: "Subscription updates",
        description: "Renewals, plan changes, expiry",
        icon: <Star className="w-4 h-4" />,
        group: "types",
    },
    {
        key: "security_notifications",
        label: "Security alerts",
        description: "Logins, password changes, threats",
        icon: <Shield className="w-4 h-4" />,
        group: "types",
    },
    {
        key: "marketing_notifications",
        label: "Marketing & promotions",
        description: "Offers, news and announcements",
        icon: <Megaphone className="w-4 h-4" />,
        group: "types",
    },
]

interface Props {
    onClose: () => void
}

function Toggle({
    enabled,
    onChange,
}: {
    enabled: boolean
    onChange: () => void
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={onChange}
            className={`
        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
        border-2 border-transparent transition-colors duration-200 ease-in-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
        ${enabled ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"}
      `}
        >
            <span
                className={`
          pointer-events-none inline-block h-5 w-5 transform rounded-full
          bg-white shadow-md ring-0 transition duration-200 ease-in-out
          ${enabled ? "translate-x-5" : "translate-x-0"}
        `}
            />
        </button>
    )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="px-6 pt-4 pb-1">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                {children}
            </span>
        </div>
    )
}

function SettingRow({
    item,
    enabled,
    onToggle,
}: {
    item: SettingItem
    enabled: boolean
    onToggle: () => void
}) {
    return (
        <div className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
                <div
                    className={`
            flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
            transition-colors duration-200
            ${enabled
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                            : "bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-500"
                        }
          `}
                >
                    {item.icon}
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight">
                        {item.label}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate leading-tight mt-0.5">
                        {item.description}
                    </p>
                </div>
            </div>
            <div className="ml-4 flex-shrink-0">
                <Toggle enabled={enabled} onChange={onToggle} />
            </div>
        </div>
    )
}

function SkeletonRow() {
    return (
        <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 animate-pulse" />
                <div className="space-y-1.5">
                    <div className="h-3.5 w-28 rounded-md bg-gray-100 dark:bg-white/5 animate-pulse" />
                    <div className="h-2.5 w-40 rounded-md bg-gray-100 dark:bg-white/5 animate-pulse" />
                </div>
            </div>
            <div className="w-11 h-6 rounded-full bg-gray-100 dark:bg-white/5 animate-pulse ml-4" />
        </div>
    )
}

export default function NotificationSettingsModal({ onClose }: Props) {
    const [settings, setSettings] = useState<NotificationSettings | null>(null)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        notificationsApi.getSettings().then(setSettings).catch(() => { })
    }, [])

    const toggle = (key: SettingKey) => {
        setSettings((prev) =>
            prev ? { ...prev, [key]: !prev[key] } : prev
        )
    }

    const handleSave = async () => {
        if (!settings) return
        setSaving(true)
        try {
            await notificationsApi.updateSettings(settings)
            toast.success("Settings saved")
            onClose()
        } catch {
            toast.error("Something went wrong. Please try again.")
        } finally {
            setSaving(false)
        }
    }

    const channels = settingItems.filter((i) => i.group === "channels")
    const types = settingItems.filter((i) => i.group === "types")

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[88vh] flex flex-col border border-gray-100 dark:border-white/10 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10 flex-shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                            <Bell className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                            Notification settings
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto">
                    {settings ? (
                        <>
                            <SectionLabel>Channels</SectionLabel>
                            {channels.map((item) => (
                                <SettingRow
                                    key={item.key}
                                    item={item}
                                    enabled={!!settings[item.key]}
                                    onToggle={() => toggle(item.key)}
                                />
                            ))}

                            <div className="mx-6 my-2 border-t border-gray-100 dark:border-white/10" />

                            <SectionLabel>Notification types</SectionLabel>
                            {types.map((item) => (
                                <SettingRow
                                    key={item.key}
                                    item={item}
                                    enabled={!!settings[item.key]}
                                    onToggle={() => toggle(item.key)}
                                />
                            ))}
                            <div className="h-4" />
                        </>
                    ) : (
                        <div className="py-2">
                            <div className="px-6 pt-4 pb-2">
                                <div className="h-2.5 w-16 rounded bg-gray-100 dark:bg-white/5 animate-pulse" />
                            </div>
                            {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
                            <div className="mx-6 my-2 border-t border-gray-100 dark:border-white/10" />
                            <div className="px-6 pt-2 pb-2">
                                <div className="h-2.5 w-24 rounded bg-gray-100 dark:bg-white/5 animate-pulse" />
                            </div>
                            {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-2 px-6 py-4 border-t border-gray-100 dark:border-white/10 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="flex-1 h-10 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !settings}
                        className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                                </svg>
                                Saving…
                            </span>
                        ) : (
                            "Save changes"
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}