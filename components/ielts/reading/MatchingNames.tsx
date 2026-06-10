"use client";

import { PassageOut } from "@/lib/api/ielts_reading";

interface AnswerMap { [subQuestionId: number]: string; }

interface Props {
    group: PassageOut["question_groups"][0];
    answers: AnswerMap;
    onAnswer: (subId: number, value: string) => void;
}

export function MatchingNames({ group, answers, onAnswer }: Props) {
    const { sub_questions, options } = group;

    return (
        <div className="space-y-3 mt-3">
            {sub_questions.map((sq) => {
                const selected = answers[sq.id] ?? "";
                return (
                    <div key={sq.id} id={`question-${sq.question_number}`} className="flex items-start gap-3">
                        <span className="shrink-0 w-6 text-[13px] font-black text-gray-400 pt-[9px] text-right">
                            {sq.question_number}
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13.5px] text-gray-800 leading-snug mb-1.5">{sq.question_text}</p>
                            <select
                                value={selected}
                                onChange={(e) => onAnswer(sq.id, e.target.value)}
                                className={`w-full text-[13px] border rounded-lg px-3 py-2 outline-none transition-colors appearance-none cursor-pointer
                                    bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_10px_center]
                                    ${selected
                                        ? "border-indigo-300 bg-indigo-50 text-gray-900 focus:border-indigo-400"
                                        : "border-gray-200 bg-gray-50 text-gray-400 focus:border-indigo-400"
                                    }`}
                            >
                                <option value="">— Select a name —</option>
                                {options.map((opt) => (
                                    <option key={opt.option_key} value={opt.option_key}>
                                        {opt.option_key}. {opt.option_text}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}