"use client"

import { useState, useEffect, useCallback } from "react"
import { adminPaymentsApi } from "@/lib/api/admin"
import type { Payment, Paginated } from "@/lib/types/admin"
import {
    Receipt, Loader2, ChevronLeft, ChevronRight, Filter,
    DollarSign, Plus, Check, CheckCircle2, XCircle,
} from "lucide-react"

const STATUSES = ["", "pending", "completed", "failed", "refunded"]

const STATUS_STYLE: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    completed: "bg-green-500/10 text-green-400 border-green-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
    refunded: "bg-gray-500/10 text-gray-400 border-gray-500/20",
}

export default function PaymentsPage() {
    const [data, setData] = useState<Paginated<Payment> | null>(null)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [status, setStatus] = useState("")
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const PAGE_SIZE = 10

    const load = useCallback(() => {
        setLoading(true)
        adminPaymentsApi.getAll({ page, size: PAGE_SIZE, status: status || undefined })
            .then(setData)
            .finally(() => setLoading(false))
    }, [page, status])

    useEffect(() => { load() }, [load])

    const handleStatusUpdate = async (id: string) => {
        setUpdatingId(id)
        try {
            await adminPaymentsApi.confirm(id)
            load()
        } finally {
            setUpdatingId(null)
        }
    }

    const totalPages = data ? data.pages : 1

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold text-white">Payments</h1>
                <p className="text-xs text-gray-600 mt-1">View and manage all payments</p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-gray-600" />
                {STATUSES.map((s) => (
                    <button
                        key={s || "all"}
                        onClick={() => { setStatus(s); setPage(1) }}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition capitalize ${status === s
                                ? "bg-indigo-500/15 border-indigo-500/25 text-indigo-400"
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
                                {["ID", "User", "Amount", "Status", "Provider", "Date", "Actions"].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-600">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {loading ? (
                                <tr><td colSpan={7} className="px-4 py-12 text-center"><Loader2 className="w-5 h-5 text-indigo-400 animate-spin mx-auto" /></td></tr>
                            ) : data?.items?.length ? data.items.map((p) => (
                                <tr key={p.id} className="hover:bg-white/[0.02] transition">
                                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{p.id.slice(0, 8)}…</td>
                                    <td className="px-4 py-3 text-xs text-gray-400">{p.user_id ? p.user_id.slice(0, 8) + "…" : "—"}</td>
                                    <td className="px-4 py-3 text-xs font-semibold text-white">
                                        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3 text-gray-600" />{p.amount.toFixed(2)}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLE[p.status] ?? "text-gray-500 border-white/10"}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-500">{p.provider}</td>
                                    <td className="px-4 py-3 text-xs text-gray-600">{new Date(p.created_at).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        {p.status === "pending" && (
                                            <button
                                                onClick={() => handleStatusUpdate(p.id)}
                                                disabled={updatingId === p.id}
                                                className="text-[10px] px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/15 transition flex items-center gap-1"
                                            >
                                                {updatingId === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                                Confirm
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={7} className="px-4 py-12 text-center text-xs text-gray-600">No payments found</td></tr>
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