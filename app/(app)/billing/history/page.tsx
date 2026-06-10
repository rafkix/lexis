"use client"

import { useEffect, useState, useCallback } from "react"
import {
    CheckCircle, Clock, XCircle, RefreshCw,
    CreditCard, ChevronLeft, ChevronRight,
    Download, Calendar, ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { billingApi } from "@/lib/api/billing"
import type { Payment } from "@/lib/types/billing"

// Extended type that covers extra fields the API returns but the base type omits
type PaymentItem = Payment & {
    sub_description?: string
    plan?: string
    plan_variant?: string
    invoice?: string | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const C1 = "#6366f1"
const C2 = "#4f46e5"
const PAGE_SIZE = 10

const statusConfig: Record<string, {
    icon: React.ElementType
    color: string
    bg: string
    border: string
    label: string
}> = {
    completed: {
        icon: CheckCircle,
        color: "#059669",
        bg: "#ecfdf5",
        border: "#a7f3d0",
        label: "Completed",
    },
    pending: {
        icon: Clock,
        color: "#d97706",
        bg: "#fffbeb",
        border: "#fde68a",
        label: "Pending",
    },
    failed: {
        icon: XCircle,
        color: "#ef4444",
        bg: "#fef2f2",
        border: "#fecaca",
        label: "Failed",
    },
    refunded: {
        icon: RefreshCw,
        color: "#6366f1",
        bg: "#eef2ff",
        border: "#c7d2fe",
        label: "Refunded",
    },
    cancelled: {
        icon: XCircle,
        color: "#6b7280",
        bg: "#f9fafb",
        border: "#e5e7eb",
        label: "Cancelled",
    },
}

const planColors: Record<string, { bg: string; color: string; border: string }> = {
    "Pro Practice": { bg: "#eef2ff", color: "#4338ca", border: "#c7d2fe" },
    "Premium Mastery": { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
    "Free Starter": { bg: "#f3f4f6", color: "#4b5563", border: "#e5e7eb" },
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_PAYMENTS: PaymentItem[] = [
    { id: "1", description: "Pro Practice - Monthly", sub_description: "Subscription payment", plan: "Pro Practice", plan_variant: "Monthly", amount: 59950, currency: "UZS", status: "completed", provider: "click", invoice: "INV-2026-005", created_at: "2026-05-20T12:45:00" },
    { id: "2", description: "Free Starter - Monthly", sub_description: "Subscription payment", plan: "Free Starter", plan_variant: "Monthly", amount: 0, currency: "UZS", status: "pending", provider: "payme", invoice: "INV-2026-004", created_at: "2026-04-20T12:45:00" },
    { id: "3", description: "Premium Mastery - Monthly", sub_description: "Subscription payment", plan: "Premium Mastery", plan_variant: "Monthly", amount: 99990, currency: "UZS", status: "completed", provider: "click", invoice: "INV-2026-003", created_at: "2026-03-20T12:45:00" },
    { id: "4", description: "Pro Practice - Monthly", sub_description: "Payment failed", plan: "Pro Practice", plan_variant: "Monthly", amount: 59950, currency: "UZS", status: "failed", provider: "payme", invoice: null, created_at: "2026-02-18T09:20:00" },
    { id: "5", description: "Premium Mastery - Monthly", sub_description: "Refund processed", plan: "Premium Mastery", plan_variant: "Monthly", amount: 99990, currency: "UZS", status: "refunded", provider: "click", invoice: "INV-2026-002", created_at: "2026-02-10T16:10:00" },
    { id: "6", description: "Pro Practice - Monthly", sub_description: "Subscription payment", plan: "Pro Practice", plan_variant: "Monthly", amount: 59950, currency: "UZS", status: "completed", provider: "click", invoice: "INV-2026-001", created_at: "2026-01-10T11:30:00" },
]

type StatusFilter = "All" | "completed" | "pending" | "failed" | "refunded"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
const fmtTime = (d: string) => new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
const fmtNum = (n: number) => new Intl.NumberFormat("en-US").format(n)

// ─── CSV download ─────────────────────────────────────────────────────────────

function downloadCSV(payments: PaymentItem[]) {
    const headers = ["Date", "Time", "Description", "Plan", "Variant", "Amount", "Currency", "Status", "Invoice"]
    const rows = payments.map(p => [
        fmt(p.created_at),
        fmtTime(p.created_at),
        `"${p.description ?? ""}"`,
        `"${(p as PaymentItem).plan ?? ""}"`,
        (p as PaymentItem).plan_variant ?? "",
        p.amount,
        p.currency,
        p.status,
        (p as PaymentItem).invoice ?? "",
    ])
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = "payment-history.csv"; a.click()
    URL.revokeObjectURL(url)
}

// ─── Stat Panel ───────────────────────────────────────────────────────────────

function StatPanel({ payments, visible }: { payments: PaymentItem[]; visible: boolean }) {
    const completed = payments.filter(p => p.status === "completed")
    const now = new Date()
    const thisMonth = completed.filter(p => { const d = new Date(p.created_at); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() }).reduce((s, p) => s + p.amount, 0)
    const thisYear = completed.filter(p => new Date(p.created_at).getFullYear() === now.getFullYear()).reduce((s, p) => s + p.amount, 0)
    const totalSpent = completed.reduce((s, p) => s + p.amount, 0)

    return (
        <div
            className="rounded-2xl bg-white p-6 flex flex-col gap-5"
            style={{
                border: "1px solid #eef1f7",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(14px)",
                transition: "opacity 0.45s ease 0.12s, transform 0.45s ease 0.12s",
            }}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[12px] text-gray-400 font-medium mb-1.5">Total spent</p>
                    <p className="text-[30px] font-black text-gray-900 leading-none tracking-tight">
                        {fmtNum(totalSpent)}
                        <span className="text-[15px] font-semibold text-gray-400 ml-1.5">UZS</span>
                    </p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#eef0fd" }}>
                    <CreditCard size={18} color={C2} />
                </div>
            </div>

            <div className="h-px" style={{ background: "#f0f2f7" }} />

            <div className="flex flex-col gap-3.5">
                {[
                    { label: "This month", value: thisMonth, suffix: "UZS" },
                    { label: "This year", value: thisYear, suffix: "UZS" },
                    { label: "Total transactions", value: payments.length, suffix: "" },
                ].map(({ label, value, suffix }) => (
                    <div key={label} className="flex items-center justify-between">
                        <span className="text-[12px] text-gray-400">{label}</span>
                        <span className="text-[13px] font-semibold text-gray-700">
                            {typeof value === "number" && suffix ? <>{fmtNum(value)} <span className="text-[10px] font-normal text-gray-400">{suffix}</span></> : value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroBanner({ visible }: { visible: boolean }) {
    return (
        <div
            className="relative rounded-2xl overflow-hidden"
            style={{
                background: "linear-gradient(135deg, #3730a3 0%, #4f46e5 55%, #818cf8 100%)",
                minHeight: 200,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(18px)",
                transition: "opacity 0.5s ease 0.05s, transform 0.5s ease 0.05s",
            }}
        >
            {/* decorative circles */}
            <div className="absolute -top-10 right-24 w-52 h-52 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.07)" }} />
            <div className="absolute -bottom-12 right-8  w-40 h-40 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.05)" }} />

            {/* receipt icon — replace src with your PNG path */}
            <div className="absolute right-10 bottom-0 top-0 hidden md:flex items-center justify-center pointer-events-none select-none">
                <img
                    src="/icons/receipt.png"
                    alt=""
                    className="w-36 h-36 object-contain"
                    style={{ opacity: 0.9 }}
                />
            </div>

            <div className="relative z-10 px-8 py-8 flex flex-col gap-3.5 max-w-sm">
                <Link
                    href="/billing"
                    className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
                    style={{ background: "rgba(255,255,255,0.15)", color: "#e0e7ff", border: "1px solid rgba(255,255,255,0.22)" }}
                >
                    <ArrowLeft size={11} /> Billing &amp; Plans
                </Link>
                <h1 className="text-[28px] sm:text-[32px] font-black text-white leading-tight tracking-tight">
                    Payment History
                </h1>
                <p className="text-[13px] leading-relaxed" style={{ color: "rgba(199,210,254,0.85)" }}>
                    View all your past payments, invoices, and transaction details in one place.
                </p>
            </div>
        </div>
    )
}

// ─── Status circle ────────────────────────────────────────────────────────────

function StatusCircle({ status }: { status: string }) {
    const cfg = statusConfig[status] ?? statusConfig.pending
    const Icon = cfg.icon
    return (
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}` }}>
            <Icon size={14} color={cfg.color} />
        </div>
    )
}

// ─── Plan badge ───────────────────────────────────────────────────────────────

function PlanBadge({ plan, variant }: { plan: string; variant?: string }) {
    const c = planColors[plan] ?? { bg: "#f3f4f6", color: "#4b5563", border: "#e5e7eb" }
    return (
        <div className="flex flex-col gap-0.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold self-start"
                style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
                {plan}
            </span>
            {variant && <span className="text-[10px] text-gray-400 pl-0.5">{variant}</span>}
        </div>
    )
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

function FilterTabs({ active, onChange }: { active: StatusFilter; onChange: (f: StatusFilter) => void }) {
    const tabs: { key: StatusFilter; label: string }[] = [
        { key: "All", label: "All" },
        { key: "completed", label: "Completed" },
        { key: "pending", label: "Pending" },
        { key: "failed", label: "Failed" },
        { key: "refunded", label: "Refunded" },
    ]
    return (
        <div className="flex items-center gap-1.5">
            {tabs.map(({ key, label }) => (
                <button key={key} onClick={() => onChange(key)}
                    className="px-4 h-9 rounded-xl text-[12px] font-semibold transition-all"
                    style={active === key
                        ? { background: C2, color: "#fff", border: `1.5px solid ${C2}` }
                        : { background: "#fff", color: "#6b7280", border: "1.5px solid #eef1f7" }}>
                    {label}
                </button>
            ))}
        </div>
    )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRows() {
    return (
        <div className="animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4"
                    style={{ borderBottom: "1px solid #f5f6fa" }}>
                    <div className="w-8 h-8 rounded-full bg-gray-100 shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3.5 w-44 rounded bg-gray-100" />
                        <div className="h-2.5 w-28 rounded bg-gray-100" />
                    </div>
                    <div className="h-6 w-24 rounded-lg bg-gray-100" />
                    <div className="h-3.5 w-20 rounded   bg-gray-100" />
                    <div className="h-6 w-20 rounded-lg bg-gray-100" />
                    <div className="h-3.5 w-24 rounded   bg-gray-100" />
                    <div className="w-7  h-7  rounded-md bg-gray-100" />
                </div>
            ))}
        </div>
    )
}

// ─── Empty ────────────────────────────────────────────────────────────────────

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1"
                style={{ background: "#eef0fd" }}>
                <CreditCard size={20} color={C1} />
            </div>
            <p className="text-[13px] font-semibold text-gray-700">No payments found</p>
            <p className="text-[12px] text-gray-400">Try adjusting your filters</p>
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PaymentHistoryPage() {
    const [allPayments, setAllPayments] = useState<PaymentItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("All")
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 40)
        return () => clearTimeout(t)
    }, [])

    const fetchPayments = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await billingApi.getPayments({ page: 1, size: 100 })
            setAllPayments(data.items ?? [])
        } catch {
            setError('Failed to load payment history. Please try again.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchPayments() }, [fetchPayments])

    const handleFilter = (f: StatusFilter) => { setStatusFilter(f); setPage(1) }

    const filtered = statusFilter === "All" ? allPayments : allPayments.filter(p => p.status === statusFilter)
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    // Pagination window (max 5 buttons)
    const pageStart = Math.max(1, Math.min(totalPages - 4, page - 2))
    const pageNums = Array.from({ length: Math.min(5, totalPages) }, (_, i) => pageStart + i)

    return (
        <div className="w-full min-h-full bg-[#f4f5f9] px-5 md:px-8 py-6 flex flex-col gap-6">

            {/* ── Top: Hero + Stat panel ── */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_296px] gap-5 items-stretch">
                <HeroBanner visible={visible} />
                <StatPanel payments={allPayments} visible={visible} />
            </div>

            {/* ── Error banner ── */}
            {error && (
                <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-[12px]"
                    style={{ background: "#fffbeb", border: "1.5px solid #fde68a", color: "#92400e" }}>
                    <span>{error}</span>
                    <button onClick={fetchPayments} className="flex items-center gap-1 font-semibold">
                        <RefreshCw size={12} /> Retry
                    </button>
                </div>
            )}

            {/* ── Main table card ── */}
            <div
                className="rounded-2xl bg-white overflow-hidden"
                style={{
                    border: "1px solid #eef1f7",
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(14px)",
                    transition: "opacity 0.45s ease 0.22s, transform 0.45s ease 0.22s",
                }}
            >

                {/* ── Toolbar ── */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                    style={{ borderBottom: "1px solid #f0f2f7" }}>
                    <FilterTabs active={statusFilter} onChange={handleFilter} />

                    <div className="flex items-center gap-2">
                        {/* Date range */}
                        <div className="flex items-center gap-2 px-3 h-9 rounded-xl text-[12px] font-medium text-gray-500 cursor-pointer select-none"
                            style={{ border: "1.5px solid #eef1f7", background: "#fff" }}>
                            <Calendar size={13} color="#9ca3af" />
                            <span>01 Jan 2025</span>
                            <span style={{ color: "#d1d5db" }}>—</span>
                            <span>20 May 2026</span>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M3 4.5L6 7.5L9 4.5" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                        {/* Download CSV button */}
                        <button
                            onClick={() => downloadCSV(filtered)}
                            className="flex items-center gap-2 px-4 h-9 rounded-xl text-[12px] font-semibold transition-all hover:bg-gray-50"
                            style={{ background: "#fff", color: "#374151", border: "1.5px solid #eef1f7" }}
                        >
                            <Download size={13} /> Download
                        </button>
                    </div>
                </div>

                {/* ── Column headers ── */}
                <div className="hidden md:grid px-5 py-3"
                    style={{
                        gridTemplateColumns: "40px 150px 1fr 160px 130px 140px 110px",
                        borderBottom: "1px solid #f0f2f7",
                        background: "#fafbfc",
                    }}>
                    {[
                        { label: "", align: "left" },
                        { label: "DATE", align: "left", sort: true },
                        { label: "DESCRIPTION", align: "left" },
                        { label: "PLAN", align: "left" },
                        { label: "AMOUNT", align: "right", sort: true },
                        { label: "STATUS", align: "center" },
                        { label: "INVOICE", align: "left" },
                    ].map(({ label, align, sort }, i) => (
                        <span key={i}
                            className="text-[10px] font-bold text-gray-400 tracking-wider px-2 flex items-center gap-1"
                            style={{ justifyContent: align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start" }}>
                            {label}
                            {sort && (
                                <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                                    <path d="M4.5 1.5v6M4.5 7.5L2.5 5.5M4.5 7.5L6.5 5.5" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </span>
                    ))}
                </div>

                {/* ── Rows ── */}
                {loading ? <SkeletonRows /> : paginated.length === 0 ? <EmptyState /> : (
                    <>
                        {paginated.map((payment, i) => {
                            const cfg = statusConfig[payment.status] ?? statusConfig.pending
                            const isLast = i === paginated.length - 1
                            return (
                                <div key={payment.id}
                                    className="hidden md:grid items-center px-5 py-3.5 transition-colors hover:bg-[#f8f9fd]"
                                    style={{
                                        gridTemplateColumns: "40px 150px 1fr 160px 130px 140px 110px",
                                        borderBottom: isLast ? "none" : "1px solid #f5f6fa",
                                    }}>

                                    {/* status circle */}
                                    <div className="flex items-center">
                                        <StatusCircle status={payment.status} />
                                    </div>

                                    {/* date */}
                                    <div className="px-2">
                                        <p className="text-[13px] font-semibold text-gray-800">{fmt(payment.created_at)}</p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">{fmtTime(payment.created_at)}</p>
                                    </div>

                                    {/* description */}
                                    <div className="px-2">
                                        <p className="text-[13px] font-semibold text-gray-800 truncate">{payment.description ?? "Payment"}</p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">{(payment as PaymentItem).sub_description ?? "Subscription payment"}</p>
                                    </div>

                                    {/* plan */}
                                    <div className="px-2">
                                        <PlanBadge plan={(payment as PaymentItem).plan ?? "—"} variant={(payment as PaymentItem).plan_variant} />
                                    </div>

                                    {/* amount */}
                                    <div className="px-2 text-right">
                                        <span className="text-[14px] font-bold text-gray-900">{fmtNum(payment.amount)}</span>
                                        <span className="text-[11px] text-gray-400 ml-1">{payment.currency}</span>
                                    </div>

                                    {/* status badge */}
                                    <div className="px-2 flex justify-center">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
                                            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                                            {cfg.label}
                                        </span>
                                    </div>

                                    {/* invoice */}
                                    <div className="px-2 flex items-center gap-2">
                                        {(payment as PaymentItem).invoice ? (
                                            <>
                                                <span className="text-[11px] font-medium" style={{ color: C1 }}>
                                                    {(payment as PaymentItem).invoice}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        // Single invoice CSV download
                                                        downloadCSV([payment])
                                                    }}
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100 shrink-0"
                                                    style={{ border: "1px solid #eef1f7" }}
                                                    title="Download invoice"
                                                >
                                                    <Download size={12} color="#9ca3af" />
                                                </button>
                                            </>
                                        ) : (
                                            <span className="text-[13px] text-gray-300 pl-1">—</span>
                                        )}
                                    </div>
                                </div>
                            )
                        })}

                        {/* ── Mobile cards ── */}
                        <div className="flex flex-col gap-3 p-4 md:hidden">
                            {paginated.map((payment) => {
                                const cfg = statusConfig[payment.status] ?? statusConfig.pending
                                return (
                                    <div key={payment.id} className="rounded-xl bg-white p-4 flex flex-col gap-3"
                                        style={{ border: "1.5px solid #eef1f7" }}>
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <StatusCircle status={payment.status} />
                                                <div className="min-w-0">
                                                    <p className="text-[13px] font-semibold text-gray-800 truncate">{payment.description}</p>
                                                    <p className="text-[11px] text-gray-400 mt-0.5">{fmt(payment.created_at)}</p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-[14px] font-black" style={{ color: C2 }}>{fmtNum(payment.amount)}</p>
                                                <p className="text-[10px] text-gray-400">{payment.currency}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <PlanBadge plan={(payment as PaymentItem).plan ?? "—"} variant={(payment as PaymentItem).plan_variant} />
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
                                                style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                                                {cfg.label}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}

                {/* ── Pagination ── */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-4"
                        style={{ borderTop: "1px solid #f0f2f7" }}>
                        <p className="text-[12px] text-gray-400">
                            Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} results
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                                style={{ border: "1.5px solid #eef1f7", background: "#fff" }}>
                                <ChevronLeft size={14} color="#6b7280" />
                            </button>
                            {pageNums.map(p => (
                                <button key={p} onClick={() => setPage(p)}
                                    className="w-9 h-9 rounded-xl text-[12px] font-semibold transition-all"
                                    style={p === page
                                        ? { background: C2, color: "#fff", border: `1.5px solid ${C2}` }
                                        : { background: "#fff", color: "#6b7280", border: "1.5px solid #eef1f7" }}>
                                    {p}
                                </button>
                            ))}
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                                style={{ border: "1.5px solid #eef1f7", background: "#fff" }}>
                                <ChevronRight size={14} color="#6b7280" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <p className="text-center text-[11px] text-gray-400 pb-2"
                style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s ease 0.6s" }}>
                All transactions are recorded securely &nbsp;•&nbsp; Contact support for disputes
            </p>
        </div>
    )
}