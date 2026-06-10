"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { PassageOut } from "@/lib/api/ielts_reading";

interface AnswerMap { [subQuestionId: number]: string; }

interface Props {
    group: PassageOut["question_groups"][0];
    answers: AnswerMap;
    onAnswer: (subId: number, value: string) => void;
}

/**
 * Used for: SHORT_ANSWER, NOTE_COMPLETION, TABLE_COMPLETION, FLOW_CHART_COMPLETION
 */
export function ShortAnswer({ group, answers, onAnswer }: Props) {
    const sqs = group.sub_questions;
    const [bookmarked, setBookmarked] = useState<Set<number>>(new Set());

    const toggleBookmark = (id: number) => {
        setBookmarked((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    return (
        <div className="flex flex-col gap-3 mt-3">
            {sqs.map((sq) => {
                const isBookmarked = bookmarked.has(sq.id);
                return (
                    <div key={sq.id} className="flex items-start gap-3 group/option">
                        <span className="shrink-0 w-6 text-[13px] font-black text-gray-400 pt-[9px] text-right">
                            {sq.question_number}
                        </span>

                        <div className="flex-1 min-w-0">
                            {sq.question_text && (
                                <p
                                    className="text-[13.5px] text-gray-800 leading-snug mb-1.5"
                                    dangerouslySetInnerHTML={{ __html: sq.question_text }}
                                />
                            )}
                            <div className="relative">
                                <input
                                    id={`question-${sq.question_number}`}
                                    data-qn={sq.question_number}
                                    type="text"
                                    autoComplete="off"
                                    aria-label={`Answer for question ${sq.question_number}`}
                                    placeholder="Type your answer..."
                                    className="w-full rounded-lg px-3 py-2 text-[13px] border border-gray-300 bg-white text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-400"
                                    value={answers[sq.id] ?? ""}
                                    onChange={(e) => onAnswer(sq.id, e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="button"
                            aria-pressed={isBookmarked}
                            title={isBookmarked ? "Remove bookmark" : "Bookmark question"}
                            onClick={() => toggleBookmark(sq.id)}
                            className="opacity-0 group-hover/option:opacity-100 mt-2 shrink-0 transition-opacity"
                        >
                            <Bookmark
                                className={`w-6 h-6 transition-colors ${isBookmarked
                                    ? "stroke-indigo-600 fill-indigo-500"
                                    : "stroke-gray-800 fill-white hover:stroke-indigo-500"
                                    }`}
                                strokeWidth={1}
                            />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}