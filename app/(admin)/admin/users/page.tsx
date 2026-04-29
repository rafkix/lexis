"use client"

import { useState } from "react"
import {
    Users, Search, Filter, MoreHorizontal,
    UserCheck, UserX, Mail, Calendar,
    ShieldCheck, ShieldOff, Loader2,
} from "lucide-react"

// Placeholder page — extend with a /admin/users endpoint when ready.
// Currently shows an empty state with the designed shell.

type UserRow = {
    id: string
    full_name: string
    email: string
    is_active: boolean
    is_verified: boolean
    created_at: string
    plan?: string
}

const MOCK: UserRow[] = [] // replace with real API data

export default function UsersPage() {
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState<"all" | "active" | "inactive">("all")

    const filtered = MOCK.filter((u) => {
        const matchSearch =
            !search ||
            u.full_name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
        const matchFilter =
            filter === "all" ||
            (filter === "active" && u.is_active) ||
            (filter === "inactive" && !u.is_active)
        return matchSearch && matchFilter
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold text-white">Users</h1>
                <p className="text-xs text-gray-600 mt-1">Manage registered users</p>
            </div>

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
                                {["User", "Email", "Plan", "Status", "Verified", "Joined", ""].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-600">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                                                <Users className="w-5 h-5 text-gray-700" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">No users yet</p>
                                                <p className="text-xs text-gray-700 mt-1">Connect the users API endpoint to display data here</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.map((u) => (
                                <tr key={u.id} className="hover:bg-white/[0.02] transition">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-full bg-red-500/15 border border-red-500/20 flex items-center justify-center shrink-0">
                                                <span className="text-xs font-bold text-red-400">{u.full_name[0]?.toUpperCase()}</span>
                                            </div>
                                            <span className="text-xs font-medium text-white">{u.full_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{u.email}</span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-500">{u.plan ?? "—"}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${u.is_active ? "bg-green-500/10 text-green-400 border-green-500/20" : "text-gray-500 border-white/10 bg-white/5"}`}>
                                            {u.is_active ? "Active" : "Inactive"}
                                        </span>
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
            </div>
        </div>
    )
}