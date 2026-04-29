"use client";

import { Bookmark } from "lucide-react";
import { ReadingPartOut } from "@/lib/api/ielts_reading";

interface AnswerMap { [subQuestionId: number]: string; }

interface Props {
    group: ReadingPartOut["question_groups"][0];
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

    // Split on sequences of 4+ underscores
    const parts = html.split(/_{4,}/g);

    return (
        <div className="leading-6">
            {parts.map((part, i) => {
                const sq = sqs[i];
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
                                    className="inline-block align-middle rounded-[3px] px-0.5 text-sm placeholder:text-center placeholder:font-bold placeholder:text-black focus:outline-none focus:ring-2 focus:ring-primary/60 border border-gray-500 bg-white text-black"
                                    style={{ width: 120 }}
                                    value={answers[sq.id] ?? ""}
                                    onChange={(e) => onAnswer(sq.id, e.target.value)}
                                />
                                <button
                                    className="opacity-0 group-hover/option:opacity-100 absolute -right-2.5"
                                    type="button"
                                    aria-pressed={false}
                                    title="Save question"
                                >
                                    <Bookmark className="w-6 h-6 stroke-gray-800 fill-white hover:stroke-primary" strokeWidth={1} />
                                </button>
                            </span>
                        )}
                    </span>
                );
            })}
        </div>
    );
}