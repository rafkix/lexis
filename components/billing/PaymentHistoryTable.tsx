"use client"

import { CheckCircle, Clock, XCircle, RefreshCw, CreditCard } from "lucide-react"
import type { Payment } from "@/lib/types/billing"

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
    completed: { icon: CheckCircle, color: "text-emerald-700", bg: "bg-emerald-100", label: "Completed" },
    pending: { icon: Clock, color: "text-amber-700", bg: "bg-amber-100", label: "Pending" },
    failed: { icon: XCircle, color: "text-indigo-600", bg: "bg-indigo-100", label: "Failed" },
    refunded: { icon: RefreshCw, color: "text-blue-700", bg: "bg-blue-100", label: "Refunded" },
    cancelled: { icon: XCircle, color: "text-gray-500", bg: "bg-gray-100", label: "Cancelled" },
}

const providerLabels: Record<string, string> = {
    click: "Click", payme: "Payme", uzum: "Uzum", stripe: "Stripe", manual: "Manual",
}

interface Props { payments: Payment[] }

export default function PaymentHistoryTable({ payments }: Props) {
    if (!payments.length) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-gray-300" />
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
                    <tr className="border-b border-gray-100">
                        {["Date", "Description", "Provider", "Amount", "Status"].map((h, i) => (
                            <th key={h} className={`py-3 px-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider
                                ${i === 3 ? "text-right" : i === 4 ? "text-center" : "text-left"}`}>
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {payments.map((payment) => {
                        const cfg = statusConfig[payment.status] ?? statusConfig.pending
                        const Icon = cfg.icon
                        return (
                            <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
                                    {new Date(payment.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                                </td>
                                <td className="py-3 px-4 text-xs text-gray-700 max-w-[160px] truncate">
                                    {payment.description ?? "Payment"}
                                </td>
                                <td className="py-3 px-4">
                                    <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                        {providerLabels[payment.provider] ?? payment.provider}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-right text-xs font-semibold text-gray-800 whitespace-nowrap">
                                    {new Intl.NumberFormat("en-US").format(payment.amount)}{" "}
                                    <span className="text-[11px] font-normal text-gray-400">{payment.currency}</span>
                                </td>
                                <td className="py-3 px-4 text-center">
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