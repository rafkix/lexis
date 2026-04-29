"use client"

import { useEffect, useState, useCallback } from "react"
import { adminPaymentsApi } from "@/lib/api/admin"
import type { Payment, Paginated, ManualPaymentPayload } from "@/lib/types/admin"
import {
    Receipt, Plus, CheckCircle2, XCircle, Clock,
    Loader2, ChevronLeft, ChevronRight, X, Check,
    DollarSign,
} from "lucide-react"

const STATUSES = ["", "pending", "completed", "failed"]

const STATUS_STYLE: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    completed: "bg-green-500/10 text-green-400 border-green-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
}

const inputCls = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-red-500/40 transition"

function ManualPaymentModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
    const [form, setForm] = useState<ManualPaymentPayload>({ user_id: "", amount: 0, plan_id: "" })
    const [saving, setSaving] = useState(false)

    const submit = async () => {
        setSaving(true)
        try {
            await adminPaymentsApi.createManual(form)
            onDone()
            onClose()
        } finally {
            setSaving(false)
        }
    }

    const f = (field: keyof ManualPaymentPayload) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(prev => ({ ...prev, [field]: field === "amount" ? Number(e.target.value) : e.target.value }))

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative w-full max-w-md rounded-2xl bg-[#0f0f1c] border border-white/[0.08] shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                    <h2 className="text-sm font-semibold text-white">Manual Payment</h2>
                    <button onClick={onClose} className="text-gray-600 hover:text-white transition"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs text-gray-500">User ID</label>
                        <input className={inputCls} value={form.user_id} onChange={f("user_id")} placeholder="user_xxx" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs text-gray-500">Plan ID</label>
                        <input className={inputCls} value={form.plan_id} onChange={f("plan_id")} placeholder="plan_xxx" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs text-gray-500">Amount (cents)</label>
                        <input type="number" className={inputCls} value={form.amount} onChange={f("amount")} />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-sm text-gray-500 hover:text-white transition">Cancel</button>
                        <button onClick={submit} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-red-500/15 border border-red-500/25 text-sm text-red-400 hover:bg-red-500/20 transition flex items-center justify-center gap-2">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Create
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function PaymentsPage() {
    const [data, setData] = useState<Paginated<Payment> | null>(null)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [status, setStatus] = useState("")
    const [showManual, setShowManual] = useState(false)
    const [confirmingId, setConfirmingId] = useState<string | null>(null)
    const PAGE_SIZE = 10

    const load = useCallback(() => {
        setLoading(true)
        adminPaymentsApi.getAll({ page, size: PAGE_SIZE, status: status || undefined })
            .then(setData)
            .finally(() => setLoading(false))
    }, [page, status])

    useEffect(() => { load() }, [load])

    const handleConfirm = async (id: string) => {
        setConfirmingId(id)
        try {
            await adminPaymentsApi.confirm(id)
            load()
        } finally {
            setConfirmingId(null)
        }
    }

    const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">Payments</h1>
                    <p className="text-xs text-gray-600 mt-1">View and manage all payments</p>
                </div>
                <button
                    onClick={() => setShowManual(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/25 text-red-400 text-sm font-medium hover:bg-red-500/20 transition"
                >
                    <Plus className="w-4 h-4" /> Manual Payment
                </button>
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
                                {["ID", "Amount", "Status", "User", "Plan", "Created", "Actions"].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-600">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {loading ? (
                                <tr><td colSpan={7} className="px-4 py-12 text-center"><Loader2 className="w-5 h-5 text-red-400 animate-spin mx-auto" /></td></tr>
                            ) : data?.items?.length ? data.items.map((p) => (
                                <tr key={p.id} className="hover:bg-white/[0.02] transition">
                                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{p.id.slice(0, 8)}…</td>
                                    <td className="px-4 py-3 text-xs font-semibold text-white">
                                        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3 text-gray-600" />{(p.amount / 100).toFixed(2)}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLE[p.status] ?? "text-gray-500 border-white/10"}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-400">{p.user_id ?? "—"}</td>
                                    <td className="px-4 py-3 text-xs text-gray-400">{p.plan_id ?? "—"}</td>
                                    <td className="px-4 py-3 text-xs text-gray-600">{new Date(p.created_at).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        {p.status === "pending" && (
                                            <button
                                                onClick={() => handleConfirm(p.id)}
                                                disabled={confirmingId === p.id}
                                                className="text-[10px] px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/15 transition flex items-center gap-1"
                                            >
                                                {confirmingId === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
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

            {showManual && <ManualPaymentModal onClose={() => setShowManual(false)} onDone={load} />}
        </div>
    )
}