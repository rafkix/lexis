"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Receipt } from "lucide-react"
import { billingApi } from "@/lib/api/billing"
import PaymentHistoryTable from "@/components/billing/PaymentHistoryTable"
import type { PaginatedPayments } from "@/lib/types/billing"

export default function PaymentHistoryPage() {
    const [data, setData] = useState<PaginatedPayments | null>(null)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        billingApi
            .getPayments({ page, size: 20 })
            .then(setData)
            .finally(() => setLoading(false))
    }, [page])

    return (
        <div className="max-w-4xl mx-auto">

            {/* Back link */}
            <Link
                href="/dashboard/billing"
                className="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to billing
            </Link>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
                    <Receipt className="w-4.5 h-4.5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Payment history</h1>
                    {data && (
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                            {data.total} transaction{data.total !== 1 ? "s" : ""} total
                        </p>
                    )}
                </div>
            </div>

            {/* Table card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="w-7 h-7 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-gray-400 dark:text-gray-500">Loading payments…</p>
                    </div>
                ) : (
                    <PaymentHistoryTable payments={data?.items ?? []} />
                )}

                {/* Pagination */}
                {data && data.pages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-white/10">
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            Page {page} of {data.pages}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="
                                    px-3.5 py-1.5 rounded-lg text-sm font-medium
                                    border border-gray-200 dark:border-white/10
                                    text-gray-600 dark:text-gray-400
                                    hover:bg-gray-50 dark:hover:bg-white/5
                                    disabled:opacity-40 disabled:cursor-not-allowed
                                    transition-colors
                                "
                            >
                                ← Previous
                            </button>
                            <button
                                onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                                disabled={page === data.pages}
                                className="
                                    px-3.5 py-1.5 rounded-lg text-sm font-medium
                                    border border-gray-200 dark:border-white/10
                                    text-gray-600 dark:text-gray-400
                                    hover:bg-gray-50 dark:hover:bg-white/5
                                    disabled:opacity-40 disabled:cursor-not-allowed
                                    transition-colors
                                "
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}