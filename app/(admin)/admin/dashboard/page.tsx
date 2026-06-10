"use client"

import { useEffect, useState } from "react"
import { adminDashboardApi } from "@/lib/api/admin"
import type { AdminSummary } from "@/lib/types/admin"
import {
    TrendingUp, Users, CreditCard, Clock,
    DollarSign, CheckCircle2, XCircle, Loader2,
    ArrowUpRight, Activity, BookOpen, FileText, Bell,
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

export default function DashboardPage() {
    const [summary, setSummary] = useState<AdminSummary | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        adminDashboardApi.getSummary()
            .then(setSummary)
            .catch((err) => setError("Failed to load dashboard stats"))
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

    const totalRevenue = summary?.subscriptions?.revenue_total ?? 0
    const totalUsers = summary?.users?.total ?? 0
    const activeSubscriptions = summary?.subscriptions?.active ?? 0
    const totalTests = summary?.tests?.total ?? 0
    const totalExams = summary?.exams?.total ?? 0
    const unreadNotifications = summary?.notifications?.unread ?? 0

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-xl font-bold text-white">Dashboard</h1>
                <p className="text-xs text-gray-600 mt-1">Overview of your admin panel</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Users" value={totalUsers} icon={Users} color="blue" />
                <StatCard label="Active Subscriptions" value={activeSubscriptions} icon={CreditCard} color="green" />
                <StatCard label="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} icon={DollarSign} color="red" sub="all time" />
                <StatCard label="IELTS Tests" value={totalTests} icon={BookOpen} color="yellow" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Exams" value={totalExams} icon={FileText} color="blue" />
                <StatCard label="Unread Notifications" value={unreadNotifications} icon={Bell} color="yellow" />
                <StatCard label="Test Completion" value={`${summary?.tests?.completion_rate ?? 0}%`} icon={Activity} color="green" />
                <StatCard label="Monthly Revenue" value={`$${(summary?.subscriptions?.revenue_monthly ?? 0).toFixed(2)}`} icon={DollarSign} color="red" sub="last 30 days" />
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-6">
                <h2 className="text-sm font-semibold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <a href="/admin/users" className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.06] transition text-xs text-gray-400 hover:text-white text-center">
                        Manage Users
                    </a>
                    <a href="/admin/subscriptions" className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.06] transition text-xs text-gray-400 hover:text-white text-center">
                        View Subscriptions
                    </a>
                    <a href="/admin/payments" className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.06] transition text-xs text-gray-400 hover:text-white text-center">
                        View Payments
                    </a>
                    <a href="/admin/notifications" className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.06] transition text-xs text-gray-400 hover:text-white text-center">
                        Send Notifications
                    </a>
                </div>
            </div>
        </div>
    )
}