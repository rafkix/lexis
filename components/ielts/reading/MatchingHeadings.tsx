"use client";

import { useState } from "react";
import { PassageOut } from "@/lib/api/ielts_reading";

interface AnswerMap { [subQuestionId: number]: string; }

interface Props {
    group: PassageOut["question_groups"][0];
    answers: AnswerMap;
    onAnswer: (subId: number, value: string) => void;
}

export function MatchingHeadings({ group, answers, onAnswer }: Props) {
    const sqs = group.sub_questions;
    const options = group.options;
    const [draggingKey, setDraggingKey] = useState<string | null>(null);
    const usedKeys = new Set(Object.values(answers).filter(Boolean));

    return (
        <div className="flex flex-col">
            <h3>
                Questions {sqs[0]?.question_number}–{sqs[sqs.length - 1]?.question_number}
            </h3>
            {group.instruction && (
                <div className="my-2" dangerouslySetInnerHTML={{ __html: group.instruction }} />
            )}

            {/* Word bank — drop zones are rendered inside the passage (left panel) */}
            <div className="border border-dashed rounded-md p-4 mt-2 grid grid-cols-2 gap-3 bg-white border-gray-300">
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
                            className={`rounded-md border px-2 py-1.5 text-sm text-left transition-all
                                ${isUsed
                                    ? "border-gray-200 opacity-40 line-through cursor-not-allowed text-gray-400"
                                    : draggingKey === opt.option_key
                                        ? "border-indigo-500 opacity-50 scale-95 cursor-grabbing"
                                        : "border-gray-300 hover:border-indigo-400 hover:shadow-sm cursor-grab"
                                }`}
                            disabled={isUsed}
                        >
                            <span className="font-semibold text-gray-500 mr-1">{opt.option_key}.</span>
                            <span>{opt.option_text}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}