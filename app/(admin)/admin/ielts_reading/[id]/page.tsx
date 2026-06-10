"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
    getTest,
    adminDeleteTest,
    type ReadingTestOut,
    type PassageOut,
    type QuestionGroupOut,
} from "@/lib/api/ielts_reading"
import {
    ArrowLeft, Trash2, BookOpen, Layers,
    ChevronDown, ChevronRight, CheckCircle2,
    HelpCircle, Loader2, AlertCircle, FileText,
} from "lucide-react"

// ── helpers ────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
    MATCHING_INFORMATION: "Matching Info",
    MATCHING_HEADINGS: "Matching Headings",
    SUMMARY_COMPLETION: "Summary Completion",
    SUMMARY_COMPLETION_DRAG_DROP: "Summary Drag & Drop",
    SENTENCE_COMPLETION: "Sentence Completion",
    MULTIPLE_CHOICE: "Multiple Choice",
    TRUE_FALSE_NOT_GIVEN: "True / False / NG",
    YES_NO_NOT_GIVEN: "Yes / No / NG",
}

const DIFF_COLOR: Record<string, string> = {
    EASY: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    MEDIUM: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    HARD: "text-red-400 bg-red-500/10 border-red-500/20",
}

// ── QuestionGroup accordion ────────────────────────────────────────────────

function GroupRow({ group }: { group: QuestionGroupOut }) {
    const [open, setOpen] = useState(false)
    return (
        <div className="border border-white/[0.05] rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] transition text-left"
            >
                <span className="text-[10px] px-2 py-0.5 rounded-full border bg-white/[0.04] text-gray-400 border-white/[0.07] shrink-0">
                    {TYPE_LABELS[group.type] ?? group.type}
                </span>
                <span className="text-xs text-gray-500 flex-1">
                    Q{group.question_number}
                    {group.sub_questions.length > 1
                        ? `–${group.question_number + group.sub_questions.length - 1}`
                        : ""}
                    {" "}· {group.sub_questions.length} sub-question{group.sub_questions.length !== 1 ? "s" : ""}
                </span>
                {open ? (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                ) : (
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                )}
            </button>

            {open && (
                <div className="px-4 pb-4 pt-2 space-y-4 bg-black/20">
                    {/* Instruction */}
                    {group.instruction && (
                        <div className="text-xs text-gray-500 leading-relaxed border-l-2 border-white/[0.08] pl-3">
                            <span className="text-gray-600 uppercase tracking-wider text-[10px] font-medium block mb-1">Instruction</span>
                            <span dangerouslySetInnerHTML={{ __html: group.instruction }} />
                        </div>
                    )}

                    {/* Options */}
                    {group.options.length > 0 && (
                        <div>
                            <p className="text-[10px] text-gray-600 uppercase tracking-wider font-medium mb-2">Options</p>
                            <div className="space-y-1">
                                {group.options.map((opt) => (
                                    <div key={opt.id} className="flex items-start gap-2 text-xs text-gray-400">
                                        <span className="w-5 h-5 rounded bg-white/[0.04] border border-white/[0.07] flex items-center justify-center shrink-0 text-[10px] font-mono text-gray-300">
                                            {opt.option_key}
                                        </span>
                                        <span>{opt.option_text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sub-questions */}
                    <div>
                        <p className="text-[10px] text-gray-600 uppercase tracking-wider font-medium mb-2">Questions</p>
                        <div className="space-y-2">
                            {group.sub_questions.map((sq) => (
                                <div
                                    key={sq.id}
                                    className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05]"
                                >
                                    <span className="w-6 h-6 rounded bg-red-500/10 border border-red-500/15 flex items-center justify-center shrink-0 text-[10px] font-mono text-red-400">
                                        {sq.question_number}
                                    </span>
                                    <span className="text-xs text-gray-400 leading-relaxed flex-1">
                                        {sq.question_text ?? <span className="text-gray-700 italic">Fill-in answer</span>}
                                    </span>
                                    <HelpCircle className="w-3.5 h-3.5 text-gray-700 shrink-0 mt-0.5" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// ── Part card ──────────────────────────────────────────────────────────────

function PartCard({ part }: { part: PassageOut }) {
    const [passageOpen, setPassageOpen] = useState(false)

    const subQCount = part.question_groups.reduce(
        (s, g) => s + g.sub_questions.length, 0
    )

    return (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
            {/* Part header */}
            <div className="flex items-center gap-4 px-5 py-4 border-b border-white/[0.05]">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/15 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-red-400">{part.passage_number}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{part.title}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-gray-600">
                        <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {subQCount} questions
                        </span>
                        <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3" /> {part.question_groups.length} groups
                        </span>
                        {part.word_count && (
                            <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" /> {part.word_count} words
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Passage toggle */}
            <div className="px-5 py-3 border-b border-white/[0.04]">
                <button
                    onClick={() => setPassageOpen((v) => !v)}
                    className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition"
                >
                    <FileText className="w-3.5 h-3.5" />
                    {passageOpen ? "Hide passage" : "Show passage"}
                    {passageOpen ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                    )}
                </button>
                {passageOpen && (
                    <div className="mt-3 max-h-64 overflow-y-auto text-xs text-gray-400 leading-relaxed pr-2 border-l-2 border-white/[0.06] pl-3 scrollbar-thin">
                        <div dangerouslySetInnerHTML={{ __html: part.content }} />
                    </div>
                )}
            </div>

            {/* Question groups */}
            <div className="p-5 space-y-3">
                <p className="text-[11px] text-gray-600 uppercase tracking-wider font-medium">
                    Question groups
                </p>
                {part.question_groups.map((g) => (
                    <GroupRow key={g.id} group={g} />
                ))}
            </div>
        </div>
    )
}

// ── main page ──────────────────────────────────────────────────────────────

export default function AdminIeltsDetailPage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const [test, setTest] = useState<ReadingTestOut | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        if (!id) return
        setLoading(true)
        getTest(id)
            .then(setTest)
            .catch(() => setError("Test not found."))
            .finally(() => setLoading(false))
    }, [id])

    const handleDelete = async () => {
        if (!test) return
        setDeleting(true)
        try {
            await adminDeleteTest(test.id)
            router.push("/admin/ielts_reading")
        } catch {
            setDeleting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="w-6 h-6 text-red-400 animate-spin" />
            </div>
        )
    }

    if (error || !test) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
                <p className="text-gray-500 text-sm">{error ?? "Test not found."}</p>
                <Link href="/admin/ielts_reading" className="text-xs text-red-400 hover:underline">
                    ← Back to tests
                </Link>
            </div>
        )
    }

    const totalQuestions = test.passages?.reduce((s, p) => s + p.question_groups.reduce((gs, g) => gs + g.sub_questions.length, 0), 0) ?? 0

    return (
        <>
            {/* Delete modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70" onClick={() => setShowDeleteModal(false)} />
                    <div className="relative bg-[#0f0f1e] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                        </div>
                        <h3 className="text-white font-semibold mb-1">Deactivate test?</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            <span className="text-gray-300">"{test.global_title}"</span> will be hidden from users.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-2 rounded-xl border border-white/[0.08] text-sm text-gray-400 hover:text-white transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 py-2 rounded-xl bg-red-500/15 border border-red-500/25 text-sm text-red-400 hover:bg-red-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Deactivate
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Back + actions */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/admin/ielts_reading"
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition"
                    >
                        <ArrowLeft className="w-4 h-4" /> All tests
                    </Link>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 hover:bg-red-500/20 transition"
                    >
                        <Trash2 className="w-4 h-4" /> Deactivate
                    </button>
                </div>

                {/* Hero card */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl px-6 py-5">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/15 flex items-center justify-center shrink-0">
                            <BookOpen className="w-5 h-5 text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-lg font-bold text-white">{test.global_title}</h1>
                                {!test.is_active && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-500 border border-white/[0.04]">
                                        inactive
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-5 mt-2 text-xs text-gray-600">
                                <span>ID #{test.id}</span>
                                <span className="flex items-center gap-1">
                                    <Layers className="w-3.5 h-3.5" /> {test.passages.length} passages
                                </span>
                                <span className="flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> {totalQuestions} questions
                                </span>
                                <span>
                                    {new Date(test.created_at).toLocaleDateString("en-GB", {
                                        day: "2-digit", month: "short", year: "numeric",
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Parts */}
                <div className="space-y-4">
                    <h2 className="text-xs text-gray-600 uppercase tracking-wider font-medium">
                        Passages ({test.passages.length})
                    </h2>
                    {test.passages.map((part) => (
                        <PartCard key={part.id} part={part} />
                    ))}
                </div>
            </div>
        </>
    )
}