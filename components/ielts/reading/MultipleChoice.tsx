"use client";

import { Bookmark } from "lucide-react";
import { ReadingPartOut } from "@/lib/api/ielts_reading";

interface AnswerMap { [subQuestionId: number]: string; }

interface Props {
    group: ReadingPartOut["question_groups"][0];
    answers: AnswerMap;
    onAnswer: (subId: number, value: string) => void;
}

export function MultipleChoice({ group, answers, onAnswer }: Props) {
    const sqs = group.sub_questions;
    const options = group.options;

    return (
        <div className="flex flex-col gap-5">
            {sqs.map((sq) => (
                <div key={sq.id} className="mb-3 p-1 rounded group/option">
                    <div className="flex mb-2 gap-2 items-start">
                        <div className="question-card transition">
                            <span
                                id={`question-${sq.question_number}`}
                                className="bg-transparent rounded-sm size-7 flex items-center justify-center font-bold border scroll-mt-24"
                            >
                                {sq.question_number}
                            </span>
                        </div>
                        {sq.question_text && (
                            <div dangerouslySetInnerHTML={{ __html: sq.question_text }} />
                        )}
                        <button className="ml-auto opacity-0 group-hover/option:opacity-100">
                            <Bookmark className="w-6 h-6 stroke-gray-800 fill-white hover:stroke-primary" strokeWidth={1} />
                        </button>
                    </div>

                    <div role="radiogroup" className="grid gap-0 mt-2" tabIndex={0}>
                        {options.map((opt) => (
                            <div key={opt.id} className="flex items-center">
                                <label
                                    className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-normal w-full pl-4 flex gap-2 items-center transition-all duration-200 py-3 cursor-pointer rounded text-base bg-transparent hover:bg-[rgba(0,0,0,0.05)]"
                                    htmlFor={`mc-${sq.id}-${opt.option_key}-${sq.question_number}`}
                                >
                                    <button
                                        type="button"
                                        role="radio"
                                        aria-checked={answers[sq.id] === opt.option_key}
                                        data-state={answers[sq.id] === opt.option_key ? "checked" : "unchecked"}
                                        value={opt.option_key}
                                        id={`mc-${sq.id}-${opt.option_key}-${sq.question_number}`}
                                        onClick={() => onAnswer(sq.id, opt.option_key)}
                                        className={`aspect-square h-4 w-4 rounded-full border text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
                      ${answers[sq.id] === opt.option_key ? "border-primary bg-primary" : "border-primary"}`}
                                    >
                                        {answers[sq.id] === opt.option_key && (
                                            <span className="flex items-center justify-center w-full h-full">
                                                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                            </span>
                                        )}
                                    </button>
                                    <span>{opt.option_text}</span>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}