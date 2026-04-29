"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    getAttemptResult,
    AttemptResultOut,
    AnswerStatusEnum,
} from "@/lib/api/ielts_reading";
import {
    CheckCircle,
    Heart,
    Loader2,
    BookOpenCheck,
    TableProperties,
    RotateCcw,
    House,
    ArrowLeft,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnswerRowData {
    questionNumber: number;
    givenAnswer: string | null;
    correctAnswer: string | null;
    status: AnswerStatusEnum;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ResultPage() {
    const params = useParams();
    const router = useRouter();

    // FIX: testId string olish (number ga convert etmaylik - API string kutadi)
    const testId = params.id as string;
    const attemptId = Number(params.attemptId);

    const [result, setResult] = useState<AttemptResultOut | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCorrect, setShowCorrect] = useState(true);
    const [feedback, setFeedback] = useState("");

    useEffect(() => {
        if (!attemptId || isNaN(attemptId)) {
            setError("Invalid attempt ID.");
            setLoading(false);
            return;
        }
        getAttemptResult(attemptId)
            .then(setResult)
            .catch(() => setError("Failed to load results."))
            .finally(() => setLoading(false));
    }, [attemptId]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="text-center space-y-3">
                    <p className="text-red-600">{error ?? "Result not found."}</p>
                    <Link href="/tests/ielts/reading" className="text-sm text-red-500 underline">
                        Back to tests
                    </Link>
                </div>
            </div>
        );
    }

    const pct = result.total_questions > 0
        ? Math.round((result.correct_count / result.total_questions) * 100)
        : 0;

    // Build sorted answer rows
    const answerRows: AnswerRowData[] = result.question_results
        .slice()
        .sort((a, b) => a.question_number - b.question_number)
        .map((q) => ({
            questionNumber: q.question_number,
            givenAnswer: q.given_answer,
            correctAnswer: q.correct_answer,
            status: q.status,
        }));

    const mid = Math.ceil(answerRows.length / 2);
    const leftCol = answerRows.slice(0, mid);
    const rightCol = answerRows.slice(mid);

    // Band score rangi
    const getBandColor = (score: number | null) => {
        if (!score) return "text-gray-400";
        if (score >= 7.5) return "text-emerald-600";
        if (score >= 6) return "text-blue-600";
        if (score >= 4.5) return "text-amber-500";
        return "text-rose-500";
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-6 h-12 flex items-center">
                    <Link
                        href="/tests/ielts/reading"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to tests
                    </Link>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-8">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">

                    {/* ── Header ── */}
                    <div className="text-center mb-8">
                        <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-2 text-gray-900">Test Complete!</h2>
                        <p className="text-gray-500">Here are your results</p>
                    </div>

                    {/* ── Score Section ── */}
                    <div className="bg-gray-50 rounded-xl p-6 mb-8">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            {/* Score bar */}
                            <div className="flex-1 w-full">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-600">Your Score</span>
                                    <span className="text-2xl font-bold text-gray-900">
                                        {result.correct_count} / {result.total_questions}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-emerald-500 h-3 rounded-full transition-all duration-1000"
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">{pct}% correct</p>
                            </div>

                            {/* Band score */}
                            {result.band_score != null && (
                                <div className="text-center shrink-0 px-6 py-3 bg-white rounded-xl border border-gray-200">
                                    <p className="text-xs text-gray-400 mb-1">Band Score</p>
                                    <p className={`text-4xl font-black ${getBandColor(result.band_score)}`}>
                                        {result.band_score.toFixed(1)}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">/ 9.0</p>
                                </div>
                            )}
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-3 mt-4">
                            {[
                                { label: "Correct", value: result.correct_count, cls: "text-emerald-600" },
                                { label: "Incorrect", value: result.incorrect_count, cls: "text-rose-500" },
                                { label: "Unanswered", value: result.unanswered_count, cls: "text-amber-500" },
                            ].map(({ label, value, cls }) => (
                                <div key={label} className="text-center bg-white rounded-lg py-3 border border-gray-100">
                                    <p className={`text-2xl font-black ${cls}`}>{value}</p>
                                    <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Answer Sheet ── */}
                    <div className="border border-gray-200 rounded-xl p-5 mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-900">Answer Sheet</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Show correct answers</span>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={showCorrect}
                                    onClick={() => setShowCorrect((s) => !s)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showCorrect ? "bg-emerald-500" : "bg-gray-200"}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 rounded-full bg-white shadow-md transform transition-transform ${showCorrect ? "translate-x-6" : "translate-x-1"}`}
                                    />
                                </button>
                            </div>
                        </div>

                        <div className="grid gap-x-4 lg:grid-cols-2 mt-2">
                            <div>
                                {leftCol.map((row, i) => (
                                    <AnswerRowItem key={row.questionNumber} row={row} index={i} showCorrect={showCorrect} />
                                ))}
                            </div>
                            <div>
                                {rightCol.map((row, i) => (
                                    <AnswerRowItem key={row.questionNumber} row={row} index={i} showCorrect={showCorrect} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Feedback ── */}
                    <div className="border-t border-gray-100 pt-6 mb-6">
                        <h3 className="text-base font-semibold text-gray-900 mb-3">Leave Feedback</h3>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 min-h-[90px] resize-none"
                            placeholder="Share your thoughts about this test..."
                        />
                        <button
                            disabled={!feedback.trim()}
                            className="mt-2 w-full py-2.5 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Submit Feedback
                        </button>
                    </div>

                    {/* ── Support ── */}
                    <div className="mb-6">
                        <button
                            type="button"
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors"
                        >
                            <Heart className="w-4 h-4 text-red-500" />
                            Support Our Project
                        </button>
                    </div>

                    {/* ── Action Buttons ── */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <Link
                            href="/tests/ielts/reading"
                            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <House className="w-4 h-4" />
                            Home
                        </Link>
                        <Link
                            href="/tests/ielts/reading"
                            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <BookOpenCheck className="w-4 h-4" />
                            All Tests
                        </Link>
                        <Link
                            href={`/tests/ielts/reading/${testId}`}
                            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <TableProperties className="w-4 h-4" />
                            Review
                        </Link>
                        <Link
                            href={`/tests/ielts/reading/${testId}`}
                            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Try Again
                        </Link>
                    </div>

                </div>
            </main>
        </div>
    );
}

// ─── Answer Row Component ─────────────────────────────────────────────────────

function AnswerRowItem({
    row,
    index,
    showCorrect,
}: {
    row: AnswerRowData;
    index: number;
    showCorrect: boolean;
}) {
    const isCorrect = row.status === "CORRECT";
    const isEven = index % 2 === 0;

    return (
        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg mb-1 ${isEven ? "bg-gray-50" : "bg-white"}`}>
            {/* Question number */}
            <span className="inline-flex w-7 h-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-700 font-semibold text-xs">
                {row.questionNumber}
            </span>

            {/* Given answer */}
            <span className="text-sm text-gray-600 min-w-[60px]">
                {row.givenAnswer ?? <span className="text-gray-300 italic">—</span>}
            </span>

            {/* Status icon */}
            {isCorrect ? (
                <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            ) : (
                <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
            )}

            {/* Correct answer */}
            {showCorrect && !isCorrect && (
                <span className="text-xs text-emerald-600 font-medium ml-1">
                    → {row.correctAnswer ?? "—"}
                </span>
            )}
        </div>
    );
}
