"use client"

import { useEffect, useState, useCallback } from "react"
import { adminSubscriptionsApi } from "@/lib/api/admin"
import type { Subscription, Paginated } from "@/lib/types/admin"
import {
    CreditCard, CheckCircle2, XCircle, Clock,
    Loader2, ChevronLeft, ChevronRight,
    Calendar, ArrowUpRight, Plus,
} from "lucide-react"

const STATUSES = ["", "trial", "active", "expired", "cancelled", "paused"]

const STATUS_STYLE: Record<string, string> = {
    trial: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    active: "bg-green-500/10 text-green-400 border-green-500/20",
    expired: "bg-red-500/10 text-red-400 border-red-500/20",
    cancelled: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    paused: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
}

export default function SubscriptionsPage() {
    const [data, setData] = useState<Paginated<Subscription> | null>(null)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [status, setStatus] = useState("")
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const PAGE_SIZE = 10

    const load = useCallback(() => {
        setLoading(true)
        adminSubscriptionsApi.getAll({ page, size: PAGE_SIZE, status: status || undefined })
            .then(setData)
            .finally(() => setLoading(false))
    }, [page, status])

    useEffect(() => { load() }, [load])

    // FIX: updateStatus yo'q — backend PATCH /billing/admin/subscriptions/{id} ishlatadi
    const handleStatusUpdate = async (id: string, newStatus: string) => {
        setUpdatingId(id)
        try {
            await adminSubscriptionsApi.update(id, { status: newStatus as Subscription["status"] })
            load()
        } finally {
            setUpdatingId(null)
        }
    }

    const totalPages = data ? data.pages : 1

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold text-white">Subscriptions</h1>
                <p className="text-xs text-gray-600 mt-1">Manage user subscriptions</p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
                {STATUSES.map((s) => (
                    <button
                        key={s || "all"}
                        onClick={() => { setStatus(s); setPage(1) }}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition capitalize ${status === s
                            ? "bg-red-500/15 border-red-500/25 text-red-400"
                            : "bg-white/[0.03] border-white/[0.07] text-gray-500 hover:text-gray-300"
                            }`}
                    >
                        {s || "All"}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                {["ID", "User", "Plan", "Status", "Expires", "Auto-Renew", "Actions"].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-600">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {loading ? (
                                <tr><td colSpan={7} className="px-4 py-12 text-center"><Loader2 className="w-5 h-5 text-red-400 animate-spin mx-auto" /></td></tr>
                            ) : data?.items?.length ? data.items.map((sub) => (
                                <tr key={sub.id} className="hover:bg-white/[0.02] transition">
                                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{sub.id.slice(0, 8)}…</td>
                                    <td className="px-4 py-3 text-xs text-gray-400">{sub.user_id ? sub.user_id.slice(0, 8) + "…" : "—"}</td>
                                    <td className="px-4 py-3 text-xs text-gray-300">{sub.plan?.name ?? sub.plan_id ?? "—"}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLE[sub.status] ?? "text-gray-500 border-white/10"}`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-600">
                                        {sub.end_date ? new Date(sub.end_date).toLocaleDateString() : "—"}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-500">
                                        {sub.auto_renew ? (
                                            <span className="text-green-400">Yes</span>
                                        ) : (
                                            <span className="text-gray-600">No</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {sub.status !== "active" && (
                                            <button
                                                onClick={() => handleStatusUpdate(sub.id, "active")}
                                                disabled={updatingId === sub.id}
                                                className="text-[10px] px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/15 transition flex items-center gap-1"
                                            >
                                                {updatingId === sub.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                                Activate
                                            </button>
                                        )}
                                        {sub.status === "active" && (
                                            <button
                                                onClick={() => handleStatusUpdate(sub.id, "cancelled")}
                                                disabled={updatingId === sub.id}
                                                className="text-[10px] px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/15 transition flex items-center gap-1"
                                            >
                                                {updatingId === sub.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                                                Cancel
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={7} className="px-4 py-12 text-center text-xs text-gray-600">No subscriptions found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {data && data.total > PAGE_SIZE && (
                    <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between">
                        <span className="text-xs text-gray-600">{data.total} total</span>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-7 h-7 flex items-center justify-center rounded-lg border border-white/[0.07] text-gray-500 hover:text-white disabled:opacity-30 transition">
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs text-gray-500 px-2">{page} / {totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-7 h-7 flex items-center justify-center rounded-lg border border-white/[0.07] text-gray-500 hover:text-white disabled:opacity-30 transition">
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}