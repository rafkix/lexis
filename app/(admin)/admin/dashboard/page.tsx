"use client"

import { useEffect, useState } from "react"
import { adminDashboardApi, adminSubscriptionRequestsApi } from "@/lib/api/admin"
import type { DashboardStats } from "@/lib/types/admin"
import {
    TrendingUp, Users, CreditCard, Clock,
    DollarSign, CheckCircle2, XCircle, Loader2,
    ArrowUpRight, Activity,
} from "lucide-react"

function StatCard({
    label, value, icon: Icon, sub, color = "red",
}: {
    label: string
    value: string | number
    icon: React.ElementType
    sub?: string
    color?: "red" | "blue" | "green" | "yellow"
}) {
    const colors = {
        red: "bg-red-500/10 border-red-500/20 text-red-400",
        blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
        green: "bg-green-500/10 border-green-500/20 text-green-400",
        yellow: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
    }
    return (
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-5 flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${colors[color]}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-xs text-gray-600 mb-1">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
                {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
            </div>
        </div>
    )
}

const STATUS_BADGE: Record<string, string> = {
    completed: "bg-green-500/10 text-green-400 border-green-500/20",
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
    approved: "bg-green-500/10 text-green-400 border-green-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        adminDashboardApi.getStats()
            .then(setStats)
            .catch(() => setError("Failed to load dashboard stats"))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return (
        <div className="flex items-center justify-center h-60">
            <Loader2 className="w-6 h-6 text-red-400 animate-spin" />
        </div>
    )

    if (error) return (
        <div className="rounded-2xl bg-red-500/5 border border-red-500/20 p-6 text-red-400 text-sm">
            {error}
        </div>
    )

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-xl font-bold text-white">Dashboard</h1>
                <p className="text-xs text-gray-600 mt-1">Overview of your admin panel</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Users" value={stats?.totalUsers ?? 0} icon={Users} color="blue" />
                <StatCard label="Active Subscriptions" value={stats?.activeSubscriptions ?? 0} icon={CreditCard} color="green" />
                <StatCard label="Pending Requests" value={stats?.pendingRequests ?? 0} icon={Clock} color="yellow" />
                <StatCard
                    label="Total Revenue"
                    value={`$${((stats?.totalRevenue ?? 0) / 100).toFixed(2)}`}
                    icon={DollarSign}
                    color="red"
                    sub="from recent payments"
                />
            </div>

            {/* Tables */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Payments */}
                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-red-400" />
                            <span className="text-sm font-semibold text-white">Recent Payments</span>
                        </div>
                        <a href="/admin/payments" className="text-xs text-gray-600 hover:text-red-400 flex items-center gap-1 transition">
                            View all <ArrowUpRight className="w-3 h-3" />
                        </a>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                        {stats?.recentPayments?.length ? stats.recentPayments.map((p) => (
                            <div key={p.id} className="px-5 py-3.5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-white">{p.id.slice(0, 8)}…</p>
                                    <p className="text-[10px] text-gray-600 mt-0.5">{new Date(p.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-semibold text-white">${(p.amount / 100).toFixed(2)}</span>
                                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${STATUS_BADGE[p.status] ?? "text-gray-500 border-white/10"}`}>
                                        {p.status}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <p className="px-5 py-8 text-center text-xs text-gray-600">No recent payments</p>
                        )}
                    </div>
                </div>

                {/* Recent Requests */}
                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-red-400" />
                            <span className="text-sm font-semibold text-white">Subscription Requests</span>
                        </div>
                        <a href="/admin/subscriptions" className="text-xs text-gray-600 hover:text-red-400 flex items-center gap-1 transition">
                            View all <ArrowUpRight className="w-3 h-3" />
                        </a>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                        {stats?.recentRequests?.length ? stats.recentRequests.map((r) => (
                            <div key={r.id} className="px-5 py-3.5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-white">{r.id.slice(0, 8)}…</p>
                                    <p className="text-[10px] text-gray-600 mt-0.5">{new Date(r.created_at).toLocaleDateString()}</p>
                                </div>
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${STATUS_BADGE[r.status] ?? "text-gray-500 border-white/10"}`}>
                                    {r.status}
                                </span>
                            </div>
                        )) : (
                            <p className="px-5 py-8 text-center text-xs text-gray-600">No recent requests</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}