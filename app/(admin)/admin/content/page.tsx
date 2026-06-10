"use client"

import { useState, useEffect, useCallback } from "react"
import { adminContentApi } from "@/lib/api/admin"
import type { Paginated } from "@/lib/types/admin"
import {
    BookOpen, Loader2, ChevronLeft, ChevronRight, Filter,
    Eye, Plus, Search,
} from "lucide-react"

export default function ContentPage() {
    const [activeTab, setActiveTab] = useState<"tests" | "exams">("tests")
    const [tests, setTests] = useState<Paginated<any> | null>(null)
    const [exams, setExams] = useState<Paginated<any> | null>(null)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [status, setStatus] = useState("")
    const PAGE_SIZE = 10

    const loadTests = useCallback(() => {
        setLoading(true)
        adminContentApi.getTests({ page, size: PAGE_SIZE, status: status || undefined })
            .then(setTests)
            .finally(() => setLoading(false))
    }, [page, status])

    const loadExams = useCallback(() => {
        setLoading(true)
        adminContentApi.getExams({ page, size: PAGE_SIZE, status: status || undefined })
            .then(setExams)
            .finally(() => setLoading(false))
    }, [page, status])

    useEffect(() => {
        if (activeTab === "tests") {
            loadTests()
        } else {
            loadExams()
        }
    }, [activeTab, loadTests, loadExams])

    const totalPages = activeTab === "tests" 
        ? (tests?.pages ?? 1) 
        : (exams?.pages ?? 1)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold text-white">Content Management</h1>
                <p className="text-xs text-gray-600 mt-1">Manage IELTS tests and exams</p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => { setActiveTab("tests"); setPage(1); setStatus("") }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                        activeTab === "tests"
                            ? "bg-indigo-500/15 border border-indigo-500/25 text-indigo-400"
                            : "bg-white/[0.03] border border-white/[0.07] text-gray-500 hover:text-gray-300"
                    }`}
                >
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    IELTS Reading Tests
                </button>
                <button
                    onClick={() => { setActiveTab("exams"); setPage(1); setStatus("") }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                        activeTab === "exams"
                            ? "bg-indigo-500/15 border border-indigo-500/25 text-indigo-400"
                            : "bg-white/[0.03] border border-white/[0.07] text-gray-500 hover:text-gray-300"
                    }`}
                >
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    Exams
                </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                    <input
                        placeholder={activeTab === "tests" ? "Search tests..." : "Search exams..."}
                        className="w-full pl-8 pr-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-gray-700 focus:outline-none focus:border-indigo-500/40 transition"
                    />
                </div>
                <Filter className="w-3.5 h-3.5 text-gray-600" />
                {["", "active", "inactive", "draft"].map((s) => (
                    <button
                        key={s || "all"}
                        onClick={() => { setStatus(s); setPage(1) }}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition capitalize ${
                            status === s
                                ? "bg-indigo-500/15 border-indigo-500/25 text-indigo-400"
                                : "bg-white/[0.03] border-white/[0.07] text-gray-500 hover:text-gray-300"
                        }`}
                    >
                        {s || "All"}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                {activeTab === "tests" ? (
                                    <>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Title</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Slug</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Difficulty</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Created</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Actions</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Title</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Exam Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Location</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Registrations</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Actions</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center">
                                        <Loader2 className="w-5 h-5 text-indigo-400 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : activeTab === "tests" && tests?.items?.length ? (
                                tests.items.map((test: any) => (
                                    <tr key={test.id} className="hover:bg-white/[0.02] transition">
                                        <td className="px-4 py-3 text-xs font-medium text-white">{test.title}</td>
                                        <td className="px-4 py-3 text-xs text-gray-500">{test.slug}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                                                test.status === "active" 
                                                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                                                    : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                                            }`}>
                                                {test.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500">{test.difficulty}</td>
                                        <td className="px-4 py-3 text-xs text-gray-600">
                                            {new Date(test.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.07] transition">
                                                <Eye className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : activeTab === "exams" && exams?.items?.length ? (
                                exams.items.map((exam: any) => (
                                    <tr key={exam.id} className="hover:bg-white/[0.02] transition">
                                        <td className="px-4 py-3 text-xs font-medium text-white">{exam.title}</td>
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {new Date(exam.exam_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500">{exam.location}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                                                exam.status === "active" 
                                                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                                                    : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                                            }`}>
                                                {exam.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {exam.registrations_count || 0} registrations
                                        </td>
                                        <td className="px-4 py-3">
                                            <button className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.07] transition">
                                                <Eye className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-xs text-gray-600">
                                        No {activeTab === "tests" ? "tests" : "exams"} found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between">
                        <span className="text-xs text-gray-600">
                            Total: {activeTab === "tests" ? tests?.total : exams?.total}
                        </span>
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={() => setPage(p => Math.max(1, p - 1))} 
                                disabled={page === 1} 
                                className="w-7 h-7 flex items-center justify-center rounded-lg border border-white/[0.07] text-gray-500 hover:text-white disabled:opacity-30 transition"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs text-gray-500 px-2">{page} / {totalPages}</span>
                            <button 
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                                disabled={page === totalPages} 
                                className="w-7 h-7 flex items-center justify-center rounded-lg border border-white/[0.07] text-gray-500 hover:text-white disabled:opacity-30 transition"
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
