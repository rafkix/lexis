"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    adminCreateTest,
    type ReadingTestCreate,
    type ReadingPartCreate,
    type QuestionGroupCreate,
    type SubQuestionCreate,
    type OptionCreate,
    type QuestionTypeEnum,
    type DifficultyEnum,
} from "@/lib/api/ielts_reading"
import {
    ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp,
    Loader2, AlertCircle, CheckCircle2, BookOpen,
    Upload, X, ChevronRight, FileText, List, Lock, Unlock,
} from "lucide-react"

// ─── Constants ────────────────────────────────────────────────────────────────

const QUESTION_TYPES: QuestionTypeEnum[] = [
    "MULTIPLE_CHOICE",
    "TRUE_FALSE_NOT_GIVEN",
    "YES_NO_NOT_GIVEN",
    "MATCHING_HEADINGS",
    "MATCHING_INFORMATION",
    "MATCHING_FEATURES",
    "SENTENCE_COMPLETION",
    "SUMMARY_COMPLETION",
    "NOTE_COMPLETION",
    "TABLE_COMPLETION",
    "FLOW_CHART_COMPLETION",
    "SHORT_ANSWER",
    "DIAGRAM_LABELLING",
]

const TYPE_LABELS: Record<QuestionTypeEnum, string> = {
    MULTIPLE_CHOICE: "Multiple Choice",
    TRUE_FALSE_NOT_GIVEN: "True / False / Not Given",
    YES_NO_NOT_GIVEN: "Yes / No / Not Given",
    MATCHING_HEADINGS: "Matching Headings",
    MATCHING_INFORMATION: "Matching Information",
    MATCHING_FEATURES: "Matching Features",
    SENTENCE_COMPLETION: "Sentence Completion",
    SUMMARY_COMPLETION: "Summary Completion",
    NOTE_COMPLETION: "Note Completion",
    TABLE_COMPLETION: "Table Completion",
    FLOW_CHART_COMPLETION: "Flow Chart Completion",
    SHORT_ANSWER: "Short Answer",
    DIAGRAM_LABELLING: "Diagram Labelling",
}

const NEEDS_OPTIONS: QuestionTypeEnum[] = [
    "MULTIPLE_CHOICE",
    "MATCHING_INFORMATION",
    "MATCHING_HEADINGS",
    "MATCHING_FEATURES",   // DRAG_DROP o'rniga
]

const DIFFICULTIES: DifficultyEnum[] = ["EASY", "MEDIUM", "HARD"]

// ─── Factories ────────────────────────────────────────────────────────────────

function makeSubQ(num: number): SubQuestionCreate {
    return {
        question_number: num,
        question_text: "",
        correct_answer: "",
        explanation: "",
        from_passage: "",
        points: 1,
    }
}

function makeOption(idx: number): OptionCreate {
    const key = "ABCDEFGHIJKLMNOP"[idx] ?? String(idx + 1)
    return {
        option_key: key,
        option_text: "",
        is_correct: false,
        order_index: idx,
        explanation: "",
        from_passage: "",
    }
}

function makeGroup(startNum: number): QuestionGroupCreate {
    return {
        question_number: startNum,
        type: "MULTIPLE_CHOICE",
        instruction: "",
        question_text: "",
        context: "",
        points: 1,
        is_active: true,
        sub_questions: [makeSubQ(startNum)],
        options: [],
    }
}

function makePart(partNum: number): ReadingPartCreate {
    return {
        part: partNum,
        title: "",
        content: "",
        time_limit_minutes: 20,
        difficulty: "MEDIUM",
        is_active: true,
        total_questions: 0,
        question_groups: [makeGroup(1)],
    }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Collects every unique QuestionTypeEnum used across all parts. */
function collectQuestionTypes(parts: ReadingPartCreate[]): QuestionTypeEnum[] {
    const seen = new Set<QuestionTypeEnum>()
    for (const part of parts) {
        for (const group of part.question_groups) {
            seen.add(group.type)
        }
    }
    return Array.from(seen)
}

// ─── JSON Converter ───────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertJsonToTestCreate(raw: any): ReadingTestCreate {
    let rawParts: any[] = []

    if (Array.isArray(raw.parts)) {
        rawParts = raw.parts
    } else {
        ; (["part1", "part2", "part3"] as const).forEach((k, i) => {
            if (raw[k]) rawParts.push({ ...raw[k], part: i + 1 })
        })
    }

    const parts: ReadingPartCreate[] = rawParts.map((p: any, i: number) => {
        const rawGroups: any[] = p.question_groups ?? p.questions ?? []

        const question_groups: QuestionGroupCreate[] = rawGroups.map((qg: any) => {
            const sub_questions: SubQuestionCreate[] = (
                qg.sub_questions ?? qg.questions ?? []
            ).map((sq: any) => ({
                question_number: sq.question_number ?? sq.questionNumber ?? 1,
                question_text: sq.question_text ?? sq.questionText ?? "",
                points: sq.points ?? 1,
                correct_answer: sq.correct_answer ?? sq.correctAnswer ?? "",
                explanation: sq.explanation ?? "",
                from_passage: sq.from_passage ?? sq.fromPassage ?? "",
            }))

            const options: OptionCreate[] = (qg.options ?? []).map((opt: any) => ({
                option_key: opt.option_key ?? opt.optionKey ?? "",
                option_text: opt.option_text ?? opt.optionText ?? "",
                is_correct: opt.is_correct ?? opt.isCorrect ?? false,
                order_index: opt.order_index ?? opt.orderIndex ?? 0,
                explanation: opt.explanation ?? "",
                from_passage: opt.from_passage ?? opt.fromPassage ?? "",
            }))

            return {
                question_number: qg.question_number ?? qg.questionNumber ?? 1,
                type: (qg.type as QuestionTypeEnum) ?? "MULTIPLE_CHOICE",
                instruction: qg.instruction ?? "",
                question_text: qg.question_text ?? qg.questionText ?? "",
                context: qg.context ?? "",
                points: qg.points ?? 1,
                is_active: qg.is_active ?? qg.isActive ?? true,
                sub_questions,
                options,
            }
        })

        return {
            part: p.part ?? i + 1,
            title: p.title ?? "",
            content: p.content ?? "",
            time_limit_minutes: p.time_limit_minutes ?? p.timeLimitMinutes ?? 20,
            difficulty: (p.difficulty as DifficultyEnum) ?? "MEDIUM",
            is_active: p.is_active ?? true,
            total_questions: p.total_questions ?? p.totalQuestions ?? 0,
            question_groups,
        }
    })

    return {
        global_title: raw.global_title ?? raw.globalTitle ?? "",
        is_active: true,
        is_free: raw.is_free ?? raw.isFree ?? false,
        question_types: [],          // derived automatically on submit
        parts,
    }
}

// ─── Shared Styles ────────────────────────────────────────────────────────────

const inputCls =
    "w-full px-3 py-2 bg-white/[0.03] border border-white/[0.07] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/40 transition"

const labelCls = "block text-[11px] text-gray-500 mb-1.5"

// ─── JSON Import Modal ────────────────────────────────────────────────────────

function JsonImportModal({
    onImport,
    onClose,
}: {
    onImport: (test: ReadingTestCreate) => void
    onClose: () => void
}) {
    const [json, setJson] = useState("")
    const [err, setErr] = useState<string | null>(null)
    const fileRef = useRef<HTMLInputElement>(null)

    const parse = (text: string) => {
        setErr(null)
        try {
            const raw = JSON.parse(text)
            const converted = convertJsonToTestCreate(raw)
            if (!converted.global_title) {
                setErr("global_title or globalTitle field not found.")
                return
            }
            if (!converted.parts.length) {
                setErr("No parts found. Expected parts[] array or part1/part2/part3 keys.")
                return
            }
            onImport(converted)
        } catch (e) {
            setErr("Invalid JSON: " + (e as Error).message)
        }
    }

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (ev) => setJson(ev.target?.result as string)
        reader.readAsText(file)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-[#0d0d1a] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                    <div>
                        <h3 className="text-sm font-semibold text-white">Import from JSON</h3>
                        <p className="text-[11px] text-gray-600 mt-0.5">
                            Supports parts[] array or part1 / part2 / part3 keys
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-600 hover:text-white transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFile} />
                        <button
                            onClick={() => fileRef.current?.click()}
                            className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-gray-400 hover:text-white hover:border-white/[0.15] transition"
                        >
                            <Upload className="w-3.5 h-3.5" />
                            Upload .json file
                        </button>
                    </div>

                    <div>
                        <label className={labelCls}>or paste JSON below</label>
                        <textarea
                            value={json}
                            onChange={(e) => setJson(e.target.value)}
                            rows={14}
                            placeholder={'{\n  "global_title": "Cambridge 7 Test 1",\n  "is_free": false,\n  "parts": [...]\n}'}
                            className={`${inputCls} resize-none font-mono text-xs leading-relaxed`}
                            spellCheck={false}
                        />
                    </div>

                    {err && (
                        <div className="flex items-start gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            {err}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.06]">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs text-gray-500 hover:text-white transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => parse(json)}
                        disabled={!json.trim()}
                        className="flex items-center gap-2 px-5 py-2 bg-red-500/15 border border-red-500/25 rounded-xl text-sm text-red-400 hover:bg-red-500/25 transition disabled:opacity-40"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Import
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── SubQuestion Form ─────────────────────────────────────────────────────────

function SubQuestionForm({
    sq,
    onChange,
    onRemove,
    canRemove,
}: {
    sq: SubQuestionCreate
    onChange: (u: SubQuestionCreate) => void
    onRemove: () => void
    canRemove: boolean
}) {
    const set = (k: keyof SubQuestionCreate, v: unknown) => onChange({ ...sq, [k]: v })

    return (
        <div className="border border-white/[0.05] rounded-xl p-4 space-y-3 bg-black/10">
            <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-600 font-mono font-medium">Q{sq.question_number}</span>
                {canRemove && (
                    <button onClick={onRemove} className="text-gray-700 hover:text-red-400 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                    <label className={labelCls}>Question text (optional)</label>
                    <input
                        value={sq.question_text ?? ""}
                        onChange={(e) => set("question_text", e.target.value)}
                        placeholder="Statement or stem text…"
                        className={inputCls}
                    />
                </div>
                <div>
                    <label className={labelCls}>Correct answer *</label>
                    <input
                        value={sq.correct_answer ?? ""}
                        onChange={(e) => set("correct_answer", e.target.value)}
                        placeholder="TRUE / A / Cambridge…"
                        className={inputCls}
                    />
                </div>
                <div>
                    <label className={labelCls}>Points</label>
                    <input
                        type="number"
                        min={1}
                        value={sq.points ?? 1}
                        onChange={(e) => set("points", Number(e.target.value))}
                        className={inputCls}
                    />
                </div>
                <div className="col-span-2">
                    <label className={labelCls}>Explanation (optional)</label>
                    <textarea
                        value={sq.explanation ?? ""}
                        onChange={(e) => set("explanation", e.target.value)}
                        rows={2}
                        placeholder="Why this answer is correct…"
                        className={`${inputCls} resize-none`}
                    />
                </div>
                <div className="col-span-2">
                    <label className={labelCls}>Passage excerpt</label>
                    <textarea
                        value={sq.from_passage ?? ""}
                        onChange={(e) => set("from_passage", e.target.value)}
                        rows={2}
                        placeholder="Relevant sentence(s) from the passage shown in the result…"
                        className={`${inputCls} resize-none`}
                    />
                </div>
            </div>
        </div>
    )
}

// ─── QuestionGroup Form ───────────────────────────────────────────────────────

function QuestionGroupForm({
    group,
    groupIndex,
    onChange,
    onRemove,
    canRemove,
}: {
    group: QuestionGroupCreate
    groupIndex: number
    onChange: (g: QuestionGroupCreate) => void
    onRemove: () => void
    canRemove: boolean
}) {
    const [open, setOpen] = useState(true)
    const set = (k: keyof QuestionGroupCreate, v: unknown) => onChange({ ...group, [k]: v })
    const needsOptions = NEEDS_OPTIONS.includes(group.type)

    const addSubQ = () => {
        const last = group.sub_questions.at(-1)
        const next = last ? last.question_number + 1 : group.question_number
        onChange({ ...group, sub_questions: [...group.sub_questions, makeSubQ(next)] })
    }

    const updateSubQ = (i: number, sq: SubQuestionCreate) => {
        const sqs = [...group.sub_questions]
        sqs[i] = sq
        onChange({ ...group, sub_questions: sqs })
    }

    const removeSubQ = (i: number) =>
        onChange({ ...group, sub_questions: group.sub_questions.filter((_, idx) => idx !== i) })

    const addOption = () =>
        onChange({ ...group, options: [...(group.options ?? []), makeOption((group.options ?? []).length)] })

    const updateOption = (i: number, opt: OptionCreate) => {
        const opts = [...(group.options ?? [])]
        opts[i] = opt
        onChange({ ...group, options: opts })
    }

    const removeOption = (i: number) =>
        onChange({ ...group, options: (group.options ?? []).filter((_, idx) => idx !== i) })

    return (
        <div className="border border-white/[0.07] rounded-2xl overflow-hidden">
            {/* Group header */}
            <div
                className="flex items-center gap-3 px-4 py-3 bg-white/[0.03] border-b border-white/[0.05] cursor-pointer select-none"
                onClick={() => setOpen((v) => !v)}
            >
                <span className="text-[10px] font-mono text-gray-600 min-w-[32px]">
                    G{groupIndex + 1}
                </span>
                <select
                    value={group.type}
                    onChange={(e) => {
                        e.stopPropagation()
                        set("type", e.target.value as QuestionTypeEnum)
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-transparent text-sm text-white focus:outline-none cursor-pointer"
                >
                    {QUESTION_TYPES.map((t) => (
                        <option key={t} value={t} className="bg-[#0f0f1e]">
                            {TYPE_LABELS[t]}
                        </option>
                    ))}
                </select>
                <span className="text-[11px] text-gray-600 font-mono">
                    {group.sub_questions.length} q
                </span>
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {canRemove && (
                        <button onClick={onRemove} className="text-gray-700 hover:text-red-400 transition p-1">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <button
                        onClick={() => setOpen((v) => !v)}
                        className="text-gray-600 hover:text-white transition p-1"
                    >
                        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {open && (
                <div className="p-4 space-y-4">
                    {/* Meta */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>Starting question number *</label>
                            <input
                                type="number"
                                min={1}
                                value={group.question_number}
                                onChange={(e) => set("question_number", Number(e.target.value))}
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Points per question</label>
                            <input
                                type="number"
                                min={1}
                                value={group.points}
                                onChange={(e) => set("points", Number(e.target.value))}
                                className={inputCls}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className={labelCls}>Instruction (HTML allowed)</label>
                            <textarea
                                value={group.instruction ?? ""}
                                onChange={(e) => set("instruction", e.target.value)}
                                rows={2}
                                placeholder="Choose ONE word from the passage for each answer…"
                                className={`${inputCls} resize-none`}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className={labelCls}>Question / summary text (HTML allowed)</label>
                            <textarea
                                value={group.question_text ?? ""}
                                onChange={(e) => set("question_text", e.target.value)}
                                rows={2}
                                placeholder="Group-level question text or summary body…"
                                className={`${inputCls} resize-none`}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className={labelCls}>Context (HTML allowed)</label>
                            <textarea
                                value={group.context ?? ""}
                                onChange={(e) => set("context", e.target.value)}
                                rows={3}
                                placeholder="The text below is a summary of the passage…"
                                className={`${inputCls} resize-none`}
                            />
                        </div>
                    </div>

                    {/* Options */}
                    {needsOptions && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-[11px] text-gray-600 uppercase tracking-wider font-medium">
                                    Options ({(group.options ?? []).length})
                                </p>
                                <button
                                    onClick={addOption}
                                    className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 transition"
                                >
                                    <Plus className="w-3 h-3" /> Add
                                </button>
                            </div>
                            {(group.options ?? []).map((opt, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[10px] font-mono text-gray-300 shrink-0">
                                        {opt.option_key}
                                    </span>
                                    <input
                                        value={opt.option_text}
                                        onChange={(e) => updateOption(i, { ...opt, option_text: e.target.value })}
                                        placeholder={`Option ${opt.option_key} text`}
                                        className={`${inputCls} flex-1`}
                                    />
                                    <button
                                        onClick={() => removeOption(i)}
                                        className="text-gray-700 hover:text-red-400 transition shrink-0"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Sub-questions */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] text-gray-600 uppercase tracking-wider font-medium">
                                Sub-questions ({group.sub_questions.length})
                            </p>
                            <button
                                onClick={addSubQ}
                                className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 transition"
                            >
                                <Plus className="w-3 h-3" /> Add
                            </button>
                        </div>
                        {group.sub_questions.map((sq, i) => (
                            <SubQuestionForm
                                key={i}
                                sq={sq}
                                onChange={(u) => updateSubQ(i, u)}
                                onRemove={() => removeSubQ(i)}
                                canRemove={group.sub_questions.length > 1}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Part Form ────────────────────────────────────────────────────────────────

function PartForm({
    part,
    partIndex,
    onChange,
}: {
    part: ReadingPartCreate
    partIndex: number
    onChange: (p: ReadingPartCreate) => void
}) {
    const set = (k: keyof ReadingPartCreate, v: unknown) => onChange({ ...part, [k]: v })

    const addGroup = () => {
        const lastGroup = part.question_groups.at(-1)
        const lastSq = lastGroup?.sub_questions.at(-1)
        const nextNum = lastSq ? lastSq.question_number + 1 : 1
        onChange({ ...part, question_groups: [...part.question_groups, makeGroup(nextNum)] })
    }

    const updateGroup = (i: number, g: QuestionGroupCreate) => {
        const gs = [...part.question_groups]
        gs[i] = g
        onChange({ ...part, question_groups: gs })
    }

    const removeGroup = (i: number) =>
        onChange({ ...part, question_groups: part.question_groups.filter((_, idx) => idx !== i) })

    return (
        <div className="space-y-5">
            {/* Part meta */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-red-400/60" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Part {partIndex + 1} — Passage
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className={labelCls}>Passage title *</label>
                        <input
                            value={part.title}
                            onChange={(e) => set("title", e.target.value)}
                            placeholder="e.g. The History of the Internet"
                            className={inputCls}
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Difficulty</label>
                        <select
                            value={part.difficulty}
                            onChange={(e) => set("difficulty", e.target.value as DifficultyEnum)}
                            className={`${inputCls} cursor-pointer`}
                        >
                            {DIFFICULTIES.map((d) => (
                                <option key={d} value={d} className="bg-[#0f0f1e]">
                                    {d}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>Time limit (minutes)</label>
                        <input
                            type="number"
                            min={5}
                            value={part.time_limit_minutes}
                            onChange={(e) => set("time_limit_minutes", Number(e.target.value))}
                            className={inputCls}
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Total questions</label>
                        <input
                            type="number"
                            min={0}
                            value={part.total_questions}
                            onChange={(e) => set("total_questions", Number(e.target.value))}
                            className={inputCls}
                        />
                    </div>
                    <div className="col-span-2">
                        <label className={labelCls}>Passage content (HTML allowed) *</label>
                        <textarea
                            value={part.content}
                            onChange={(e) => set("content", e.target.value)}
                            rows={10}
                            placeholder="Full reading passage text. Use [HEADING: A] to mark paragraph headings for Matching Headings questions…"
                            className={`${inputCls} resize-y font-mono text-xs leading-relaxed`}
                        />
                    </div>
                </div>
            </div>

            {/* Question groups */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <List className="w-4 h-4 text-red-400/60" />
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Question groups ({part.question_groups.length})
                        </span>
                    </div>
                    <button
                        onClick={addGroup}
                        className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition"
                    >
                        <Plus className="w-3.5 h-3.5" /> Add group
                    </button>
                </div>
                {part.question_groups.map((g, i) => (
                    <QuestionGroupForm
                        key={i}
                        group={g}
                        groupIndex={i}
                        onChange={(updated) => updateGroup(i, updated)}
                        onRemove={() => removeGroup(i)}
                        canRemove={part.question_groups.length > 1}
                    />
                ))}
            </div>
        </div>
    )
}

// ─── Pagination Bar ───────────────────────────────────────────────────────────

function PaginationBar({
    currentPage,
    parts,
    onNavigate,
}: {
    currentPage: number
    parts: ReadingPartCreate[]
    onNavigate: (page: number) => void
}) {
    const steps = [
        { label: "Test info", icon: <BookOpen className="w-3.5 h-3.5" /> },
        { label: parts[0]?.title || "Part 1", icon: <FileText className="w-3.5 h-3.5" /> },
        { label: parts[1]?.title || "Part 2", icon: <FileText className="w-3.5 h-3.5" /> },
        { label: parts[2]?.title || "Part 3", icon: <FileText className="w-3.5 h-3.5" /> },
    ]

    return (
        <div className="flex items-center gap-1">
            {steps.map((step, i) => {
                const isActive = currentPage === i
                const isDone = i < currentPage
                const isAccessible = i === 0 || i <= parts.length

                return (
                    <div key={i} className="flex items-center gap-1">
                        <button
                            onClick={() => isAccessible && onNavigate(i)}
                            disabled={!isAccessible}
                            className={`
                                flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition
                                ${isActive
                                    ? "bg-red-500/15 border border-red-500/25 text-red-400"
                                    : isDone
                                        ? "bg-white/[0.05] border border-white/[0.08] text-gray-300 hover:border-white/[0.15]"
                                        : isAccessible
                                            ? "bg-transparent border border-white/[0.05] text-gray-600 hover:text-gray-400"
                                            : "bg-transparent border border-white/[0.03] text-gray-700 cursor-not-allowed"
                                }
                            `}
                        >
                            {isDone
                                ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                : step.icon
                            }
                            <span className="hidden sm:inline truncate max-w-[80px]">{step.label}</span>
                            <span className="sm:hidden">{i === 0 ? "Info" : `P${i}`}</span>
                        </button>
                        {i < steps.length - 1 && (
                            <ChevronRight className="w-3 h-3 text-gray-700 shrink-0" />
                        )}
                    </div>
                )
            })}
        </div>
    )
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validatePage(
    page: number,
    title: string,
    parts: ReadingPartCreate[],
): string | null {
    if (page === 0) {
        if (!title.trim()) return "Test title is required."
        return null
    }

    const pi = page - 1
    const part = parts[pi]
    if (!part) return null

    if (!part.title.trim()) return `Part ${pi + 1}: passage title is required.`
    if (!part.content.trim()) return `Part ${pi + 1}: passage content is required.`

    for (const [gi, g] of part.question_groups.entries()) {
        if (g.sub_questions.length === 0)
            return `Part ${pi + 1}, Group ${gi + 1}: at least one sub-question is required.`
        for (const sq of g.sub_questions) {
            if (!sq.correct_answer?.trim())
                return `Part ${pi + 1}, Group ${gi + 1}, Q${sq.question_number}: correct answer is required.`
        }
    }
    return null
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminIeltsNewPage() {
    const router = useRouter()

    const [currentPage, setCurrentPage] = useState(0)   // 0 = info, 1–3 = parts
    const [title, setTitle] = useState("")
    const [isFree, setIsFree] = useState(false)          // NEW: subscription gate
    const [parts, setParts] = useState<ReadingPartCreate[]>([
        makePart(1),
        makePart(2),
        makePart(3),
    ])
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [showImport, setShowImport] = useState(false)
    const [importedBadge, setImportedBadge] = useState<string | null>(null)

    const updatePart = useCallback((i: number, p: ReadingPartCreate) => {
        setParts((prev) => {
            const n = [...prev]
            n[i] = p
            return n
        })
    }, [])

    const handleImport = (test: ReadingTestCreate) => {
        setTitle(test.global_title)
        setIsFree(test.is_free ?? false)
        setParts([
            test.parts?.[0] ?? makePart(1),
            test.parts?.[1] ?? makePart(2),
            test.parts?.[2] ?? makePart(3),
        ])
        setImportedBadge(test.global_title)
        setShowImport(false)
        setError(null)
        setCurrentPage(0)
    }

    const navigateTo = (page: number) => {
        const err = validatePage(currentPage, title, parts)
        if (err && page > currentPage) {
            setError(err)
            return
        }
        setError(null)
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const handleNext = () => navigateTo(currentPage + 1)
    const handlePrev = () => {
        setError(null)
        setCurrentPage((p) => Math.max(0, p - 1))
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const handleSubmit = async () => {
        setError(null)

        const err0 = validatePage(0, title, parts)
        if (err0) { setError(err0); setCurrentPage(0); return }
        for (let i = 1; i <= 3; i++) {
            const err = validatePage(i, title, parts)
            if (err) { setError(err); setCurrentPage(i); return }
        }

        const questionTypes = collectQuestionTypes(parts)

        // ✅ Backend schemaga mos payload
        const payload = {
            title: title.trim(),           // global_title → title
            is_active: true,
            is_free: isFree,
            difficulty: "MEDIUM",
            total_questions: parts.reduce((s, p) => s + p.question_groups.reduce((gs, g) => gs + g.sub_questions.length, 0), 0),
            time_limit_min: 60,
            question_types: questionTypes,
            passages: parts.map((p, i) => ({
                passage_number: i + 1,     // part → passage_number
                title: p.title,
                content: p.content,
                word_count: p.total_questions || null,
                question_groups: p.question_groups.map((g) => ({
                    question_number: g.question_number,
                    type: g.type,
                    instruction: g.instruction || null,
                    question_text: g.question_text || null,
                    context: g.context || null,
                    points: g.points,
                    sub_questions: g.sub_questions.map((sq) => ({
                        question_number: sq.question_number,
                        question_text: sq.question_text || null,
                        correct_answer: sq.correct_answer || null,
                        explanation: sq.explanation || null,
                        points: sq.points,
                    })),
                    options: g.options.map((opt) => ({
                        option_key: opt.option_key,
                        option_text: opt.option_text,
                        is_correct: opt.is_correct,
                        order_index: opt.order_index,
                        explanation: opt.explanation || null,
                    })),
                })),
            })),
        }

        setSaving(true)
        try {
            const created = await adminCreateTest(payload as any)
            setSuccess(true)
            setTimeout(() => router.push(`/admin/ielts_reading/${created.id}`), 1500)
        } catch (e: unknown) {
            const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
            const msg = typeof detail === "string"
                ? detail
                : Array.isArray(detail)
                    ? detail.map((d: any) => d.msg ?? JSON.stringify(d)).join(", ")
                    : "Failed to create test. Please try again."
            setError(msg)
            setSaving(false)
        }
    }

    // ── Success screen ────────────────────────────────────────────────
    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
                <p className="text-white font-semibold">Test created successfully!</p>
                <p className="text-xs text-gray-600">Redirecting…</p>
            </div>
        )
    }

    const partIdx = currentPage - 1

    return (
        <>
            {showImport && (
                <JsonImportModal onImport={handleImport} onClose={() => setShowImport(false)} />
            )}

            <div className="max-w-4xl mx-auto space-y-5 pb-20">
                {/* ── Top bar ── */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <Link
                        href="/admin/ielts_reading"
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition"
                    >
                        <ArrowLeft className="w-4 h-4" /> All tests
                    </Link>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowImport(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-gray-400 hover:text-white hover:border-white/[0.15] transition"
                        >
                            <Upload className="w-3.5 h-3.5" />
                            Import JSON
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="flex items-center gap-2 px-5 py-2 bg-red-500/15 border border-red-500/25 rounded-xl text-sm text-red-400 hover:bg-red-500/25 transition disabled:opacity-50"
                        >
                            {saving
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <BookOpen className="w-4 h-4" />
                            }
                            {saving ? "Saving…" : "Save test"}
                        </button>
                    </div>
                </div>

                {/* ── Pagination nav ── */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl px-4 py-3">
                    <PaginationBar
                        currentPage={currentPage}
                        parts={parts}
                        onNavigate={navigateTo}
                    />
                </div>

                {/* ── Error banner ── */}
                {error && (
                    <div className="flex items-start gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        {error}
                    </div>
                )}

                {/* ── Import success badge ── */}
                {importedBadge && (
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>
                            <strong>"{importedBadge}"</strong> imported successfully.
                        </span>
                        <button
                            onClick={() => setImportedBadge(null)}
                            className="ml-auto text-emerald-700 hover:text-emerald-300 transition"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════
                    PAGE 0 — Test info
                ══════════════════════════════════════════════════════ */}
                {currentPage === 0 && (
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl px-6 py-5 space-y-5">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-red-400/60" />
                            <h2 className="text-sm font-semibold text-white">Test information</h2>
                        </div>

                        {/* Title */}
                        <div>
                            <label className={labelCls}>Test title *</label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Cambridge IELTS 7 – Test 1"
                                className={`${inputCls} text-base`}
                                autoFocus
                            />
                        </div>

                        {/* is_free toggle — NEW ─────────────────────────────── */}
                        <div>
                            <label className={labelCls}>Access level</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsFree(true)}
                                    className={`flex items-center gap-2 flex-1 px-4 py-3 rounded-xl border text-sm transition
                                        ${isFree
                                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                            : "bg-white/[0.02] border-white/[0.07] text-gray-500 hover:border-white/[0.15]"
                                        }`}
                                >
                                    <Unlock className="w-4 h-4" />
                                    <div className="text-left">
                                        <p className="font-semibold text-xs">Free</p>
                                        <p className="text-[10px] opacity-60">Visible to all users</p>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setIsFree(false)}
                                    className={`flex items-center gap-2 flex-1 px-4 py-3 rounded-xl border text-sm transition
                                        ${!isFree
                                            ? "bg-red-500/10 border-red-500/30 text-red-400"
                                            : "bg-white/[0.02] border-white/[0.07] text-gray-500 hover:border-white/[0.15]"
                                        }`}
                                >
                                    <Lock className="w-4 h-4" />
                                    <div className="text-left">
                                        <p className="font-semibold text-xs">Premium / Pro</p>
                                        <p className="text-[10px] opacity-60">Subscription required</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* question_types preview — derived automatically ────── */}
                        <div>
                            <label className={labelCls}>
                                Question types — derived automatically from your groups
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                                {collectQuestionTypes(parts).length === 0 ? (
                                    <span className="text-[11px] text-gray-700 italic">
                                        No question groups added yet.
                                    </span>
                                ) : (
                                    collectQuestionTypes(parts).map((t) => (
                                        <span
                                            key={t}
                                            className="px-2.5 py-1 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[10px] text-gray-400 font-mono"
                                        >
                                            {TYPE_LABELS[t]}
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Parts summary */}
                        <div className="space-y-2 pt-1">
                            <p className="text-[11px] text-gray-600 uppercase tracking-wider font-medium">
                                Parts overview
                            </p>
                            {parts.map((p, i) => (
                                <button
                                    key={i}
                                    onClick={() => navigateTo(i + 1)}
                                    className="w-full flex items-center gap-3 px-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] hover:border-white/[0.10] rounded-xl transition text-left"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/15 flex items-center justify-center shrink-0">
                                        <span className="text-[10px] font-bold text-red-400">{i + 1}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate">
                                            {p.title || (
                                                <span className="text-gray-600 italic">No title yet</span>
                                            )}
                                        </p>
                                        <p className="text-[11px] text-gray-600 mt-0.5">
                                            {p.question_groups.length} group
                                            {p.question_groups.length !== 1 ? "s" : ""} ·{" "}
                                            {p.question_groups.reduce(
                                                (s, g) => s + g.sub_questions.length,
                                                0,
                                            )}{" "}
                                            questions · {p.difficulty}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-700 shrink-0" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════
                    PAGES 1–3 — Part forms
                ══════════════════════════════════════════════════════ */}
                {currentPage >= 1 && currentPage <= 3 && (
                    <PartForm
                        part={parts[partIdx]}
                        partIndex={partIdx}
                        onChange={(updated) => updatePart(partIdx, updated)}
                    />
                )}

                {/* ── Bottom navigation ── */}
                <div className="sticky bottom-4 flex items-center justify-between">
                    <button
                        onClick={handlePrev}
                        disabled={currentPage === 0}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#0c0c18]/95 backdrop-blur border border-white/[0.08] rounded-xl text-sm text-gray-400 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>

                    {/* Step dots */}
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0c0c18]/95 backdrop-blur border border-white/[0.08] rounded-xl">
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all ${i === currentPage
                                    ? "bg-red-400 w-4"
                                    : i < currentPage
                                        ? "bg-emerald-500 w-1.5"
                                        : "bg-gray-700 w-1.5"
                                    }`}
                            />
                        ))}
                    </div>

                    {currentPage < 3 ? (
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#0c0c18]/95 backdrop-blur border border-white/[0.08] rounded-xl text-sm text-gray-400 hover:text-white transition"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="flex items-center gap-2 px-5 py-2.5 bg-red-500/15 backdrop-blur border border-red-500/25 rounded-xl text-sm text-red-400 hover:bg-red-500/25 transition disabled:opacity-50"
                        >
                            {saving
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <BookOpen className="w-4 h-4" />
                            }
                            {saving ? "Saving…" : "Save"}
                        </button>
                    )}
                </div>
            </div>
        </>
    )
}