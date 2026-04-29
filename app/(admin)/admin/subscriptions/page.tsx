"use client"

import { useEffect, useState, useCallback } from "react"
import { adminSubscriptionRequestsApi } from "@/lib/api/admin"
import type { SubscriptionRequest, Paginated } from "@/lib/types/admin"
import {
    CreditCard, CheckCircle2, XCircle, Clock,
    Loader2, ChevronLeft, ChevronRight, X, Check,
    Search,
} from "lucide-react"

const STATUSES = ["", "pending", "approved", "rejected"]

const STATUS_STYLE: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    approved: "bg-green-500/10 text-green-400 border-green-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
}

const STATUS_ICON: Record<string, React.ElementType> = {
    pending: Clock,
    approved: CheckCircle2,
    rejected: XCircle,
}

function ReviewModal({
    request,
    onClose,
    onDone,
}: {
    request: SubscriptionRequest
    onClose: () => void
    onDone: () => void
}) {
    const [action, setAction] = useState<"approved" | "rejected">("approved")
    const [note, setNote] = useState("")
    const [saving, setSaving] = useState(false)

    const submit = async () => {
        setSaving(true)
        try {
            await adminSubscriptionRequestsApi.review(request.id, {
                status: action,
                admin_note: note || undefined,
            })
            onDone()
            onClose()
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative w-full max-w-md rounded-2xl bg-[#0f0f1c] border border-white/[0.08] shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                    <h2 className="text-sm font-semibold text-white">Review Request</h2>
                    <button onClick={onClose} className="text-gray-600 hover:text-white transition">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-6 space-y-5">
                    {/* Request info */}
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4 space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span className="text-gray-600">ID</span>
                            <span className="text-white font-mono">{request.id.slice(0, 16)}…</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Status</span>
                            <span className={`font-medium px-2 py-0.5 rounded-full border text-[10px] ${STATUS_STYLE[request.status] ?? ""}`}>{request.status}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Created</span>
                            <span className="text-white">{new Date(request.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    {/* Action toggle */}
                    <div>
                        <label className="text-xs text-gray-500 block mb-2">Decision</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(["approved", "rejected"] as const).map((a) => (
                                <button
                                    key={a}
                                    onClick={() => setAction(a)}
                                    className={`py-2.5 rounded-xl border text-sm font-medium transition ${action === a
                                        ? a === "approved"
                                            ? "bg-green-500/15 border-green-500/25 text-green-400"
                                            : "bg-red-500/15 border-red-500/25 text-red-400"
                                        : "bg-white/[0.03] border-white/[0.07] text-gray-600 hover:text-gray-400"
                                        }`}
                                >
                                    {a === "approved" ? <CheckCircle2 className="w-4 h-4 inline mr-1.5" /> : <XCircle className="w-4 h-4 inline mr-1.5" />}
                                    {a.charAt(0).toUpperCase() + a.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Note */}
                    <div>
                        <label className="text-xs text-gray-500 block mb-1.5">Admin Note (optional)</label>
                        <textarea
                            rows={3}
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="Internal note…"
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-red-500/40 transition"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-sm text-gray-500 hover:text-white transition">
                            Cancel
                        </button>
                        <button onClick={submit} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-red-500/15 border border-red-500/25 text-sm text-red-400 hover:bg-red-500/20 transition flex items-center justify-center gap-2">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function SubscriptionsPage() {
    const [data, setData] = useState<Paginated<SubscriptionRequest> | null>(null)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [status, setStatus] = useState("")
    const [reviewing, setReviewing] = useState<SubscriptionRequest | null>(null)
    const PAGE_SIZE = 10

    const load = useCallback(() => {
        setLoading(true)
        adminSubscriptionRequestsApi.getAll({
            page,
            size: PAGE_SIZE,
            status: status || undefined,
        })
            .then(setData)
            .finally(() => setLoading(false))
    }, [page, status])

    useEffect(() => { load() }, [load])

    const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold text-white">Subscription Requests</h1>
                <p className="text-xs text-gray-600 mt-1">Review and manage user subscription requests</p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
                {STATUSES.map((s) => (
                    <button
                        key={s || "all"}
                        onClick={() => { setStatus(s); setPage(1) }}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${status === s
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
                                {["ID", "Status", "Plan", "User", "Created", "Actions"].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-600">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center">
                                        <Loader2 className="w-5 h-5 text-red-400 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : data?.items?.length ? data.items.map((req) => {
                                const Icon = STATUS_ICON[req.status] ?? Clock
                                return (
                                    <tr key={req.id} className="hover:bg-white/[0.02] transition">
                                        <td className="px-4 py-3 font-mono text-xs text-gray-400">{req.id.slice(0, 8)}…</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLE[req.status] ?? "text-gray-500 border-white/10"}`}>
                                                <Icon className="w-3 h-3" />
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-400">{req.plan_id ?? "—"}</td>
                                        <td className="px-4 py-3 text-xs text-gray-400">{req.user_id ?? "—"}</td>
                                        <td className="px-4 py-3 text-xs text-gray-600">{new Date(req.created_at).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">
                                            {req.status === "pending" && (
                                                <button
                                                    onClick={() => setReviewing(req)}
                                                    className="text-[10px] px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/15 transition"
                                                >
                                                    Review
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            }) : (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-xs text-gray-600">No requests found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {data && data.total > PAGE_SIZE && (
                    <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between">
                        <span className="text-xs text-gray-600">
                            {data.total} total
                        </span>
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

            {reviewing && (
                <ReviewModal
                    request={reviewing}
                    onClose={() => setReviewing(null)}
                    onDone={load}
                />
            )}
        </div>
    )
}