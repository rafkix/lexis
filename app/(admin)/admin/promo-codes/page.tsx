"use client"

import { useEffect, useState, useCallback } from "react"
import { billingApi } from "@/lib/api/billing"
import type { PromoCode, PromoCodeCreate, PromoCodeUpdate } from "@/lib/types/billing"
import {
    Plus, Pencil, Trash2, Loader2,
    X, Check, ChevronLeft, ChevronRight, Copy, CheckCheck,
    Tag, ToggleLeft, ToggleRight, Search, RefreshCw,
    CalendarClock, Infinity, AlertCircle,
} from "lucide-react"

// ─── Design tokens ────────────────────────────────────────────────────────────
const PRIMARY = "#6366f1"
const PRIMARY_DARK = "#4f46e5"

const inputCls = [
    "w-full h-11 rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-900",
    "placeholder-gray-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition",
].join(" ")

// ─── Types ────────────────────────────────────────────────────────────────────
const EMPTY: PromoCodeCreate = {
    code: "",
    discount_type: "percent",
    discount_value: 0,
    max_uses: undefined,
    valid_from: null,
    valid_until: null,
    is_active: true,
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
    return (
        <button
            type="button"
            onClick={onChange}
            className="flex items-center gap-2 focus:outline-none"
        >
            {value
                ? <ToggleRight className="w-8 h-8 transition-all" style={{ color: PRIMARY }} />
                : <ToggleLeft className="w-8 h-8 text-gray-300 transition-all" />
            }
            <span className="text-sm font-medium text-gray-700">{value ? "Active" : "Inactive"}</span>
        </button>
    )
}

// ─── Copy Button ──────────────────────────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
    const [copied, setCopied] = useState(false)
    const copy = (e: React.MouseEvent) => {
        e.stopPropagation()
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }
    return (
        <button
            onClick={copy}
            className="ml-1.5 text-gray-400 hover:text-indigo-500 transition"
            title="Copy code"
        >
            {copied
                ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                : <Copy className="w-3.5 h-3.5" />
            }
        </button>
    )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ active }: { active: boolean }) {
    return (
        <span
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border"
            style={active
                ? { background: "#ecfdf5", color: "#059669", borderColor: "#a7f3d0" }
                : { background: "#f9fafb", color: "#9ca3af", borderColor: "#e5e7eb" }
            }
        >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? "#10b981" : "#d1d5db" }} />
            {active ? "Active" : "Inactive"}
        </span>
    )
}

// ─── Promo Modal ──────────────────────────────────────────────────────────────
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
                discount_type: initial.discount_type,
                discount_value: initial.discount_value,
                max_uses: initial.max_uses,
                valid_from: null,
                valid_until: initial.valid_until,
                is_active: initial.is_active,
            }
            : EMPTY
    )
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const submit = async () => {
        if (!form.code.trim()) { setError("Code is required"); return }
        if (form.discount_type === "percent" && (form.discount_value < 1 || form.discount_value > 100)) {
            setError("Percent discount must be between 1 and 100")
            return
        }
        if (form.discount_type === "fixed" && form.discount_value < 0) {
            setError("Fixed discount must be a positive number")
            return
        }
        setSaving(true)
        setError(null)
        try {
            if (initial) {
                await billingApi.updatePromoCode(initial.id, form as PromoCodeUpdate)
            } else {
                await billingApi.createPromoCode(form)
            }
            onDone()
            onClose()
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Something went wrong")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl" style={{ border: "1px solid #ececf3" }}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${PRIMARY}12` }}>
                            <Tag className="w-4 h-4" style={{ color: PRIMARY }} />
                        </div>
                        <h2 className="text-base font-black text-gray-900">
                            {initial ? "Edit Promo Code" : "Create Promo Code"}
                        </h2>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    {/* Code */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Code</label>
                        <input
                            className={inputCls}
                            value={form.code}
                            onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase().replace(/\s/g, "") }))}
                            placeholder="SUMMER25"
                        />
                    </div>

                    {/* Discount type + value */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Discount Type</label>
                            <select
                                className={inputCls}
                                value={form.discount_type}
                                onChange={e => setForm(f => ({ ...f, discount_type: e.target.value as "percent" | "fixed" }))}
                            >
                                <option value="percent">Percent (%)</option>
                                <option value="fixed">Fixed amount</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                                {form.discount_type === "percent" ? "Discount %" : "Discount Amount"}
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min={0}
                                    max={form.discount_type === "percent" ? 100 : undefined}
                                    className={inputCls}
                                    value={form.discount_value}
                                    onChange={e => setForm(f => ({ ...f, discount_value: Number(e.target.value) }))}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">
                                    {form.discount_type === "percent" ? "%" : "UZS"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Max Uses */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Max Uses</label>
                        <input
                            type="number"
                            className={inputCls}
                            value={form.max_uses ?? ""}
                            placeholder="Unlimited"
                            onChange={e => setForm(f => ({ ...f, max_uses: e.target.value ? Number(e.target.value) : undefined }))}
                        />
                    </div>

                    {/* Valid Until */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Valid Until</label>
                        <input
                            type="datetime-local"
                            className={inputCls}
                            value={form.valid_until ?? ""}
                            onChange={e => setForm(f => ({ ...f, valid_until: e.target.value || null }))}
                        />
                    </div>

                    {/* Active toggle */}
                    <div className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: "#f9fafb", border: "1px solid #f0f0f0" }}>
                        <div>
                            <p className="text-sm font-semibold text-gray-700">Status</p>
                            <p className="text-xs text-gray-400 mt-0.5">Enable or disable this promo code</p>
                        </div>
                        <Toggle value={form.is_active} onChange={() => setForm(f => ({ ...f, is_active: !f.is_active }))} />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="rounded-xl px-4 py-3 bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />{error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 h-11 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={submit}
                        disabled={saving}
                        className="flex-1 h-11 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition"
                        style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)` }}
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        {initial ? "Save Changes" : "Create Code"}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ code, onClose, onConfirm, loading }: {
    code: PromoCode
    onClose: () => void
    onConfirm: () => void
    loading: boolean
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 text-center" style={{ border: "1px solid #ececf3" }}>
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <h2 className="text-lg font-black text-gray-900 mb-2">Delete Promo Code?</h2>
                <p className="text-sm text-gray-500 mb-1">You are about to delete</p>
                <span className="font-mono font-black text-base px-3 py-1 rounded-xl" style={{ background: `${PRIMARY}10`, color: PRIMARY_DARK }}>
                    {code.code}
                </span>
                <p className="text-xs text-gray-400 mt-3 mb-6">This action cannot be undone.</p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 h-11 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 h-11 rounded-2xl bg-red-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-600 transition disabled:opacity-60"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Stats Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
    return (
        <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #ececf3" }}>
            <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
            <p className="text-2xl font-black text-gray-900">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10

export default function PromoCodesPage() {
    const [items, setItems] = useState<PromoCode[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [onlyActive, setOnlyActive] = useState(false)
    const [search, setSearch] = useState("")

    const [createModal, setCreateModal] = useState(false)
    const [editTarget, setEditTarget] = useState<PromoCode | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<PromoCode | null>(null)
    const [deleting, setDeleting] = useState(false)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await billingApi.listPromoCodes({
                page,
                size: PAGE_SIZE,
                only_active: onlyActive || undefined,
            })
            setItems(res.items)
            setTotal(res.total)
        } finally {
            setLoading(false)
        }
    }, [page, onlyActive])

    useEffect(() => { load() }, [load])

    const handleDelete = async () => {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            await billingApi.deletePromoCode(deleteTarget.id)
            setDeleteTarget(null)
            load()
        } finally {
            setDeleting(false)
        }
    }

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

    // Client-side search filter
    const filtered = search.trim()
        ? items.filter(c => c.code.toLowerCase().includes(search.toLowerCase()))
        : items

    // Stats
    const activeCount = items.filter(c => c.is_active).length
    const totalUses = items.reduce((s, c) => s + (c.uses_count ?? 0), 0)

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Promo Codes</h1>
                    <p className="text-sm text-gray-400 mt-1">Manage discount and promotional codes</p>
                </div>
                <button
                    onClick={() => setCreateModal(true)}
                    className="flex items-center gap-2 px-5 h-11 rounded-2xl text-white font-bold text-sm"
                    style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)` }}
                >
                    <Plus className="w-4 h-4" />
                    New Code
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total codes" value={total} />
                <StatCard label="Active codes" value={activeCount} sub={`${total - activeCount} inactive`} />
                <StatCard label="Total uses" value={totalUses} sub="across all codes" />
                <StatCard label="Page size" value={PAGE_SIZE} sub={`page ${page} of ${totalPages}`} />
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by code..."
                        className="w-full h-11 rounded-2xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                    />
                </div>

                {/* Only active toggle */}
                <button
                    onClick={() => { setOnlyActive(v => !v); setPage(1) }}
                    className="flex items-center gap-2 h-11 px-4 rounded-2xl border font-medium text-sm transition"
                    style={{
                        borderColor: onlyActive ? PRIMARY : "#e5e7eb",
                        background: onlyActive ? `${PRIMARY}08` : "#fff",
                        color: onlyActive ? PRIMARY_DARK : "#6b7280",
                    }}
                >
                    {onlyActive
                        ? <ToggleRight className="w-4 h-4" style={{ color: PRIMARY }} />
                        : <ToggleLeft className="w-4 h-4 text-gray-400" />
                    }
                    Only active
                </button>

                {/* Refresh */}
                <button
                    onClick={load}
                    className="h-11 w-11 rounded-2xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:border-indigo-300 transition"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl overflow-hidden" style={{ border: "1px solid #ececf3" }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                                {["Code", "Discount", "Usage", "Expires", "Status", "Actions"].map(h => (
                                    <th key={h} className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wide">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-16 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto" style={{ color: PRIMARY }} />
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${PRIMARY}10` }}>
                                                <Tag className="w-6 h-6" style={{ color: PRIMARY }} />
                                            </div>
                                            <p className="text-sm font-semibold text-gray-500">No promo codes found</p>
                                            <p className="text-xs text-gray-400">Create your first promo code to get started</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.map((c, i) => {
                                const expired = c.valid_until && new Date(c.valid_until) < new Date()
                                const usagePercent = c.max_uses ? Math.round((c.uses_count ?? 0) / c.max_uses * 100) : null

                                return (
                                    <tr
                                        key={c.id}
                                        style={{ borderTop: i === 0 ? "none" : "1px solid #f9fafb" }}
                                        className="hover:bg-indigo-50/30 transition-colors"
                                    >
                                        {/* Code */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <span
                                                    className="font-mono font-black text-sm px-3 py-1 rounded-xl"
                                                    style={{ background: `${PRIMARY}10`, color: PRIMARY_DARK }}
                                                >
                                                    {c.code}
                                                </span>
                                                <CopyBtn text={c.code} />
                                            </div>
                                        </td>

                                        {/* Discount */}
                                        <td className="px-5 py-4">
                                            <span className="font-black text-base" style={{ color: PRIMARY }}>
                                                {c.discount_type === "percent"
                                                    ? `${c.discount_value}%`
                                                    : `${c.discount_value.toLocaleString()} UZS`
                                                }
                                            </span>
                                        </td>

                                        {/* Usage */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-700 font-semibold">
                                                    {c.uses_count ?? 0}
                                                </span>
                                                <span className="text-gray-400 text-sm">/</span>
                                                {c.max_uses
                                                    ? <span className="text-sm text-gray-500">{c.max_uses}</span>
                                                    : <Infinity className="w-4 h-4 text-gray-400" />
                                                }
                                            </div>
                                            {usagePercent !== null && (
                                                <div className="mt-1.5 w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={{
                                                            width: `${Math.min(100, usagePercent)}%`,
                                                            background: usagePercent >= 90 ? "#ef4444" : PRIMARY,
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </td>

                                        {/* Expires */}
                                        <td className="px-5 py-4">
                                            {c.valid_until ? (
                                                <div className="flex items-center gap-1.5">
                                                    <CalendarClock className={`w-3.5 h-3.5 ${expired ? "text-red-400" : "text-gray-400"}`} />
                                                    <span className={`text-xs font-medium ${expired ? "text-red-500" : "text-gray-600"}`}>
                                                        {new Date(c.valid_until).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                                    </span>
                                                    {expired && (
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-red-50 text-red-500 border border-red-100">
                                                            Expired
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-gray-400">
                                                    <Infinity className="w-3.5 h-3.5" />
                                                    <span className="text-xs">No expiry</span>
                                                </div>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-4">
                                            <StatusBadge active={c.is_active} />
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setEditTarget(c)}
                                                    className="h-8 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition"
                                                    style={{ borderColor: "#e5e7eb", color: "#6b7280" }}
                                                    onMouseEnter={e => {
                                                        const t = e.currentTarget
                                                        t.style.borderColor = PRIMARY
                                                        t.style.color = PRIMARY
                                                        t.style.background = `${PRIMARY}08`
                                                    }}
                                                    onMouseLeave={e => {
                                                        const t = e.currentTarget
                                                        t.style.borderColor = "#e5e7eb"
                                                        t.style.color = "#6b7280"
                                                        t.style.background = "transparent"
                                                    }}
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(c)}
                                                    className="h-8 w-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {total > PAGE_SIZE && (
                    <div className="px-5 py-4 flex items-center justify-between" style={{ borderTop: "1px solid #f3f4f6" }}>
                        <span className="text-xs text-gray-400 font-medium">
                            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-30 transition"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                .reduce<(number | "…")[]>((acc, p, i, arr) => {
                                    if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("…")
                                    acc.push(p)
                                    return acc
                                }, [])
                                .map((p, i) =>
                                    p === "…" ? (
                                        <span key={`dots-${i}`} className="w-8 text-center text-xs text-gray-400">…</span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p as number)}
                                            className="w-8 h-8 rounded-xl border text-xs font-bold transition"
                                            style={{
                                                borderColor: page === p ? PRIMARY : "#e5e7eb",
                                                background: page === p ? `${PRIMARY}10` : "transparent",
                                                color: page === p ? PRIMARY_DARK : "#6b7280",
                                            }}
                                        >
                                            {p}
                                        </button>
                                    )
                                )
                            }
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-30 transition"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {createModal && (
                <PromoModal
                    onClose={() => setCreateModal(false)}
                    onDone={load}
                />
            )}
            {editTarget && (
                <PromoModal
                    initial={editTarget}
                    onClose={() => setEditTarget(null)}
                    onDone={load}
                />
            )}
            {deleteTarget && (
                <DeleteModal
                    code={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={handleDelete}
                    loading={deleting}
                />
            )}
        </div>
    )
}