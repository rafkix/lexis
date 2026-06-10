"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    Receipt,
    Wallet,
    CheckCircle,
    ArrowRight,
    Sparkles,
    Shield,
} from "lucide-react"
import Link from "next/link"
import PlanCard from "@/components/billing/PlanCard"
import CurrentSubscription from "@/components/billing/CurrentSubscription"
import { billingApi } from "@/lib/api/billing"
import { quotaApi } from "@/lib/api/quota"
import type { Plan, Subscription, CancelRequest } from "@/lib/types/billing"
import type { QuotaOut } from "@/lib/api/quota"

// ─── Constants ────────────────────────────────────────────────────────────────
const IND5 = "#6366f1"
const IND6 = "#4f46e5"

// ─── Hero Banner ──────────────────────────────────────────────────────────────
function HeroBanner({ visible, sub }: { visible: boolean; sub: Subscription | null }) {
    const isActive = sub && ["active", "trial"].includes(sub.status)

    return (
        <div
            className="relative w-full rounded-2xl overflow-hidden"
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(18px)",
                transition: "opacity 0.5s ease 0.05s, transform 0.5s ease 0.05s",
                background: "linear-gradient(135deg, #3730a3 0%, #4f46e5 55%, #818cf8 100%)",
            }}
        >
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 px-8 py-8">
                <div className="flex flex-col gap-3 max-w-md">
                    <div
                        className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full text-[11px] font-semibold"
                        style={{
                            background: 'rgba(255,255,255,0.15)',
                            color: '#e0e7ff',
                            border: '1px solid rgba(255,255,255,0.22)',
                        }}
                    >
                        <Sparkles size={10} />
                        Smart billing & subscription management
                    </div>
                    <h1 className="text-[22px] sm:text-[26px] font-bold text-white leading-tight tracking-tight">
                        Billing made simple.{' '}
                        <span style={{ color: '#c7d2fe' }}>Everything in one place.</span>
                    </h1>
                    <p
                        className="text-[13px] leading-relaxed max-w-xs"
                        style={{ color: "rgba(199,210,254,0.9)" }}
                    >
                        {isActive
                            ? "Your subscription is active. Upgrade, manage, or cancel anytime."
                            : "Choose a flexible plan that fits your business needs."}
                    </p>

                    <div className="flex items-center gap-3 mt-1">
                        <button
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold transition-all"
                            style={{
                                background: "#fff",
                                color: IND6,
                            }}
                        >
                            Choose a plan
                        </button>

                        <Link
                            href="/billing/history"
                            className="self-start mt-0.5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold"
                            style={{
                                background: 'rgba(255,255,255,0.15)',
                                color: '#fff',
                                border: '1.5px solid rgba(255,255,255,0.28)',
                                backdropFilter: 'blur(6px)',
                                transition: 'background 0.2s ease',
                            }}
                        >
                            <Receipt size={13} /> View payment history <ArrowRight size={13} />
                        </Link>
                    </div>
                </div>

                <div className="flex sm:flex-col gap-4 shrink-0">
                    {["30-day money-back guarantee", "No hidden fees", "Cancel anytime"].map(
                        (label) => (
                            <div key={label} className="flex items-center gap-2.5">
                                <div
                                    className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                                    style={{ background: "rgba(255,255,255,0.2)" }}
                                >
                                    <CheckCircle size={13} className="text-white" />
                                </div>
                                <p className="text-white text-[12px] font-medium hidden sm:block">
                                    {label}
                                </p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Loading ──────────────────────────────────────────────────────────────────
function LoadingState() {
    return (
        <div className="flex flex-col items-center justify-center min-h-96 gap-3">
            <div
                className="w-7 h-7 border-[2.5px] border-t-transparent rounded-full animate-spin"
                style={{ borderColor: `${IND5} transparent transparent transparent` }}
            />
            <p className="text-sm text-gray-400">Loading…</p>
        </div>
    )
}

// ─── Section Divider ──────────────────────────────────────────────────────────
function SectionDivider({
    icon: Icon,
    label,
    right,
}: {
    icon: React.ElementType
    label: string
    right?: React.ReactNode
}) {
    return (
        <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3 flex-1">
                <div
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full shrink-0"
                    style={{
                        background: `${IND5}14`,
                        border: `1px solid ${IND5}2e`,
                    }}
                >
                    <Icon size={12} style={{ color: IND5 }} />
                    <span className="text-[11px] font-semibold" style={{ color: IND6 }}>
                        {label}
                    </span>
                </div>
                <div className="flex-1 h-px" style={{ background: "#eef1f7" }} />
            </div>
            {right && <div className="shrink-0">{right}</div>}
        </div>
    )
}

// ─── Billing Toggle ───────────────────────────────────────────────────────────
function BillingToggle({
    cycle,
    onChange,
}: {
    cycle: "monthly" | "yearly"
    onChange: (v: "monthly" | "yearly") => void
}) {
    return (
        <div className="flex items-center justify-center mb-6">
            <div
                className="inline-flex items-center rounded-xl overflow-hidden"
                style={{ border: "1px solid #e5e7eb" }}
            >
                {(["monthly", "yearly"] as const).map((val) => (
                    <button
                        key={val}
                        onClick={() => onChange(val)}
                        className="px-6 py-2 text-[13px] font-medium transition-all capitalize"
                        style={{
                            background: cycle === val ? IND6 : "#fff",
                            color: cycle === val ? "#fff" : "#6b7280",
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        {val === "monthly" ? "Monthly" : "Yearly"}
                    </button>
                ))}
                <div
                    className="px-3 py-1 text-[11px] font-semibold"
                    style={{
                        background: "#d1fae5",
                        color: "#065f46",
                        borderLeft: "1px solid #e5e7eb",
                    }}
                >
                    Save 30%
                </div>
            </div>
        </div>
    )
}

// ─── Guarantee Bar ────────────────────────────────────────────────────────────
function GuaranteeBar({ visible }: { visible: boolean }) {
    return (
        <div
            className="flex items-center justify-between rounded-2xl px-6 py-4"
            style={{
                background: "#fff",
                border: "1px solid #eef1f7",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(12px)",
                transition: "opacity 0.45s ease 0.38s, transform 0.45s ease 0.38s",
            }}
        >
            <div className="flex items-center gap-4">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "#eef0fd" }}
                >
                    <Shield size={20} color={IND5} />
                </div>
                <div>
                    <p className="text-[14px] font-semibold text-gray-800">
                        30-day money-back guarantee
                    </p>
                    <p className="text-[12px] text-gray-400 mt-0.5">
                        Not satisfied? Get a full refund within 30 days. No questions asked.
                    </p>
                </div>
            </div>
            <Shield size={28} color="#c7d2fe" />
        </div>
    )
}

// ─── Recent Payment History (real API) ───────────────────────────────────────

type PaymentRow = {
    id: string
    created_at: string
    description?: string
    plan?: string
    amount: number
    currency: string
    status: string
    invoice?: string | null
}

function fmtDate(d: string) {
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}
function fmtAmount(n: number, currency: string) {
    return new Intl.NumberFormat("en-US").format(n) + " " + currency
}

function PaymentHistory({ visible }: { visible: boolean }) {
    const [rows, setRows] = useState<PaymentRow[]>([])
    const [loadingRows, setLoadingRows] = useState(true)

    useEffect(() => {
        billingApi.getPayments({ page: 1, size: 3 })
            .then((data) => setRows((data.items ?? []) as PaymentRow[]))
            .catch(() => { /* silently — table stays empty */ })
            .finally(() => setLoadingRows(false))
    }, [])

    return (
        <div
            className="rounded-2xl overflow-hidden"
            style={{
                background: "#fff",
                border: "1px solid #eef1f7",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(12px)",
                transition: "opacity 0.45s ease 0.48s, transform 0.45s ease 0.48s",
            }}
        >
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#f0f2f7]">
                <h2 className="text-[15px] font-semibold text-gray-800">Recent Payments</h2>
                <Link
                    href="/billing/history"
                    className="text-[12px] font-medium flex items-center gap-1"
                    style={{ color: IND5 }}
                >
                    View all <ArrowRight size={12} />
                </Link>
            </div>

            {loadingRows ? (
                <div className="flex items-center justify-center py-8 gap-2 text-[13px] text-gray-400">
                    <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${IND5} transparent transparent transparent` }} />
                    Loading…
                </div>
            ) : rows.length === 0 ? (
                <div className="py-10 text-center text-[13px] text-gray-400">
                    No payments yet
                </div>
            ) : (
                <table className="w-full">
                    <thead>
                        <tr style={{ borderBottom: "1px solid #f0f2f7" }}>
                            {["Date", "Description", "Amount", "Status"].map((h) => (
                                <th key={h} className="px-6 py-3 text-left text-[11px] font-medium text-gray-400">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={row.id} style={{ borderBottom: i < rows.length - 1 ? "1px solid #f0f2f7" : "none" }}>
                                <td className="px-6 py-4 text-[13px] text-gray-500">{fmtDate(row.created_at)}</td>
                                <td className="px-6 py-4 text-[13px] text-gray-600">{row.description ?? "—"}</td>
                                <td className="px-6 py-4 text-[13px] font-medium text-gray-800">{fmtAmount(row.amount, row.currency)}</td>
                                <td className="px-6 py-4">
                                    <span
                                        className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold"
                                        style={row.status === "completed"
                                            ? { background: "#d1fae5", color: "#065f46" }
                                            : row.status === "failed"
                                                ? { background: "#fee2e2", color: "#991b1b" }
                                                : { background: "#fef9c3", color: "#713f12" }
                                        }
                                    >
                                        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BillingPage() {
    const router = useRouter()
    const [plans, setPlans] = useState<Plan[]>([])
    const [sub, setSub] = useState<Subscription | null>(null)
    const [quota, setQuota] = useState<QuotaOut | null>(null)
    const [loading, setLoading] = useState(true)
    const [visible, setVisible] = useState(false)
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 40)
        return () => clearTimeout(t)
    }, [])

    useEffect(() => {
        const load = async () => {
            try {
                const [plansData, subData, quotaData] = await Promise.all([
                    billingApi.getPlans(),
                    billingApi.getMySubscription(),
                    quotaApi.getMyQuota().catch(() => null),
                ])
                setPlans(plansData)
                setSub(subData)
                setQuota(quotaData)
            } catch {
                toast.error("Failed to load billing data")
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const handleSubscribe = (
        slug: string,
        promoCode?: string
    ) => {
        const qs = promoCode
            ? `?promo=${encodeURIComponent(promoCode)}`
            : ""

        router.push(`/billing/checkout/${slug}${qs}`)
    }

    const handleCancel = async (reason: string) => {
        try {
            const cancelled = await billingApi.cancelSubscription({ reason } as CancelRequest)
            setSub(cancelled)
            const newQuota = await quotaApi.getMyQuota().catch(() => null)
            setQuota(newQuota)
            toast.success("Subscription cancelled")
        } catch (e: unknown) {
            const err = e as { response?: { data?: { detail?: string } } }
            toast.error(err?.response?.data?.detail ?? "Failed to cancel subscription")
        }
    }

    if (loading) return <LoadingState />

    const hasActiveSub = sub && ["active", "trial"].includes(sub.status)

    return (
        <div className="w-full min-h-full bg-[#f4f5f9] px-5 md:px-8 py-6 flex flex-col gap-6">
            {/* Hero */}
            <HeroBanner visible={visible} sub={sub} />

            {/* Current Subscription (only if active) */}
            {hasActiveSub && (
                <div
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? "translateY(0)" : "translateY(16px)",
                        transition: "opacity 0.45s ease 0.18s, transform 0.45s ease 0.18s",
                    }}
                >
                    <SectionDivider icon={CheckCircle} label="Current subscription" />
                    <CurrentSubscription
                        subscription={sub}
                        quota={quota}
                        onCancel={handleCancel}
                    />
                </div>
            )}

            {/* Plans */}
            <div
                style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(16px)",
                    transition: "opacity 0.45s ease 0.28s, transform 0.45s ease 0.28s",
                }}
            >
                <BillingToggle cycle={billingCycle} onChange={setBillingCycle} />

                <SectionDivider
                    icon={Wallet}
                    label="Available plans"
                    right={
                        <span className="text-[11px] text-gray-400">
                            {plans.length} plan{plans.length !== 1 ? "s" : ""}
                        </span>
                    }
                />

                {plans.length === 0 ? (
                    <div
                        className="text-center py-12 text-sm text-gray-400 rounded-2xl"
                        style={{ border: "1.5px dashed #eef1f7" }}
                    >
                        No plans available at the moment.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
                        {plans.map((plan, i) => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                index={i}
                                isCurrentPlan={
                                    sub?.plan_id === plan.id &&
                                    ["active", "trial"].includes(sub?.status ?? "")
                                }
                                onSubscribe={handleSubscribe}
                                loading={false}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Guarantee bar */}
            <GuaranteeBar visible={visible} />

            {/* Payment History */}
            <PaymentHistory visible={visible} />

            {/* Footer note */}
            <p
                className="text-center text-[11px] text-gray-400 pb-2"
                style={{
                    opacity: visible ? 1 : 0,
                    transition: "opacity 0.5s ease 0.6s",
                }}
            >
                30-day money-back guarantee &nbsp;•&nbsp; No hidden fees &nbsp;•&nbsp; Cancel
                anytime
            </p>
        </div>
    )
}