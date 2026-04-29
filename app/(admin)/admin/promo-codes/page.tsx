"use client"

import { useEffect, useState, useCallback } from "react"
import { adminPromoApi } from "@/lib/api/admin"
import type { PromoCode, PromoCodeCreate, PromoCodeUpdate } from "@/lib/types/billing"
import type { Paginated } from "@/lib/types/admin"
import {
    TicketPercent, Plus, Pencil, Trash2, Loader2,
    X, Check, ChevronLeft, ChevronRight, Copy, CheckCheck,
} from "lucide-react"

const inputCls = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-red-500/40 transition"

const EMPTY: PromoCodeCreate = {
    code: "",
    discount_percent: 0,
    max_uses: undefined,
    expires_at: undefined,
    is_active: true,
}

function PromoModal({
    initial,
    onClose,
    onDone,
}: {
    initial?: PromoCode
    onClose: () => void
    onDone: () => void
}) {
    const [form, setForm] = useState<PromoCodeCreate>(
        initial
            ? {
                code: initial.code,
                discount_percent: initial.discount_percent,
                max_uses: initial.max_uses,
                expires_at: initial.expires_at,
                is_active: initial.is_active,
            }
            : EMPTY
    )
    const [saving, setSaving] = useState(false)

    const submit = async () => {
        setSaving(true)
        try {
            if (initial) {
                await adminPromoApi.update(initial.id, form as PromoCodeUpdate)
            } else {
                await adminPromoApi.create(form)
            }
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
                    <h2 className="text-sm font-semibold text-white">{initial ? "Edit Promo Code" : "Create Promo Code"}</h2>
                    <button onClick={onClose} className="text-gray-600 hover:text-white transition"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs text-gray-500">Code</label>
                        <input className={inputCls} value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SUMMER25" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-500">Discount %</label>
                            <input type="number" min={0} max={100} className={inputCls} value={form.discount_percent} onChange={e => setForm(f => ({ ...f, discount_percent: Number(e.target.value) }))} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-500">Max Uses</label>
                            <input type="number" className={inputCls} value={form.max_uses ?? ""} placeholder="Unlimited" onChange={e => setForm(f => ({ ...f, max_uses: e.target.value ? Number(e.target.value) : undefined }))} />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs text-gray-500">Expires At</label>
                        <input type="datetime-local" className={inputCls} value={form.expires_at ?? ""} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value || undefined }))} />
                    </div>
                    <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <div
                                onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                                className={`w-9 h-5 rounded-full border transition-all flex items-center px-0.5 ${form.is_active ? "bg-red-500/20 border-red-500/30" : "bg-white/[0.04] border-white/10"}`}
                            >
                                <div className={`w-4 h-4 rounded-full transition-all ${form.is_active ? "bg-red-400 translate-x-4" : "bg-gray-600"}`} />
                            </div>
                            <span className="text-xs text-gray-400">Active</span>
                        </label>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-sm text-gray-500 hover:text-white transition">Cancel</button>
                        <button onClick={submit} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-red-500/15 border border-red-500/25 text-sm text-red-400 hover:bg-red-500/20 transition flex items-center justify-center gap-2">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function CopyBtn({ text }: { text: string }) {
    const [copied, setCopied] = useState(false)
    const copy = () => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }
    return (
        <button onClick={copy} className="ml-1 text-gray-600 hover:text-gray-300 transition">
            {copied ? <CheckCheck className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
        </button>
    )
}

export default function PromoCodesPage() {
    const [data, setData] = useState<Paginated<PromoCode> | null>(null)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [onlyActive, setOnlyActive] = useState(false)
    const [modal, setModal] = useState<PromoCode | true | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const PAGE_SIZE = 10

    const load = useCallback(() => {
        setLoading(true)
        adminPromoApi.getAll({ page, size: PAGE_SIZE, only_active: onlyActive || undefined })
            .then(setData)
            .finally(() => setLoading(false))
    }, [page, onlyActive])

    useEffect(() => { load() }, [load])

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this promo code?")) return
        setDeletingId(id)
        try {
            await adminPromoApi.delete(id)
            load()
        } finally {
            setDeletingId(null)
        }
    }

    const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">Promo Codes</h1>
                    <p className="text-xs text-gray-600 mt-1">Manage discount and promotional codes</p>
                </div>
                <button
                    onClick={() => setModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/25 text-red-400 text-sm font-medium hover:bg-red-500/20 transition"
                >
                    <Plus className="w-4 h-4" /> New Code
                </button>
            </div>

            {/* Filter */}
            <label className="flex items-center gap-2 cursor-pointer w-fit">
                <div
                    onClick={() => { setOnlyActive(v => !v); setPage(1) }}
                    className={`w-9 h-5 rounded-full border transition-all flex items-center px-0.5 ${onlyActive ? "bg-red-500/20 border-red-500/30" : "bg-white/[0.04] border-white/10"}`}
                >
                    <div className={`w-4 h-4 rounded-full transition-all ${onlyActive ? "bg-red-400 translate-x-4" : "bg-gray-600"}`} />
                </div>
                <span className="text-xs text-gray-400">Only active</span>
            </label>

            {/* Table */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                {["Code", "Discount", "Uses", "Expires", "Status", "Actions"].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-600">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {loading ? (
                                <tr><td colSpan={6} className="px-4 py-12 text-center"><Loader2 className="w-5 h-5 text-red-400 animate-spin mx-auto" /></td></tr>
                            ) : data?.items?.length ? data.items.map((c) => (
                                <tr key={c.id} className="hover:bg-white/[0.02] transition">
                                    <td className="px-4 py-3">
                                        <span className="font-mono text-xs font-semibold text-white bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 rounded-lg">
                                            {c.code}
                                        </span>
                                        <CopyBtn text={c.code} />
                                    </td>
                                    <td className="px-4 py-3 text-xs font-semibold text-red-400">{c.discount_percent}%</td>
                                    <td className="px-4 py-3 text-xs text-gray-400">
                                        {c.current_uses ?? 0}{c.max_uses ? ` / ${c.max_uses}` : " / ∞"}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-500">
                                        {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${c.is_active ? "bg-green-500/10 text-green-400 border-green-500/20" : "text-gray-500 border-white/10 bg-white/5"}`}>
                                            {c.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => setModal(c)} className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.07] transition">
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => handleDelete(c.id)} disabled={deletingId === c.id} className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/8 transition">
                                                {deletingId === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={6} className="px-4 py-12 text-center text-xs text-gray-600">No promo codes found</td></tr>
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

            {modal !== null && (
                <PromoModal
                    initial={modal === true ? undefined : modal}
                    onClose={() => setModal(null)}
                    onDone={load}
                />
            )}
        </div>
    )
}