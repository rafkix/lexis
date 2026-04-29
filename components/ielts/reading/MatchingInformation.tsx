"use client";

import { Bookmark } from "lucide-react";
import { ReadingPartOut } from "@/lib/api/ielts_reading";

interface AnswerMap { [subQuestionId: number]: string; }

interface Props {
    group: ReadingPartOut["question_groups"][0];
    answers: AnswerMap;
    onAnswer: (subId: number, value: string) => void;
}

export function MatchingInformation({ group, answers, onAnswer }: Props) {
    const sqs = group.sub_questions;
    const options = group.options;

    return (
        <div className="flex flex-col gap-px mt-3 border border-black/30 p-5 rounded-md overflow-auto min-w-[800px]">
            <table className="w-full table-fixed">
                <thead>
                    <tr>
                        <th className="w-1/3 text-left" />
                        {options.map((opt, idx) => (
                            <th
                                key={opt.id}
                                className={`text-center py-2 ${idx === 0 ? "border-l-2 border-black" : "border-l border-black/70"}`}
                            >
                                <span>{opt.option_key}</span>
                            </th>
                        ))}
                        <th className="w-24" />
                    </tr>
                </thead>
                <tbody>
                    {sqs.map((sq, rowIdx) => (
                        <tr key={sq.id} className="group/option">
                            <td className={`${rowIdx === 0 ? "border-t-2 border-black/70" : "border-t border-black/70"}`}>
                                <div className="flex gap-3 items-start p-2 min-h-14">
                                    <b>{sq.question_number}.</b>
                                    <span>{sq.question_text}</span>
                                </div>
                            </td>
                            {options.map((opt, colIdx) => (
                                <td
                                    key={opt.id}
                                    className={`relative min-w-14 ${rowIdx === 0 ? "border-t-2 border-black/70" : "border-t border-black/70"} ${colIdx === 0 ? "border-l-2 border-black border-l" : "border-l border-black/70"}`}
                                >
                                    <label
                                        htmlFor={`input-${opt.option_key}-${sq.question_number}`}
                                        className={`absolute inset-0 flex items-center justify-center cursor-pointer ${answers[sq.id] === opt.option_key ? "bg-primary/10" : "bg-transparent"}`}
                                    >
                                        <input
                                            type="radio"
                                            id={`input-${opt.option_key}-${sq.question_number}`}
                                            name={`input-${sq.question_number}`}
                                            className="sr-only"
                                            aria-checked={answers[sq.id] === opt.option_key}
                                            value={opt.option_key}
                                            onChange={() => onAnswer(sq.id, opt.option_key)}
                                        />
                                        <div
                                            className={`mx-auto mb-2 w-4 h-4 rounded-full border flex items-center justify-center ${answers[sq.id] === opt.option_key ? "border-primary bg-primary" : "border-gray-300"}`}
                                            aria-hidden="true"
                                        >
                                            <div className={`w-2 h-2 rounded-full ${answers[sq.id] === opt.option_key ? "bg-white" : "bg-transparent"}`} />
                                        </div>
                                    </label>
                                </td>
                            ))}
                            <td className="pl-3">
                                <button
                                    className="ml-auto opacity-0 group-hover/option:opacity-100"
                                    type="button"
                                    aria-pressed={false}
                                >
                                    <Bookmark className="w-6 h-6 stroke-gray-800 fill-white hover:stroke-primary" strokeWidth={1} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}