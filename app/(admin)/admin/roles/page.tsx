"use client"

import { useState, useEffect, useCallback } from "react"
import { adminRolesApi } from "@/lib/api/admin"
import type { Paginated } from "@/lib/types/admin"
import {
    ShieldCheck, Loader2, ChevronLeft, ChevronRight, Plus, X, Check, Trash2,
} from "lucide-react"

export default function RolesPage() {
    const [roles, setRoles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const load = useCallback(() => {
        setLoading(true)
        adminRolesApi.getAll()
            .then(setRoles)
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => { load() }, [load])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">Roles Management</h1>
                    <p className="text-xs text-gray-600 mt-1">Manage user roles and permissions</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 text-sm font-medium hover:bg-indigo-500/20 transition"
                >
                    <Plus className="w-4 h-4" />
                    Add Role
                </button>
            </div>

            {/* Table */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                {["ID", "Name", "Description", "Users", "Actions"].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-600">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center">
                                        <Loader2 className="w-5 h-5 text-indigo-400 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : roles.length ? roles.map((role: any) => (
                                <tr key={role.id} className="hover:bg-white/[0.02] transition">
                                    <td className="px-4 py-3 text-xs text-gray-400">{role.id}</td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs font-medium text-white bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                                            {role.name}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-500">{role.description || "—"}</td>
                                    <td className="px-4 py-3 text-xs text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <ShieldCheck className="w-3 h-3 text-indigo-400" />
                                            {role.users_count || 0} users
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={async () => {
                                                if (!confirm(`Delete role "${role.name}"?`)) return
                                                setDeletingId(role.id)
                                                try {
                                                    await adminRolesApi.delete(role.id)
                                                    load()
                                                } finally {
                                                    setDeletingId(null)
                                                }
                                            }}
                                            disabled={deletingId === role.id}
                                            className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/15 transition disabled:opacity-50"
                                        >
                                            {deletingId === role.id ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center text-xs text-gray-600">No roles found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Role Modal */}
            {showModal && <CreateRoleModal onClose={() => setShowModal(false)} onDone={load} />}
        </div>
    )
}

function CreateRoleModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const submit = async () => {
        if (!name.trim()) return setError("Role name is required")
        setSaving(true)
        setError(null)
        try {
            await adminRolesApi.create({
                name: name.trim(),
                description: description.trim() || undefined,
            })
            onDone()
            onClose()
        } catch (err: any) {
            setError(err?.message ?? "Failed to create role")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative w-full max-w-md rounded-2xl bg-[#0f0f1c] border border-white/[0.08] shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                    <h2 className="text-sm font-semibold text-white">Create New Role</h2>
                    <button onClick={onClose} className="text-gray-600 hover:text-white transition">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 bg-red-500/8 border border-red-500/15 text-red-400 rounded-xl px-3.5 py-3 text-xs">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                    <div className="space-y-1.5">
                        <label className="text-xs text-gray-500">Role Name</label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g., MODERATOR"
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-indigo-500/40 transition"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs text-gray-500">Description (optional)</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Role description..."
                            rows={3}
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-indigo-500/40 transition"
                        />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-sm text-gray-500 hover:text-white transition">Cancel</button>
                        <button 
                            onClick={submit} 
                            disabled={saving || !name.trim()}
                            className="flex-1 py-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-sm text-indigo-400 hover:bg-indigo-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Create
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
