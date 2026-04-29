"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, ArrowRight,
    Maximize2, Minimize2, Check,
    Bell, SquarePen, Bookmark,
    ChevronLeft, ChevronRight,
    Loader2, Clock, AlertTriangle,
    FileText, X, Highlighter,
} from "lucide-react";
import {
    getTest, startAttempt, submitAttempt,
    ReadingTestOut, ReadingPartOut,
} from "@/lib/api/ielts_reading";
import { QuestionGroup } from "@/components/ielts/reading/QuestionGroup";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnswerMap { [subQuestionId: number]: string; }
type HighlightColor = "yellow" | "green" | "pink";

const TOTAL_SECONDS = 60 * 60;

const HL_COLORS: Record<HighlightColor, { bg: string; label: string }> = {
    yellow: { bg: "#ffe837", label: "Yellow" },
    green: { bg: "#58fc91", label: "Green" },
    pink: { bg: "#f8364d", label: "Pink" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAllSubQuestions(part: ReadingPartOut) {
    return part.question_groups.flatMap((g) => g.sub_questions);
}

function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

// ─── Context Menu (Right-click) ───────────────────────────────────────────────

interface CtxMenu {
    x: number;
    y: number;
    selectedText: string;
    range: Range | null;
}

function ContextMenu({
    menu,
    onHighlight,
    onNote,
    onClose,
}: {
    menu: CtxMenu;
    onHighlight: (color: HighlightColor, range: Range) => void;
    onNote: (text: string) => void;
    onClose: () => void;
}) {
    return (
        <>
            {/* backdrop */}
            <div className="fixed inset-0 z-40" onClick={onClose} />
            <div
                className="fixed z-50 bg-white border border-gray-200 rounded-xl shadow-2xl py-1.5 w-52 overflow-hidden"
                style={{ left: menu.x, top: menu.y }}
            >
                {/* Highlight row */}
                <div className="px-3 py-1.5">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                        Highlight
                    </p>
                    <div className="flex gap-2">
                        {(Object.entries(HL_COLORS) as [HighlightColor, { bg: string; label: string }][]).map(
                            ([key, { bg, label }]) => (
                                <button
                                    key={key}
                                    title={label}
                                    onClick={() => {
                                        if (menu.range) onHighlight(key, menu.range);
                                        onClose();
                                    }}
                                    className="w-6 h-6 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform"
                                    style={{ backgroundColor: bg }}
                                />
                            )
                        )}
                    </div>
                </div>

                <div className="h-px bg-gray-100 my-1" />

                {/* Note row */}
                <button
                    onClick={() => {
                        onNote(menu.selectedText);
                        onClose();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <SquarePen className="w-4 h-4 text-gray-400" />
                    Add note
                </button>
            </div>
        </>
    );
}

// ─── Notes Sidebar ────────────────────────────────────────────────────────────

interface Note {
    id: string;
    text: string;
    note: string;
}

function NotesSidebar({
    open,
    notes,
    onClose,
    onDeleteNote,
}: {
    open: boolean;
    notes: Note[];
    onClose: () => void;
    onDeleteNote: (id: string) => void;
}) {
    return (
        <aside
            className={`fixed top-0 right-0 h-full w-[320px] z-40 bg-white border-l border-gray-200 shadow-2xl
                transition-transform duration-300 ease-in-out
                ${open ? "translate-x-0" : "translate-x-full"}`}
        >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-900">Notes</h3>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="overflow-y-auto h-[calc(100%-53px)] p-4 space-y-3">
                {notes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-gray-400">
                        <FileText className="w-10 h-10 text-gray-200" />
                        <p className="text-sm font-medium text-gray-500">No notes yet</p>
                        <p className="text-xs leading-relaxed">
                            Right-click on passage text and select "Add note"
                        </p>
                    </div>
                ) : (
                    notes.map((n) => (
                        <div
                            key={n.id}
                            className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 relative group"
                        >
                            <p className="text-[11px] text-yellow-700 italic mb-1.5 line-clamp-2">
                                "{n.text}"
                            </p>
                            <p className="text-xs text-gray-700">{n.note}</p>
                            <button
                                onClick={() => onDeleteNote(n.id)}
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </aside>
    );
}

// ─── Submit Modal ─────────────────────────────────────────────────────────────

function SubmitModal({
    total, answered, submitting,
    onClose, onConfirm,
}: {
    total: number; answered: number; submitting: boolean;
    onClose: () => void; onConfirm: () => void;
}) {
    const skipped = total - answered;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-bold text-gray-900">Submit Test</h2>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                        { label: "Answered", value: answered, cls: "text-emerald-600" },
                        { label: "Total", value: total, cls: "text-gray-900" },
                        { label: "Skipped", value: skipped, cls: skipped > 0 ? "text-amber-500" : "text-gray-400" },
                    ].map(({ label, value, cls }) => (
                        <div key={label} className="text-center border border-gray-100 rounded-xl py-3">
                            <p className={`text-2xl font-black ${cls}`}>{value}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
                        </div>
                    ))}
                </div>

                {skipped > 0 && (
                    <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mb-5">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700">
                            {skipped} question{skipped > 1 ? "s" : ""} unanswered. You can still go back.
                        </p>
                    </div>
                )}

                <div className="flex gap-2.5">
                    <button
                        onClick={onClose}
                        className="flex-1 border border-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Continue
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={submitting}
                        className="flex-1 bg-gray-900 hover:bg-gray-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {submitting
                            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting…</>
                            : <><Check className="w-3.5 h-3.5" /> Submit</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Passage parser ───────────────────────────────────────────────────────────
// Parses content into blocks: plain text OR [HEADING:X] markers

type Block =
    | { type: "text"; text: string }
    | { type: "heading"; key: string; text: string };

function parsePassageBlocks(content: string): Block[] {
    const blocks: Block[] = [];
    // Split on [HEADING: X] markers
    const parts = content.split(/\[HEADING:\s*([A-Z])\]/g);
    // parts alternates: text, key, text, key, text …
    for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
            // plain text segment (may contain multiple paragraphs)
            if (parts[i].trim()) {
                blocks.push({ type: "text", text: parts[i] });
            }
        } else {
            // heading key
            const key = parts[i];
            const bodyText = parts[i + 1] ?? "";
            i++; // skip next since we consumed it
            blocks.push({ type: "heading", key, text: bodyText });
        }
    }
    return blocks;
}

// ─── Passage View ─────────────────────────────────────────────────────────────

interface PassageViewProps {
    part: ReadingPartOut;
    answers: AnswerMap;
    onAnswer: (subId: number, value: string) => void;
    onCtxMenu: (e: React.MouseEvent) => void;
}

function PassageView({ part, answers, onAnswer, onCtxMenu }: PassageViewProps) {
    const headingGroup = part.question_groups.find((g) => g.type === "MATCHING_HEADINGS");
    const content = part.content ?? "";

    return (
        <div
            className="mb-4 select-text"
            onContextMenu={onCtxMenu}
        >
            <h1 className="text-[17px] font-bold mb-2 text-gray-900 leading-snug">
                {part.title}
            </h1>
            {part.subtitle && (
                <p className="text-sm text-gray-500 mb-3 italic">{part.subtitle}</p>
            )}

            <div className="text-[14.5px] leading-[1.9] text-gray-800">
                {headingGroup ? (
                    <PassageWithHeadingDropzones
                        content={content}
                        headingGroup={headingGroup}
                        answers={answers}
                        onAnswer={onAnswer}
                    />
                ) : (
                    <div className="whitespace-pre-wrap">{content}</div>
                )}
            </div>
        </div>
    );
}

// ─── Passage with [HEADING:X] drop zones ─────────────────────────────────────

function PassageWithHeadingDropzones({
    content, headingGroup, answers, onAnswer,
}: {
    content: string;
    headingGroup: ReadingPartOut["question_groups"][0];
    answers: AnswerMap;
    onAnswer: (subId: number, value: string) => void;
}) {
    const [dragOverKey, setDragOverKey] = useState<string | null>(null);
    const sqs = headingGroup.sub_questions;
    const options = headingGroup.options;

    // Map option_key → sub_question for quick lookup
    // sub_question.question_text stores the paragraph key letter (e.g. "A")
    const sqByKey = Object.fromEntries(
        sqs.map((sq) => {
            // question_text might be like "Paragraph A" or just "A"
            const match = (sq.question_text ?? "").match(/([A-Z])$/);
            return [match ? match[1] : sq.question_number.toString(), sq];
        })
    );

    const blocks = parsePassageBlocks(content);

    return (
        <div className="space-y-1">
            {blocks.map((block, idx) => {
                if (block.type === "text") {
                    return (
                        <div key={idx} className="whitespace-pre-wrap">
                            {block.text}
                        </div>
                    );
                }

                // HEADING block
                const key = block.key;
                const sq = sqByKey[key];
                const assigned = sq ? answers[sq.id] : undefined;
                const assignedOpt = assigned ? options.find((o) => o.option_key === assigned) : null;
                const isOver = dragOverKey === key;

                return (
                    <div key={idx} className="mt-5 mb-2">
                        {/* Drop zone */}
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[11px] font-black text-gray-400 w-5 shrink-0">{key}</span>
                            <div
                                id={sq ? `question-${sq.question_number}` : undefined}
                                onDragOver={(e) => { e.preventDefault(); setDragOverKey(key); }}
                                onDragLeave={() => setDragOverKey(null)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setDragOverKey(null);
                                    if (!sq) return;
                                    const optKey = e.dataTransfer.getData("optionKey");
                                    if (optKey) onAnswer(sq.id, optKey);
                                }}
                                className={`flex-1 min-h-[34px] flex items-center gap-2 border-2 border-dashed rounded-lg px-2.5 py-1 transition-all
                                    ${isOver
                                        ? "border-blue-400 bg-blue-50"
                                        : assignedOpt
                                            ? "border-blue-300 bg-blue-50/50"
                                            : "border-gray-200 bg-gray-50 hover:border-blue-300"
                                    }`}
                            >
                                {assignedOpt ? (
                                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                        <span className="text-[11px] font-black text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded shrink-0">
                                            {assignedOpt.option_key}
                                        </span>
                                        <span className="text-[12px] text-gray-700 truncate">
                                            {assignedOpt.option_text}
                                        </span>
                                        <button
                                            onClick={() => sq && onAnswer(sq.id, "")}
                                            className="ml-auto shrink-0 text-gray-300 hover:text-rose-500 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <span className="text-[11px] text-gray-400 italic">
                                        {isOver ? "Drop here…" : "Drop heading here"}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Paragraph body text */}
                        {block.text.trim() && (
                            <div className="whitespace-pre-wrap pl-7 text-[14px] leading-relaxed">
                                {block.text}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Questions Panel ──────────────────────────────────────────────────────────

function QuestionsPanel({
    part, answers, onAnswer,
}: {
    part: ReadingPartOut;
    answers: AnswerMap;
    onAnswer: (subId: number, value: string) => void;
}) {
    return (
        <div className="select-text space-y-8 pb-4">
            {part.question_groups.map((group) => (
                <QuestionGroup
                    key={group.id}
                    group={group}
                    answers={answers}
                    onAnswer={onAnswer}
                />
            ))}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function IELTSReadingTestPage() {
    const router = useRouter();
    const params = useParams();
    const testId = params.id as string;

    // ── Data ──
    const [test, setTest] = useState<ReadingTestOut | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [attemptId, setAttemptId] = useState<number | null>(null);
    const [started, setStarted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showSubmit, setShowSubmit] = useState(false);

    // ── UI ──
    const [activePart, setActivePart] = useState(0);
    const [activeQuestion, setActiveQuestion] = useState(1);
    const [answers, setAnswers] = useState<AnswerMap>({});
    const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
    const [dividerPos, setDividerPos] = useState(50);
    const [mobileH, setMobileH] = useState(50);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [notesOpen, setNotesOpen] = useState(false);
    const [notes, setNotes] = useState<Note[]>([]);
    const [ctxMenu, setCtxMenu] = useState<CtxMenu | null>(null);

    // ── Refs ──
    const containerRef = useRef<HTMLDivElement>(null);
    const draggingH = useRef(false);
    const draggingV = useRef(false);

    // ── Load ──
    useEffect(() => {
        getTest(testId)
            .then(setTest)
            .catch(() => setError("Failed to load test."))
            .finally(() => setLoading(false));
    }, [testId]);

    // ── Timer ──
    useEffect(() => {
        if (!started) return;
        const id = setInterval(
            () => setTimeLeft((t) => (t > 0 ? t - 1 : 0)),
            1000,
        );
        return () => clearInterval(id);
    }, [started]);

    const parts = test?.parts ?? [];
    const currentPart = parts[activePart];

    const getPartQuestions = useCallback(
        (pi: number) => (parts[pi] ? getAllSubQuestions(parts[pi]) : []),
        [parts],
    );

    const totalQuestions = parts.reduce(
        (s, p) => s + getAllSubQuestions(p).length, 0,
    );
    const totalAnswered = Object.values(answers).filter((v) => v !== "").length;

    const timerDanger = timeLeft <= 300;
    const timerWarning = timeLeft <= 600 && !timerDanger;

    // ── Handlers ──
    const handleStart = async () => {
        try {
            const res = await startAttempt({ test_id: testId });
            setAttemptId(res.attempt_id);
            setStarted(true);
        } catch {
            alert("Failed to start. Please try again.");
        }
    };

    const handleSubmit = async () => {
        if (!attemptId || submitting) return;
        setSubmitting(true);
        setShowSubmit(false); // modalni darhol yopish
        try {
            const allSubIds = parts.flatMap((p) => getAllSubQuestions(p).map((sq) => sq.id));
            const list = allSubIds.map((sqId) => ({
                sub_question_id: sqId,
                given_answer: answers[sqId] || null,
            }));

            await submitAttempt({ attempt_id: attemptId, answers: list });
            router.push(`/tests/ielts/reading/${testId}/result/${attemptId}`);
        } catch (err: any) {
            // Agar allaqachon topshirilgan bo'lsa — result sahifasiga o'tish
            if (err?.response?.data?.detail === "This attempt has already been submitted.") {
                router.push(`/tests/ielts/reading/${testId}/result/${attemptId}`);
                return;
            }
            alert("Failed to submit.");
            setSubmitting(false);
        }
    };

    const handleAnswer = useCallback(
        (subId: number, value: string) =>
            setAnswers((prev) => ({ ...prev, [subId]: value })),
        [],
    );

    // ── Right-click context menu ──
    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        const sel = window.getSelection();
        const text = sel?.toString().trim() ?? "";
        if (!text) return;

        const range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0).cloneRange() : null;

        // Clamp to viewport
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        let x = e.clientX + 4;
        let y = e.clientY + 4;
        if (x + 210 > vw) x = vw - 214;
        if (y + 160 > vh) y = vh - 164;

        setCtxMenu({ x, y, selectedText: text, range });
    }, []);

    // ── Apply highlight ──
    const applyHighlight = useCallback(
        (color: HighlightColor, range: Range) => {
            try {
                const mark = document.createElement("mark");
                mark.style.backgroundColor = HL_COLORS[color].bg;
                mark.style.borderRadius = "2px";
                mark.style.padding = "0 1px";
                mark.style.cursor = "pointer";
                mark.title = "Click to remove highlight";
                mark.addEventListener("click", () => {
                    const p = mark.parentNode;
                    if (!p) return;
                    while (mark.firstChild) p.insertBefore(mark.firstChild, mark);
                    p.removeChild(mark);
                });
                range.surroundContents(mark);
            } catch {
                /* selection crosses elements — skip */
            }
            window.getSelection()?.removeAllRanges();
        },
        [],
    );

    // ── Add note ──
    const addNote = useCallback((text: string) => {
        const note = window.prompt(`Add a note for: "${text.slice(0, 60)}…"`);
        if (!note) return;
        setNotes((prev) => [
            ...prev,
            { id: `note-${Date.now()}`, text, note },
        ]);
        setNotesOpen(true);
    }, []);

    // ── Panel resize ──
    const onMouseMove = useCallback((e: React.MouseEvent) => {
        if (draggingH.current && containerRef.current) {
            const r = containerRef.current.getBoundingClientRect();
            const pct = ((e.clientX - r.left) / r.width) * 100;
            setDividerPos(Math.max(25, Math.min(75, pct)));
        }
        if (draggingV.current && containerRef.current) {
            const r = containerRef.current.getBoundingClientRect();
            const pct = ((e.clientY - r.top) / r.height) * 100;
            setMobileH(Math.max(20, Math.min(80, pct)));
        }
    }, []);

    const onMouseUp = useCallback(() => {
        draggingH.current = false;
        draggingV.current = false;
    }, []);

    // ── Fullscreen ──
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen?.();
            setIsFullscreen(false);
        }
    };

    // ── Question navigation ──
    const goToQuestion = useCallback(
        (qNum: number) => {
            setActiveQuestion(qNum);
            const pi = parts.findIndex((p) =>
                getAllSubQuestions(p).some((sq) => sq.question_number === qNum),
            );
            if (pi !== -1) setActivePart(pi);
            setTimeout(() => {
                document
                    .getElementById(`question-${qNum}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 60);
        },
        [parts],
    );

    const goNext = () => {
        const sqs = getPartQuestions(activePart);
        const idx = sqs.findIndex((sq) => sq.question_number === activeQuestion);
        if (idx !== -1 && idx + 1 < sqs.length) {
            goToQuestion(sqs[idx + 1].question_number);
        } else if (activePart < parts.length - 1) {
            const next = getPartQuestions(activePart + 1);
            setActivePart(activePart + 1);
            if (next.length) goToQuestion(next[0].question_number);
        }
    };

    const goPrev = () => {
        const sqs = getPartQuestions(activePart);
        const idx = sqs.findIndex((sq) => sq.question_number === activeQuestion);
        if (idx > 0) {
            goToQuestion(sqs[idx - 1].question_number);
        } else if (activePart > 0) {
            const prev = getPartQuestions(activePart - 1);
            setActivePart(activePart - 1);
            if (prev.length) goToQuestion(prev[prev.length - 1].question_number);
        }
    };

    // ── Loading / Error ──
    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-white">
            <div className="text-center space-y-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                <p className="text-sm text-gray-400">Loading test…</p>
            </div>
        </div>
    );

    if (error || !test) return (
        <div className="h-screen flex items-center justify-center bg-white">
            <div className="text-center space-y-3">
                <p className="text-red-600 font-semibold">{error ?? "Test not found."}</p>
                <Link
                    href="/tests/ielts/reading"
                    className="text-sm text-red-500 underline"
                >
                    Back to tests
                </Link>
            </div>
        </div>
    );

    // ── Render ──
    return (
        <div
            className="h-screen bg-white flex flex-col overflow-hidden"
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
        >
            {/* ── HEADER ──────────────────────────────────────────────── */}
            <header className="h-[52px] flex-shrink-0 border-b border-gray-200 bg-white flex items-center px-4 gap-3 z-10">

                {/* Back */}
                <button
                    onClick={() => router.push("/tests/ielts/reading")}
                    className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-900 font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Back</span>
                </button>

                <div className="h-4 w-px bg-red-200" />

                {/* Badge */}
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-white bg-red-600 px-2 py-0.5 rounded tracking-widest">
                        IELTS
                    </span>
                    <span className="text-[12px] text-gray-400 hidden sm:block">
                        Reading · #{testId}
                    </span>
                </div>

                {/* ── CENTER ── */}
                <div className="flex-1 flex items-center justify-center gap-3">
                    {/* Timer */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5}`}>
                        <Clock className={`w-3.5 h-3.5 ${timerDanger ? "text-red-500" :
                            timerWarning ? "text-amber-500" : "text-gray-400"
                            }`} />
                        <span className={`text-[14px] font-mono font-black tabular-nums ${timerDanger ? "text-red-600" :
                            timerWarning ? "text-amber-600" : "text-gray-700"
                            }`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>

                    {/* Start (before started) */}
                    {!started && (
                        <button
                            onClick={handleStart}
                            className="bg-red-500 hover:bg-red-450 text-white text-[13px] font-bold px-5 py-2 rounded-lg transition-colors"
                        >
                            Start
                        </button>
                    )}
                </div>

                {/* ── RIGHT ICONS ── */}
                <div className="flex items-center gap-1">
                    {/* Fullscreen */}
                    <button
                        onClick={toggleFullscreen}
                        className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                    >
                        {isFullscreen
                            ? <Minimize2 className="w-4 h-4" />
                            : <Maximize2 className="w-4 h-4" />
                        }
                    </button>

                    {/* Notes */}
                    <button
                        onClick={() => setNotesOpen((o) => !o)}
                        className={`p-2 rounded-lg transition-colors relative ${notesOpen ? "bg-gray-100 text-gray-900" : "hover:bg-gray-100 text-gray-400"
                            }`}
                    >
                        <SquarePen className="w-4 h-4" />
                        {notes.length > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                                {notes.length}
                            </span>
                        )}
                    </button>

                    {/* Bell */}
                    <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                        <Bell className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* ── PART BANNER ─────────────────────────────────────────── */}
            <div className="flex-shrink-0 h-8 bg-gray-50 border-b border-gray-200 hidden lg:flex items-center px-5 gap-2">
                <span className="text-[11px] font-black text-gray-700">
                    Part {activePart + 1}
                </span>
                {currentPart && (() => {
                    const sqs = getAllSubQuestions(currentPart);
                    const answered = sqs.filter(
                        (sq) => answers[sq.id] !== undefined && answers[sq.id] !== ""
                    ).length;
                    return (
                        <>
                            <span className="text-gray-300 text-xs">·</span>
                            <span className="text-[11px] text-gray-500 truncate max-w-xs">
                                {currentPart.title}
                            </span>
                            <span className="text-gray-300 text-xs">·</span>
                            <span className="text-[11px] text-gray-500">
                                {answered} / {sqs.length} answered
                            </span>
                            <div className="ml-auto w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gray-600 rounded-full transition-all duration-300"
                                    style={{
                                        width: sqs.length
                                            ? `${(answered / sqs.length) * 100}%`
                                            : "0%",
                                    }}
                                />
                            </div>
                        </>
                    );
                })()}
            </div>

            {/* Notes sidebar */}
            <NotesSidebar
                open={notesOpen}
                notes={notes}
                onClose={() => setNotesOpen(false)}
                onDeleteNote={(id) =>
                    setNotes((prev) => prev.filter((n) => n.id !== id))
                }
            />

            {/* ── SPLIT PANELS ────────────────────────────────────────── */}
            <div
                ref={containerRef}
                className="flex-1 overflow-hidden min-h-0 flex flex-col lg:flex-row"
            >
                {/* MOBILE */}
                <div className="h-full w-full flex flex-col min-h-0 lg:hidden">
                    <div
                        className="overflow-y-auto p-4 bg-white"
                        style={{ height: `${mobileH}%` }}
                    >
                        {currentPart && (
                            <PassageView
                                part={currentPart}
                                answers={answers}
                                onAnswer={handleAnswer}
                                onCtxMenu={handleContextMenu}
                            />
                        )}
                    </div>
                    <div
                        className="relative h-[5px] bg-gray-100 cursor-row-resize shrink-0 flex items-center justify-center"
                        onMouseDown={() => { draggingV.current = true; }}
                    >
                        <div className="w-8 h-1 rounded-full bg-gray-300" />
                    </div>
                    <div
                        className="overflow-y-auto p-4 bg-white border-t border-gray-100"
                        style={{ height: `${100 - mobileH}%` }}
                    >
                        {currentPart && (
                            <QuestionsPanel
                                part={currentPart}
                                answers={answers}
                                onAnswer={handleAnswer}
                            />
                        )}
                    </div>
                </div>

                {/* DESKTOP */}
                <div className="hidden lg:flex h-full w-full min-h-0">
                    {/* Passage */}
                    <div
                        className="overflow-y-auto p-6 bg-white"
                        style={{ width: `${dividerPos}%` }}
                    >
                        {currentPart && (
                            <PassageView
                                part={currentPart}
                                answers={answers}
                                onAnswer={handleAnswer}
                                onCtxMenu={handleContextMenu}
                            />
                        )}
                    </div>

                    {/* Resize handle */}
                    <div
                        className="relative w-[5px] shrink-0 cursor-col-resize group"
                        onMouseDown={() => { draggingH.current = true; }}
                    >
                        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-gray-200 group-hover:bg-gray-400 transition-colors" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-10 bg-white border border-gray-200 group-hover:border-gray-400 rounded-full flex items-center justify-center shadow-sm transition-colors">
                            <ChevronLeft className="w-3 h-3 text-gray-400" />
                        </div>
                    </div>

                    {/* Questions */}
                    <div
                        className="overflow-y-auto p-6 bg-white border-l border-gray-100"
                        style={{ width: `${100 - dividerPos}%` }}
                    >
                        {currentPart && (
                            <QuestionsPanel
                                part={currentPart}
                                answers={answers}
                                onAnswer={handleAnswer}
                            />
                        )}
                    </div>
                </div>
            </div>

            <footer className="flex-shrink-0 border-t border-gray-200 bg-white">
                <div className="flex items-center h-13">

                    {parts.map((part, pi) => {
                        const sqs = getAllSubQuestions(part);
                        const answered = sqs.filter((sq) => answers[sq.id] !== undefined && answers[sq.id] !== "").length;
                        const isActive = pi === activePart;

                        return (
                            <button
                                key={pi}
                                onClick={() => {
                                    setActivePart(pi);
                                    const first = getPartQuestions(pi)[0];
                                    if (first) goToQuestion(first.question_number);
                                }}
                                className={`flex items-center flex-1 gap-2 px-4 h-full transition-colors min-w-0 overflow-hidden ${!isActive && "hover:bg-gray-50"}`}
                            >
                                {/* "Part N" label */}
                                <span className={`text-[13px] font-bold shrink-0 ${isActive ? "text-gray-900" : "text-gray-600"}`}>
                                    Part {pi + 1}
                                </span>

                                {isActive ? (
                                    /* Active: savol raqamlari + ustidagi chiziq */
                                    <div className="flex items-end gap-1.5 overflow-x-auto min-w-0" style={{ scrollbarWidth: "none" }}>
                                        {sqs.map((sq) => {
                                            const isAns = answers[sq.id] !== undefined && answers[sq.id] !== "";
                                            const isCur = sq.question_number === activeQuestion;
                                            return (
                                                <button
                                                    key={sq.id}
                                                    onClick={(e) => { e.stopPropagation(); goToQuestion(sq.question_number); }}
                                                    className="flex flex-col items-center gap-[3px] shrink-0 pb-0.5 group"
                                                >
                                                    {/* Ustidagi chiziq — holat ko'rsatadi */}
                                                    <div className={`h-[2px] w-5 rounded-full transition-colors ${isCur ? "bg-gray-900" : isAns ? "bg-gray-500" : "bg-gray-200"}`} />
                                                    {/* Raqam */}
                                                    <span className={`text-[12px] leading-none transition-colors ${isCur ? "font-bold text-gray-900" : isAns ? "font-medium text-gray-600" : "font-normal text-gray-400 group-hover:text-gray-600"}`}>
                                                        {sq.question_number}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    /* Inactive: progress "X/Y" */
                                    <span className="text-[12px] font-normal text-gray-400 shrink-0">
                                        {answered}/{sqs.length}
                                    </span>
                                )}
                            </button>
                        );
                    })}

                    {/* Submit — faqat ✓ icon */}
                    {started && (
                        <button
                            onClick={() => setShowSubmit(true)}
                            title="Submit test"
                            className="h-full flex items-center justify-center px-4 border-l border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors shrink-0"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                    )}

                    {/* 80px bo'sh joy — absolute Prev/Next (w-10 × 2) uchun */}
                    <div className="w-20 shrink-0" />
                </div>
            </footer>

            {/* ── CONTEXT MENU ────────────────────────────────────────── */}
            {ctxMenu && (
                <ContextMenu
                    menu={ctxMenu}
                    onHighlight={applyHighlight}
                    onNote={addNote}
                    onClose={() => setCtxMenu(null)}
                />
            )}

            {/* ── SUBMIT MODAL ────────────────────────────────────────── */}
            {showSubmit && (
                <SubmitModal
                    total={totalQuestions}
                    answered={totalAnswered}
                    submitting={submitting}
                    onClose={() => setShowSubmit(false)}
                    onConfirm={handleSubmit}
                />
            )}
        </div>
    );
}