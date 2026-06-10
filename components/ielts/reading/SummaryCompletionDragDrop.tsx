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

export function SummaryCompletionDragDrop({ group, answers, onAnswer }: Props) {
    const [draggingKey, setDraggingKey] = useState<string | null>(null);
    const [bookmarked, setBookmarked] = useState<Set<number>>(new Set());
    const sqs = group.sub_questions;
    const options = group.options;
    const html = group.question_text ?? "";
    const parts = html.split(/_{4,}/g);
    const usedKeys = new Set(Object.values(answers).filter(Boolean));

    const toggleBookmark = (id: number) => {
        setBookmarked((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    return (
        <div className="flex flex-col gap-y-10 text-black">
            <div className="group">
                <div className="flex flex-col">
                    <h3>Questions {sqs[0]?.question_number}–{sqs[sqs.length - 1]?.question_number}</h3>
                    {group.instruction && (
                        <div className="my-2" dangerouslySetInnerHTML={{ __html: group.instruction }} />
                    )}

                    {/* Summary text with inline drop zones */}
                    <div className="p-4 rounded-md border bg-gray-100 border-gray-300">
                        <div className="leading-7">
                            {parts.map((part, i) => {
                                const sq = sqs[i];
                                const filled = sq ? answers[sq.id] : undefined;
                                const filledOpt = filled ? options.find((o) => o.option_key === filled) : null;
                                const isBookmarked = sq ? bookmarked.has(sq.id) : false;

                                return (
                                    <span key={i}>
                                        <span dangerouslySetInnerHTML={{ __html: part }} />
                                        {sq && i < parts.length - 1 && (
                                            <span
                                                className="inline-flex group/option relative mx-px"
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    const key = e.dataTransfer.getData("optionKey");
                                                    if (key) onAnswer(sq.id, key);
                                                }}
                                            >
                                                <span
                                                    id={`question-${sq.question_number}`}
                                                    className={`align-middle border-2 border-dashed rounded-md px-1 py-0 text-sm min-w-[150px] inline-block text-center cursor-pointer transition-colors ${filledOpt
                                                        ? "border-indigo-500 bg-indigo-50 text-indigo-900 font-semibold"
                                                        : "border-gray-500 bg-white hover:border-indigo-400"
                                                        }`}
                                                    onClick={() => filledOpt && onAnswer(sq.id, "")}
                                                    title={filledOpt ? "Click to remove" : undefined}
                                                >
                                                    {filledOpt ? filledOpt.option_text : sq.question_number}
                                                </span>
                                                <button
                                                    type="button"
                                                    aria-pressed={isBookmarked}
                                                    title={isBookmarked ? "Remove bookmark" : "Bookmark question"}
                                                    onClick={() => toggleBookmark(sq.id)}
                                                    className="opacity-0 group-hover/option:opacity-100 absolute right-0 transition-opacity"
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
                    </div>

                    {/* Word bank */}
                    <div>
                        <div className="border border-dashed rounded-md p-4 mt-3 grid grid-cols-3 gap-3 border-gray-500 bg-white">
                            {options.map((opt) => {
                                const isUsed = usedKeys.has(opt.option_key);
                                return (
                                    <button
                                        key={opt.id}
                                        draggable={!isUsed}
                                        onDragStart={(e) => {
                                            e.dataTransfer.setData("optionKey", opt.option_key);
                                            setDraggingKey(opt.option_key);
                                        }}
                                        onDragEnd={() => setDraggingKey(null)}
                                        onClick={() => {
                                            if (isUsed) return;
                                            const emptySq = sqs.find((s) => !answers[s.id]);
                                            if (emptySq) onAnswer(emptySq.id, opt.option_key);
                                        }}
                                        className={`rounded-md border transition-all ${isUsed
                                            ? "border-gray-300 opacity-40 line-through cursor-not-allowed"
                                            : draggingKey === opt.option_key
                                                ? "border-indigo-500 opacity-50 scale-95 cursor-grabbing"
                                                : "border-gray-300 hover:border-indigo-400 hover:shadow-sm cursor-grab"
                                            }`}
                                        style={{ opacity: isUsed ? 0.4 : 1, borderWidth: 1 }}
                                        disabled={isUsed}
                                    >
                                        <div className="flex gap-1 items-center py-1 px-2">
                                            <span>{opt.option_text}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <span className="group-hover:block absolute bottom-0 right-0" />
            </div>
        </div>
    );
}