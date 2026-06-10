"use client";

import { PassageOut } from "@/lib/api/ielts_reading";

interface AnswerMap { [subQuestionId: number]: string; }

interface Props {
    group: PassageOut["question_groups"][0];
    answers: AnswerMap;
    onAnswer: (subId: number, value: string) => void;
}

/**
 * DIAGRAM_LABELLING — shows an image (group.image_url) with
 * numbered inputs below it. Each sub_question is a label to fill in.
 */
export function DiagramLabelling({ group, answers, onAnswer }: Props) {
    const sqs = group.sub_questions;
    const options = group.options;
    const hasOptions = options && options.length > 0;

    return (
        <div className="flex flex-col gap-4 mt-3">
            {/* Diagram image */}
            {group.image_url && (
                <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                    <img
                        src={group.image_url}
                        alt="Diagram"
                        className="w-full object-contain max-h-80"
                    />
                </div>
            )}

            {/* diagram_data fallback */}
            {!group.image_url && group.diagram_data && (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-[13px] text-gray-400">
                    [Diagram]
                </div>
            )}

            {/* Labels */}
            <div className="flex flex-col gap-3">
                {sqs.map((sq) => (
                    <div key={sq.id} className="flex items-center gap-3">
                        <span className="shrink-0 w-6 text-[13px] font-black text-gray-400 text-right">
                            {sq.question_number}
                        </span>

                        {sq.question_text && (
                            <span
                                className="text-[13.5px] text-gray-700 shrink-0"
                                dangerouslySetInnerHTML={{ __html: sq.question_text }}
                            />
                        )}

                        {hasOptions ? (
                            <select
                                value={answers[sq.id] ?? ""}
                                onChange={(e) => onAnswer(sq.id, e.target.value)}
                                className={`flex-1 text-[13px] border rounded-lg px-3 py-2 outline-none transition-colors appearance-none cursor-pointer
                                    bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_10px_center]
                                    ${answers[sq.id]
                                        ? "border-indigo-300 bg-indigo-50 text-gray-900 focus:border-indigo-400"
                                        : "border-gray-200 bg-gray-50 text-gray-400 focus:border-indigo-400"
                                    }`}
                            >
                                <option value="">— Select —</option>
                                {options.map((opt) => (
                                    <option key={opt.option_key} value={opt.option_key}>
                                        {opt.option_key}. {opt.option_text}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                id={`question-${sq.question_number}`}
                                type="text"
                                autoComplete="off"
                                placeholder="Label..."
                                className="flex-1 rounded-lg px-3 py-2 text-[13px] border border-gray-300 bg-white text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-400"
                                value={answers[sq.id] ?? ""}
                                onChange={(e) => onAnswer(sq.id, e.target.value)}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}