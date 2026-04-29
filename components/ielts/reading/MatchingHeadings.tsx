"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { ReadingPartOut } from "@/lib/api/ielts_reading";

interface AnswerMap { [subQuestionId: number]: string; }

interface Props {
    group: ReadingPartOut["question_groups"][0];
    answers: AnswerMap;
    onAnswer: (subId: number, value: string) => void;
}

export function MatchingHeadings({ group, answers, onAnswer }: Props) {
    const [draggingValue, setDraggingValue] = useState<string | null>(null);
    const sqs = group.sub_questions;
    const options = group.options;

    // Which option keys are already used?
    const usedKeys = new Set(Object.values(answers).filter(Boolean));

    return (
        <div className="flex flex-col gap-y-10 text-black">
            <div className="group">
                <div className="flex flex-col">
                    <h3>Questions {sqs[0]?.question_number}–{sqs[sqs.length - 1]?.question_number}</h3>
                    {group.instruction && (
                        <div className="my-2" dangerouslySetInnerHTML={{ __html: group.instruction }} />
                    )}
                    <h3 className="font-bold text-base">List of Headings</h3>

                    {/* Draggable bank */}
                    <div
                        data-mh-dropzone="bank"
                        className="flex flex-col gap-2 mt-3 p-2 rounded-md bg-transparent"
                    >
                        {options.map((opt) => {
                            const isUsed = usedKeys.has(opt.option_key);
                            return (
                                <span
                                    key={opt.id}
                                    draggable={!isUsed}
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData("optionKey", opt.option_key);
                                        e.dataTransfer.setData("optionText", opt.option_text);
                                        setDraggingValue(opt.option_key);
                                    }}
                                    onDragEnd={() => setDraggingValue(null)}
                                    className={`border-2 font-semibold rounded-lg px-3 w-fit pb-1 bg-white
                    ${isUsed
                                            ? "border-gray-200 opacity-40 line-through cursor-not-allowed"
                                            : draggingValue === opt.option_key
                                                ? "border-blue-400 shadow-xl opacity-50 cursor-grabbing"
                                                : "border-gray-200 cursor-move hover:shadow-xl hover:border-blue-400"
                                        }`}
                                >
                                    {opt.option_text}
                                </span>
                            );
                        })}
                    </div>
                </div>
                <span className="group-hover:block absolute bottom-0 right-0" />
            </div>
        </div>
    );
}