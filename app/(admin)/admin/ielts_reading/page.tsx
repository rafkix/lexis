"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
    listTests,
    adminDeleteTest,
    type ReadingTestListOut,
} from "@/lib/api/ielts_reading"
import {
    Plus, Trash2, Eye, BookOpen, Layers,
    Calendar, Search, Loader2, AlertCircle, RefreshCw,
} from "lucide-react"

// ── helpers ────────────────────────────────────────────────────────────────

function fmt(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
    })
}

// ── skeleton ───────────────────────────────────────────────────────────────

function Skeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-[72px] rounded-xl bg-white/[0.03] animate-pulse" />
            ))}
        </div>
    )
}

// ── empty ──────────────────────────────────────────────────────────────────

function Empty({ query }: { query: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="w-10 h-10 text-gray-700 mb-4" />
            <p className="text-gray-500 text-sm">
                {query ? `No tests match "${query}"` : "No tests yet. Create the first one."}
            </p>
        </div>
    )
}

// ── delete confirm modal ───────────────────────────────────────────────────

function DeleteModal({
    test,
    onCancel,
    onConfirm,
    loading,
}: {
    test: ReadingTestListOut
    onCancel: () => void
    onConfirm: () => void
    loading: boolean
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70" onClick={onCancel} />
            <div className="relative bg-[#0f0f1e] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-white font-semibold mb-1">Deactivate test?</h3>
                <p className="text-sm text-gray-500 mb-6">
                    <span className="text-gray-300">"{test.global_title}"</span> will be
                    hidden from users. This can be undone from the database.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2 rounded-xl border border-white/[0.08] text-sm text-gray-400 hover:text-white hover:border-white/20 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-2 rounded-xl bg-red-500/15 border border-red-500/25 text-sm text-red-400 hover:bg-red-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Deactivate
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── main page ──────────────────────────────────────────────────────────────

export default function AdminIeltsPage() {
    const [tests, setTests] = useState<ReadingTestListOut[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [query, setQuery] = useState("")
    const [toDelete, setToDelete] = useState<ReadingTestListOut | null>(null)
    const [deleting, setDeleting] = useState(false)

    const load = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await listTests({ limit: 100 })
            setTests(data)
        } catch {
            setError("Failed to load tests.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const filtered = tests.filter((t) =>
        t.global_title.toLowerCase().includes(query.toLowerCase())
    )

    const handleDelete = async () => {
        if (!toDelete) return
        setDeleting(true)
        try {
            await adminDeleteTest(toDelete.id)
            setTests((prev) => prev.filter((t) => t.id !== toDelete.id))
            setToDelete(null)
        } catch {
            // keep modal open, show nothing — user can retry
        } finally {
            setDeleting(false)
        }
    }

    return (
        <>
            {toDelete && (
                <DeleteModal
                    test={toDelete}
                    onCancel={() => setToDelete(null)}
                    onConfirm={handleDelete}
                    loading={deleting}
                />
            )}

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-white">IELTS Reading Tests</h1>
                        <p className="text-xs text-gray-600 mt-0.5">
                            {tests.length} test{tests.length !== 1 ? "s" : ""} total
                        </p>
                    </div>
                    <Link
                        href="/admin/ielts_reading/new"
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/15 border border-red-500/25 rounded-xl text-sm text-red-400 hover:bg-red-500/25 transition"
                    >
                        <Plus className="w-4 h-4" />
                        New test
                    </Link>
                </div>

                {/* Search + refresh */}
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search tests…"
                            className="w-full pl-9 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/30 transition"
                        />
                    </div>
                    <button
                        onClick={load}
                        disabled={loading}
                        className="px-3 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-gray-500 hover:text-white transition disabled:opacity-40"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                    </div>
                )}

                {/* Table */}
                {loading ? (
                    <Skeleton />
                ) : filtered.length === 0 ? (
                    <Empty query={query} />
                ) : (
                    <div className="space-y-2">
                        {filtered.map((test) => (
                            <div
                                key={test.id}
                                className="group flex items-center gap-4 px-5 py-4 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:border-white/10 hover:bg-white/[0.04] transition"
                            >
                                {/* Icon */}
                                <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/15 flex items-center justify-center shrink-0">
                                    <BookOpen className="w-4 h-4 text-red-400" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-white truncate">
                                            {test.global_title}
                                        </span>
                                        {!test.is_active && (
                                            <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-500 border border-white/[0.04]">
                                                inactive
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 mt-0.5 text-[11px] text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <Layers className="w-3 h-3" />
                                            {test.parts_count} part{test.parts_count !== 1 ? "s" : ""}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {fmt(test.created_at)}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                                    <Link
                                        href={`/admin/ielts_reading/${test.id}`}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.07] text-xs text-gray-400 hover:text-white hover:border-white/15 transition"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        View
                                    </Link>
                                    <button
                                        onClick={() => setToDelete(test)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/15 text-xs text-red-500 hover:text-red-300 hover:border-red-500/30 transition"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete
                                    </button>
                                </div>

                                {/* ID badge */}
                                <span className="text-[10px] text-gray-700 font-mono shrink-0">
                                    #{test.id}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}