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
 * Renders inline text inputs into a summary/sentence completion HTML string.
 * The question_text contains ____ markers (4+ underscores) as placeholders.
 */
export function InlineCompletion({ group, answers, onAnswer }: Props) {
    const sqs = group.sub_questions;
    const html = group.question_text ?? "";
    const parts = html.split(/_{4,}/g);
    const [bookmarked, setBookmarked] = useState<Set<number>>(new Set());

    const toggleBookmark = (id: number) => {
        setBookmarked((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    return (
        <div className="leading-6">
            {parts.map((part, i) => {
                const sq = sqs[i];
                const isBookmarked = sq ? bookmarked.has(sq.id) : false;
                return (
                    <span key={i}>
                        <span dangerouslySetInnerHTML={{ __html: part }} />
                        {sq && i < parts.length - 1 && (
                            <span className="inline-flex items-center group/option relative pr-2 mx-1">
                                <input
                                    id={`question-${sq.question_number}`}
                                    placeholder={String(sq.question_number)}
                                    data-qn={sq.question_number}
                                    type="text"
                                    autoComplete="off"
                                    aria-label={`Answer for question ${sq.question_number}`}
                                    className="inline-block align-middle rounded-[3px] px-0.5 text-sm placeholder:text-center placeholder:font-bold placeholder:text-black focus:outline-none focus:ring-2 focus:ring-indigo-500/60 border border-gray-500 bg-white text-black"
                                    style={{ width: 120 }}
                                    value={answers[sq.id] ?? ""}
                                    onChange={(e) => onAnswer(sq.id, e.target.value)}
                                />
                                <button
                                    type="button"
                                    aria-pressed={isBookmarked}
                                    title={isBookmarked ? "Remove bookmark" : "Bookmark question"}
                                    onClick={() => toggleBookmark(sq.id)}
                                    className="opacity-0 group-hover/option:opacity-100 absolute -right-2.5 transition-opacity"
                                >
                                    <Bookmark
                                        className={`w-6 h-6 transition-colors ${isBookmarked
                                            ? "stroke-indigo-600 fill-indigo-500"
                                            : "stroke-gray-800 fill-white hover:stroke-indigo-500"
                                            }`}
                                        strokeWidth={1}
                                    />
                                </button>
                            </span>
                        )}
                    </span>
                );
            })}
        </div>
    );
}