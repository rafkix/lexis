"use client"

import { useState } from "react"

import {
    AlertTriangle,
    RefreshCw,
    X,
    Calendar,
    Clock,
    Shield,
    BookOpen,
    Headphones,
    PenLine,
    Mic,
    Infinity,
    Sparkles,
    Crown,
} from "lucide-react"

import type { Subscription } from "@/lib/types/billing"
import type { QuotaOut, TestType } from "@/lib/api/quota"

import CancelModal from "./CancelModal"

// ─────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────

const statusConfig = {
    active: {
        label: "Active",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        gradient: "from-emerald-500 to-teal-500",
    },
    trial: {
        label: "Trial",
        badge: "bg-violet-50 text-violet-700 border-violet-200",
        gradient: "from-violet-500 to-indigo-500",
    },
    expired: {
        label: "Expired",
        badge: "bg-zinc-100 text-zinc-700 border-zinc-200",
        gradient: "from-zinc-400 to-zinc-500",
    },
    cancelled: {
        label: "Cancelled",
        badge: "bg-zinc-100 text-zinc-700 border-zinc-200",
        gradient: "from-zinc-400 to-zinc-500",
    },
    paused: {
        label: "Paused",
        badge: "bg-amber-50 text-amber-700 border-amber-200",
        gradient: "from-amber-500 to-orange-500",
    },
}

const TEST_TYPE_META: Record<
    TestType,
    {
        label: string
        Icon: React.ElementType
        gradient: string
    }
> = {
    READING: {
        label: "Reading",
        Icon: BookOpen,
        gradient: "from-violet-500 to-indigo-500",
    },
    LISTENING: {
        label: "Listening",
        Icon: Headphones,
        gradient: "from-emerald-500 to-teal-500",
    },
    WRITING: {
        label: "Writing",
        Icon: PenLine,
        gradient: "from-amber-500 to-orange-500",
    },
    SPEAKING: {
        label: "Speaking",
        Icon: Mic,
        gradient: "from-rose-500 to-pink-500",
    },
}

const TEST_TYPES: TestType[] = [
    "READING",
    "LISTENING",
    "WRITING",
    "SPEAKING",
]

const intervalLabel: Record<string, string> = {
    monthly: "/month",
    yearly: "/year",
    weekly: "/week",
    daily: "/day",
    lifetime: "one-time",
}

// ─────────────────────────────────────────────────────────────
// QUOTA
// ─────────────────────────────────────────────────────────────

function QuotaSection({ quota }: { quota: QuotaOut }) {
    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400 font-bold">
                        Weekly Usage
                    </p>

                    <h3 className="text-sm font-bold text-gray-900 mt-1">
                        Remaining quota
                    </h3>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <RefreshCw className="w-3.5 h-3.5" />
                    Auto reset
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TEST_TYPES.map((type) => {
                    const item = quota.quotas[type]

                    if (!item) return null

                    const meta = TEST_TYPE_META[type]

                    const isUnlimited = item.limit === -1

                    const percent = isUnlimited
                        ? 100
                        : Math.max(
                            0,
                            Math.min(
                                100,
                                (item.remaining / item.limit) * 100
                            )
                        )

                    return (
                        <div
                            key={type}
                            className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center shadow-sm`}
                                    >
                                        <meta.Icon className="w-4 h-4 text-white" />
                                    </div>

                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">
                                            {meta.label}
                                        </p>

                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Weekly tests
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    {isUnlimited ? (
                                        <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
                                            <Infinity className="w-4 h-4" />
                                            Unlimited
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-xl font-black text-gray-900">
                                                {item.remaining}
                                            </p>

                                            <p className="text-[11px] text-gray-400">
                                                of {item.limit}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {!isUnlimited && (
                                <>
                                    <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full bg-gradient-to-r ${meta.gradient}`}
                                            style={{
                                                width: `${percent}%`,
                                            }}
                                        />
                                    </div>

                                    <div className="flex justify-between mt-2 text-[11px] text-gray-400">
                                        <span>Usage</span>
                                        <span>{Math.round(percent)}%</span>
                                    </div>
                                </>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────

interface Props {
    subscription: Subscription
    quota?: QuotaOut | null
    onCancel: (reason: string) => Promise<void>
}

export default function CurrentSubscription({
    subscription,
    quota,
    onCancel,
}: Props) {
    const [showCancel, setShowCancel] = useState(false)

    const cfg =
        statusConfig[
        subscription.status as keyof typeof statusConfig
        ] || statusConfig.cancelled

    const endDate = subscription.end_date
        ? new Date(subscription.end_date)
        : null

    const startDate = new Date(subscription.start_date)

    const daysLeft = endDate
        ? Math.ceil(
            (endDate.getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
        : null

    const totalDays = endDate
        ? Math.ceil(
            (endDate.getTime() - startDate.getTime()) /
            (1000 * 60 * 60 * 24)
        )
        : null

    const progress =
        totalDays && daysLeft !== null
            ? Math.max(0, Math.min(100, (daysLeft / totalDays) * 100))
            : 0

    const isUrgent = daysLeft !== null && daysLeft <= 3

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })

    return (
        <>
            <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)]">

                {/* TOP LINE */}

                <div
                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${cfg.gradient}`}
                />

                {/* GLOW */}

                <div className="absolute top-0 right-0 w-72 h-72 bg-violet-500/5 blur-3xl rounded-full" />

                <div className="relative p-6 md:p-7">

                    {/* HEADER */}

                    <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">

                        <div className="flex items-start gap-4">

                            <div
                                className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shadow-lg`}
                            >
                                <Crown className="w-7 h-7 text-white" />
                            </div>

                            <div>

                                <div className="flex items-center gap-3 flex-wrap">

                                    <h2 className="text-3xl font-black tracking-tight text-gray-900">
                                        {subscription.plan.name}
                                    </h2>

                                    <div
                                        className={`px-3 py-1 rounded-full border text-xs font-bold ${cfg.badge}`}
                                    >
                                        {cfg.label}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mt-3 text-gray-500">
                                    <Sparkles className="w-4 h-4 text-violet-500" />

                                    <span className="text-sm">
                                        Premium AI preparation plan
                                    </span>
                                </div>

                                <div className="mt-5 flex items-end gap-2">
                                    <span className="text-5xl font-black tracking-tight text-gray-900">
                                        {new Intl.NumberFormat("en-US").format(
                                            subscription.plan.price
                                        )}
                                    </span>

                                    <span className="text-gray-400 pb-1.5">
                                        {subscription.plan.currency}
                                        {" "}
                                        {intervalLabel[
                                            subscription.plan.interval
                                        ]}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* INFO BOX */}

                        <div className="xl:w-[320px] rounded-3xl border border-gray-100 bg-gray-50/80 p-5">

                            <div className="flex items-center justify-between mb-5">
                                <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400 font-bold">
                                    Subscription
                                </p>

                                <Shield className="w-4 h-4 text-violet-500" />
                            </div>

                            <div className="space-y-4">

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-sm">
                                            Started
                                        </span>
                                    </div>

                                    <span className="text-sm font-semibold text-gray-900">
                                        {formatDate(subscription.start_date)}
                                    </span>
                                </div>

                                {endDate && (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-sm">
                                                Expires
                                            </span>
                                        </div>

                                        <span className="text-sm font-semibold text-gray-900">
                                            {formatDate(subscription.end_date!)}
                                        </span>
                                    </div>
                                )}

                                {daysLeft !== null && (
                                    <div className="pt-2">

                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-gray-400">
                                                Remaining time
                                            </span>

                                            <span
                                                className={`text-sm font-bold ${
                                                    isUrgent
                                                        ? "text-amber-600"
                                                        : "text-gray-900"
                                                }`}
                                            >
                                                {daysLeft} days
                                            </span>
                                        </div>

                                        <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full bg-gradient-to-r ${cfg.gradient}`}
                                                style={{
                                                    width: `${progress}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* WARNING */}

                    {isUrgent && (
                        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />

                            <div>
                                <p className="text-sm font-bold text-amber-800">
                                    Subscription expires soon
                                </p>

                                <p className="text-xs text-amber-700 mt-1">
                                    Renew now to avoid losing access.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* QUOTA */}

                    {quota && <QuotaSection quota={quota} />}

                    {/* FOOTER */}

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-6 mt-8 border-t border-gray-100">

                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <RefreshCw className="w-4 h-4" />

                            Auto renew:

                            <span
                                className={
                                    subscription.auto_renew
                                        ? "text-emerald-600 font-semibold"
                                        : "text-gray-500"
                                }
                            >
                                {subscription.auto_renew
                                    ? "Enabled"
                                    : "Disabled"}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">

                            <button
                                className="h-11 px-5 rounded-2xl bg-gray-900 text-white font-semibold hover:opacity-90 transition"
                            >
                                Upgrade Plan
                            </button>

                            {["active", "trial"].includes(subscription.status) && (
                                <button
                                    onClick={() => setShowCancel(true)}
                                    className="h-11 px-5 rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 font-semibold hover:bg-rose-100 transition"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <CancelModal
                open={showCancel}
                onClose={() => setShowCancel(false)}
                onConfirm={onCancel}
            />
        </>
    )
}