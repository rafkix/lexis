"use client"

import { useState } from "react"
import { AlertTriangle, RefreshCw, X, Calendar, Clock, Shield } from "lucide-react"
import type { Subscription } from "@/lib/types/billing"
import CancelModal from "./CancelModal"

const statusConfig: Record<string, { badge: string; dot: string; label: string }> = {
    active: { badge: "bg-emerald-100 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500", label: "Active" },
    trial: { badge: "bg-blue-100 text-blue-700 border border-blue-200", dot: "bg-blue-500", label: "Trial" },
    expired: { badge: "bg-indigo-100 text-indigo-600 border border-indigo-200", dot: "bg-indigo-500", label: "Expired" },
    cancelled: { badge: "bg-gray-100 text-gray-500 border border-gray-200", dot: "bg-gray-400", label: "Cancelled" },
    paused: { badge: "bg-amber-100 text-amber-700 border border-amber-200", dot: "bg-amber-500", label: "Paused" },
}

const intervalLabel: Record<string, string> = {
    monthly: "/ month", yearly: "/ year", lifetime: "one-time", daily: "/ day", weekly: "/ week",
}

interface Props {
    subscription: Subscription
    onCancel: (reason: string) => Promise<void>
}

export default function CurrentSubscription({ subscription, onCancel }: Props) {
    const [showCancel, setShowCancel] = useState(false)

    const endDate = subscription.end_date ? new Date(subscription.end_date) : null
    const daysLeft = endDate
        ? Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })

    const cfg = statusConfig[subscription.status] ?? statusConfig.cancelled
    const isUrgent = daysLeft != null && daysLeft <= 3
    const isWarning = daysLeft != null && daysLeft <= 7
    const progressPct = daysLeft != null ? Math.min(100, Math.max(0, (daysLeft / 30) * 100)) : 0

    return (
        <>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* red top line matching active nav accent */}
                <div className="h-1 w-full bg-indigo-600" />

                <div className="p-5">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3 mb-5">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                                <Shield className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-gray-900">{subscription.plan.name}</h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {new Intl.NumberFormat("en-US").format(subscription.plan.price)}{" "}
                                    {subscription.plan.currency}{" "}
                                    {intervalLabel[subscription.plan.interval] ?? ""}
                                </p>
                            </div>
                        </div>

                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${cfg.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                        </span>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Start</p>
                                <p className="text-xs font-semibold text-gray-700">{formatDate(subscription.start_date)}</p>
                            </div>
                        </div>
                        {endDate && (
                            <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2">
                                <Clock className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Ends</p>
                                    <p className="text-xs font-semibold text-gray-700">{formatDate(subscription.end_date!)}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Progress */}
                    {daysLeft !== null && daysLeft > 0 && (
                        <div className="mb-4">
                            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                                <span>Time remaining</span>
                                <span className={isWarning ? "text-indigo-500 font-semibold" : "text-gray-600 font-medium"}>
                                    {daysLeft}d left
                                </span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${isWarning ? "bg-indigo-500" : "bg-emerald-500"}`}
                                    style={{ width: `${progressPct}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Urgent */}
                    {isUrgent && (
                        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-600 text-xs px-3.5 py-2.5 rounded-xl mb-4">
                            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                            Expires in <strong className="ml-1">{daysLeft} day{daysLeft !== 1 ? "s" : ""}</strong> — renew to avoid interruption.
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <RefreshCw className="w-3.5 h-3.5" />
                            Auto-renewal:{" "}
                            <span className={subscription.auto_renew ? "text-emerald-600 font-medium" : "text-gray-400"}>
                                {subscription.auto_renew ? "On" : "Off"}
                            </span>
                        </div>
                        {["active", "trial"].includes(subscription.status) && (
                            <button
                                onClick={() => setShowCancel(true)}
                                className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-500 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" /> Cancel
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <CancelModal open={showCancel} onClose={() => setShowCancel(false)} onConfirm={onCancel} />
        </>
    )
}