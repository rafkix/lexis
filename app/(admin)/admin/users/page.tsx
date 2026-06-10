"use client"

import { useState, useEffect } from "react"
import { adminUsersApi } from "@/lib/api/admin"
import type { AdminUser, Paginated } from "@/lib/types/admin"
import {
    Users, Search, Filter, MoreHorizontal,
    UserCheck, UserX, Mail, Calendar,
    ShieldCheck, ShieldOff, Loader2, AlertCircle,
} from "lucide-react"

export default function UsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState<"all" | "active" | "inactive">("all")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        setLoading(true)
        adminUsersApi.getAll({ page, search: search || undefined, status: filter === "all" ? undefined : filter })
            .then((data: Paginated<AdminUser>) => {
                setUsers(data.items)
                setTotalPages(data.pages)
            })
            .catch(() => setError("Failed to load users"))
            .finally(() => setLoading(false))
    }, [page, search, filter])

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await adminUsersApi.updateStatus(id, newStatus)
            // Refresh the list
            const data = await adminUsersApi.getAll({ page, search: search || undefined, status: filter === "all" ? undefined : filter })
            setUsers(data.items)
        } catch (err) {
            setError("Failed to update user status")
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center h-60">
            <Loader2 className="w-6 h-6 text-red-400 animate-spin" />
        </div>
    )

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold text-white">Users</h1>
                <p className="text-xs text-gray-600 mt-1">Manage registered users</p>
            </div>

            {error && (
                <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-4 flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search users…"
                        className="w-full pl-8 pr-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-gray-700 focus:outline-none focus:border-red-500/40 transition"
                    />
                </div>
                {(["all", "active", "inactive"] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition capitalize ${filter === f
                            ? "bg-red-500/15 border-red-500/25 text-red-400"
                            : "bg-white/[0.03] border-white/[0.07] text-gray-500 hover:text-gray-300"
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                {["User", "Email", "Roles", "Status", "Verified", "Joined", ""].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-600">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                                                <Users className="w-5 h-5 text-gray-700" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">No users found</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.map((u) => (
                                <tr key={u.id} className="hover:bg-white/[0.02] transition">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-full bg-red-500/15 border border-red-500/20 flex items-center justify-center shrink-0">
                                                <span className="text-xs font-bold text-red-400">{u.full_name?.[0]?.toUpperCase()}</span>
                                            </div>
                                            <span className="text-xs font-medium text-white">{u.full_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{u.email}</span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-500">
                                        <div className="flex gap-1 flex-wrap">
                                            {u.roles?.map((role: string) => (
                                                <span key={role} className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px]">{role}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => handleStatusChange(u.id, u.status === "active" ? "inactive" : "active")}
                                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${u.status === "active" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}
                                        >
                                            {u.status}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        {u.is_verified
                                            ? <ShieldCheck className="w-4 h-4 text-green-400" />
                                            : <ShieldOff className="w-4 h-4 text-gray-700" />}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-600">
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(u.created_at).toLocaleDateString()}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.07] transition">
                                            <MoreHorizontal className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.07] text-xs text-gray-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-xs text-gray-600">Page {page} of {totalPages}</span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.07] text-xs text-gray-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}