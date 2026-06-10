"use client"

import { CheckCircle, Clock, XCircle, RefreshCw, CreditCard } from "lucide-react"
import type { Payment } from "@/lib/types/billing"

// ─── Constants ────────────────────────────────────────────────────────────────
const IND5 = "#6366f1"

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
    completed: { icon: CheckCircle, color: "text-emerald-700", bg: "bg-emerald-50 border border-emerald-100", label: "Completed" },
    pending: { icon: Clock, color: "text-amber-700", bg: "bg-amber-50 border border-amber-100", label: "Pending" },
    failed: { icon: XCircle, color: "text-rose-600", bg: "bg-rose-50 border border-rose-100", label: "Failed" },
    refunded: { icon: RefreshCw, color: "text-indigo-600", bg: "bg-indigo-50 border border-indigo-100", label: "Refunded" },
    cancelled: { icon: XCircle, color: "text-gray-500", bg: "bg-gray-50 border border-gray-100", label: "Cancelled" },
}

const providerLabels: Record<string, string> = {
    click: "Click", payme: "Payme", uzum: "Uzum", stripe: "Stripe", manual: "Manual",
}

interface Props { payments: Payment[] }

export default function PaymentHistoryTable({ payments }: Props) {
    if (!payments.length) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{
                        background: `${IND5}12`,
                        border: `1px solid ${IND5}1f`,
                    }}
                >
                    <CreditCard className="w-5 h-5" style={{ color: "#a5b4fc" }} />
                </div>
                <p className="text-sm font-medium text-gray-500">No payment history</p>
                <p className="text-xs text-gray-400">You haven't made any payments yet</p>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr style={{ borderBottom: "1px solid #eef1f7" }}>
                        {["Date", "Description", "Provider", "Amount", "Status"].map((h, i) => (
                            <th
                                key={h}
                                className={`py-3 px-4 text-[11px] font-semibold uppercase tracking-wider
                                    ${i === 3 ? "text-right" : i === 4 ? "text-center" : "text-left"}`}
                                style={{ color: "#a0aec0" }}
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {payments.map((payment) => {
                        const cfg = statusConfig[payment.status] ?? statusConfig.pending
                        const Icon = cfg.icon
                        return (
                            <tr
                                key={payment.id}
                                className="transition-colors"
                                style={{ borderBottom: "1px solid #f5f6fa" }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f9ff")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                                <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                                    {new Date(payment.created_at).toLocaleDateString("en-GB", {
                                        day: "2-digit", month: "short", year: "numeric",
                                    })}
                                </td>
                                <td className="py-3.5 px-4 text-xs text-gray-700 max-w-[160px] truncate">
                                    {payment.description ?? "Payment"}
                                </td>
                                <td className="py-3.5 px-4">
                                    <span
                                        className="text-[11px] font-medium px-2 py-0.5 rounded-md"
                                        style={{
                                            background: `${IND5}12`,
                                            color: IND5,
                                            border: `1px solid ${IND5}1f`,
                                        }}
                                    >
                                        {providerLabels[payment.provider] ?? payment.provider}
                                    </span>
                                </td>
                                <td className="py-3.5 px-4 text-right text-xs font-semibold text-gray-800 whitespace-nowrap">
                                    {new Intl.NumberFormat("en-US").format(payment.amount)}{" "}
                                    <span className="text-[11px] font-normal text-gray-400">{payment.currency}</span>
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium ${cfg.bg} ${cfg.color}`}>
                                        <Icon className="w-3 h-3" />
                                        {cfg.label}
                                    </span>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
