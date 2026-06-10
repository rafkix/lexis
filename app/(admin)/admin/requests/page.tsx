"use client"

import { useEffect, useState, useCallback } from "react"
import { adminSubscriptionRequestsApi } from "@/lib/api/admin"
import type { SubscriptionRequest, Paginated } from "@/lib/types/admin"
import {
    FileText, Loader2, ChevronLeft, ChevronRight,
    CheckCircle2, XCircle, Clock, Eye, Trash2, Filter,
} from "lucide-react"

const STATUSES = ["", "pending", "approved", "rejected", "cancelled"]

const STATUS_STYLE: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    approved: "bg-green-500/10 text-green-400 border-green-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
    cancelled: "bg-gray-500/10 text-gray-400 border-gray-500/20",
}

const STATUS_ICON: Record<string, React.ReactNode> = {
    pending: <Clock className="w-3 h-3" />,
    approved: <CheckCircle2 className="w-3 h-3" />,
    rejected: <XCircle className="w-3 h-3" />,
    cancelled: <XCircle className="w-3 h-3" />,
}

// ── Review Modal ─────────────────────────────────────────────────────────────

function ReviewModal({
    req,
    onClose,
    onDone,
}: {
    req: SubscriptionRequest
    onClose: () => void
    onDone: () => void
}) {
    const [action, setAction] = useState<"approve" | "reject" | null>(null)
    const [reason, setReason] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const submit = async () => {
        if (!action) return
        if (action === "reject" && !reason.trim()) {
            setError("Rad etish sababini kiriting")
            return
        }
        setLoading(true)
        setError("")
        try {
            await adminSubscriptionRequestsApi.review(req.id, {
                action,
                rejection_reason: action === "reject" ? reason : undefined,
            })
            onDone()
        } catch (e: any) {
            setError(e?.response?.data?.detail ?? "Xatolik yuz berdi")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg mx-4 rounded-2xl bg-[#111] border border-white/[0.08] shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-semibold text-white">So'rovni ko'rib chiqish</h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {req.plan?.name} — {req.original_amount?.toLocaleString() ?? "—"} so'm
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-600 hover:text-gray-300 transition">
                        <XCircle className="w-4 h-4" />
                    </button>
                </div>

                {/* Screenshot */}
                {req.screenshot_url && req.screenshot_url !== "placeholder" && (
                    <div className="px-6 pt-4">
                        <p className="text-[10px] text-gray-600 mb-1.5 uppercase tracking-wider">Screenshot</p>
                        <a
                            href={req.screenshot_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 transition"
                        >
                            <Eye className="w-3.5 h-3.5" />
                            Ko'rish
                        </a>
                    </div>
                )}

                {/* Note */}
                {req.note && (
                    <div className="px-6 pt-4">
                        <p className="text-[10px] text-gray-600 mb-1.5 uppercase tracking-wider">Izoh</p>
                        <p className="text-xs text-gray-400 bg-white/[0.03] rounded-lg px-3 py-2 border border-white/[0.05]">
                            {req.note}
                        </p>
                    </div>
                )}

                {/* Action choice */}
                <div className="px-6 pt-5">
                    <p className="text-[10px] text-gray-600 mb-2 uppercase tracking-wider">Qaror</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setAction("approve")}
                            className={`flex-1 py-2 rounded-xl text-xs font-medium border transition flex items-center justify-center gap-1.5 ${
                                action === "approve"
                                    ? "bg-green-500/15 border-green-500/30 text-green-400"
                                    : "bg-white/[0.03] border-white/[0.07] text-gray-500 hover:text-gray-300"
                            }`}
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Tasdiqlash
                        </button>
                        <button
                            onClick={() => setAction("reject")}
                            className={`flex-1 py-2 rounded-xl text-xs font-medium border transition flex items-center justify-center gap-1.5 ${
                                action === "reject"
                                    ? "bg-red-500/15 border-red-500/30 text-red-400"
                                    : "bg-white/[0.03] border-white/[0.07] text-gray-500 hover:text-gray-300"
                            }`}
                        >
                            <XCircle className="w-3.5 h-3.5" /> Rad etish
                        </button>
                    </div>
                </div>

                {/* Rejection reason */}
                {action === "reject" && (
                    <div className="px-6 pt-3">
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Rad etish sababi..."
                            rows={3}
                            className="w-full rounded-xl bg-white/[0.03] border border-white/[0.07] text-xs text-gray-300 placeholder-gray-600 px-3 py-2.5 resize-none focus:outline-none focus:border-red-500/30 transition"
                        />
                    </div>
                )}

                {error && (
                    <div className="px-6 pt-2">
                        <p className="text-xs text-red-400">{error}</p>
                    </div>
                )}

                {/* Footer */}
                <div className="px-6 py-4 mt-2 flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 rounded-xl text-xs font-medium border border-white/[0.07] text-gray-500 hover:text-gray-300 transition"
                    >
                        Bekor qilish
                    </button>
                    <button
                        onClick={submit}
                        disabled={!action || loading}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 disabled:opacity-40 bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/25"
                    >
                        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                        Saqlash
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SubscriptionRequestsPage() {
    const [data, setData] = useState<Paginated<SubscriptionRequest> | null>(null)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [status, setStatus] = useState("")
    const [reviewing, setReviewing] = useState<SubscriptionRequest | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const PAGE_SIZE = 10

    const load = useCallback(() => {
        setLoading(true)
        adminSubscriptionRequestsApi
            .getAll({ page, size: PAGE_SIZE, status: status || undefined })
            .then(setData)
            .finally(() => setLoading(false))
    }, [page, status])

    useEffect(() => { load() }, [load])

    const handleDelete = async (id: string) => {
        if (!confirm("Bu so'rovni o'chirasizmi?")) return
        setDeletingId(id)
        try {
            await adminSubscriptionRequestsApi.delete(id)
            load()
        } finally {
            setDeletingId(null)
        }
    }

    const totalPages = data ? data.pages : 1

    return (
        <div className="space-y-6">
            {reviewing && (
                <ReviewModal
                    req={reviewing}
                    onClose={() => setReviewing(null)}
                    onDone={() => { setReviewing(null); load() }}
                />
            )}

            <div>
                <h1 className="text-xl font-bold text-white">Subscription Requests</h1>
                <p className="text-xs text-gray-600 mt-1">Review incoming payment requests</p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-3.5 h-3.5 text-gray-600" />
                {STATUSES.map((s) => (
                    <button
                        key={s || "all"}
                        onClick={() => { setStatus(s); setPage(1) }}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition capitalize ${
                            status === s
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
                                {["ID", "User", "Plan", "Amount", "Status", "Date", "Actions"].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-600">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center">
                                        <Loader2 className="w-5 h-5 text-indigo-400 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : data?.items?.length ? data.items.map((req) => (
                                <tr key={req.id} className="hover:bg-white/[0.02] transition">
                                    <td className="px-4 py-3 font-mono text-xs text-gray-400">
                                        {req.id.slice(0, 8)}…
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-400">
                                        {req.user?.email ?? req.user_id.slice(0, 8) + "…"}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-300">
                                        {req.plan?.name ?? "—"}
                                    </td>
                                    <td className="px-4 py-3 text-xs font-semibold text-white">
                                        {req.original_amount != null
                                            ? req.original_amount.toLocaleString() + " so'm"
                                            : "—"}
                                        {req.discount_amount > 0 && (
                                            <span className="ml-1 text-[10px] text-green-400 font-normal">
                                                -{req.discount_amount.toLocaleString()}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 w-fit ${STATUS_STYLE[req.status] ?? "text-gray-500 border-white/10"}`}>
                                            {STATUS_ICON[req.status]}
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-600">
                                        {new Date(req.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5">
                                            {req.status === "pending" && (
                                                <button
                                                    onClick={() => setReviewing(req)}
                                                    className="text-[10px] px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/15 transition flex items-center gap-1"
                                                >
                                                    <Eye className="w-3 h-3" />
                                                    Ko'rib chiqish
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(req.id)}
                                                disabled={deletingId === req.id}
                                                className="w-6 h-6 flex items-center justify-center rounded-lg bg-red-500/5 border border-red-500/10 text-red-500/50 hover:text-red-400 hover:bg-red-500/10 transition"
                                            >
                                                {deletingId === req.id
                                                    ? <Loader2 className="w-3 h-3 animate-spin" />
                                                    : <Trash2 className="w-3 h-3" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-xs text-gray-600">
                                        No requests found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {data && data.total > PAGE_SIZE && (
                    <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between">
                        <span className="text-xs text-gray-600">{data.total} total</span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="w-7 h-7 flex items-center justify-center rounded-lg border border-white/[0.07] text-gray-500 hover:text-white disabled:opacity-30 transition"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs text-gray-500 px-2">{page} / {totalPages}</span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="w-7 h-7 flex items-center justify-center rounded-lg border border-white/[0.07] text-gray-500 hover:text-white disabled:opacity-30 transition"
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}