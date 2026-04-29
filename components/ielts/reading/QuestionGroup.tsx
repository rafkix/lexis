"use client";

import { ReadingPartOut } from "@/lib/api/ielts_reading";
import { MatchingInformation } from "./MatchingInformation";
import { MatchingHeadings } from "./MatchingHeadings";
import { TrueFalseNotGiven } from "./TrueFalseNotGiven";
import { MultipleChoice } from "./MultipleChoice";
import { InlineCompletion } from "./InlineCompletion";
import { SummaryCompletionDragDrop } from "./SummaryCompletionDragDrop";

interface AnswerMap { [subQuestionId: number]: string; }

interface Props {
    group: ReadingPartOut["question_groups"][0];
    answers: AnswerMap;
    onAnswer: (subId: number, value: string) => void;
}

function getRange(group: ReadingPartOut["question_groups"][0]) {
    const sqs = group.sub_questions;
    if (!sqs.length) return "";
    if (sqs.length === 1) return `Question ${sqs[0].question_number}`;
    return `Questions ${sqs[0].question_number}–${sqs[sqs.length - 1].question_number}`;
}

export function QuestionGroup({ group, answers, onAnswer }: Props) {
    const { type } = group;

    return (
        <div className="group mb-4">
            <div className="flex flex-col gap-y-10 text-black">

                {/* MATCHING_INFORMATION */}
                {type === "MATCHING_INFORMATION" && (
                    <div className="group">
                        <div className="flex flex-col">
                            <h3>{getRange(group)}</h3>
                            {group.instruction && (
                                <div dangerouslySetInnerHTML={{ __html: group.instruction }} />
                            )}
                            <MatchingInformation group={group} answers={answers} onAnswer={onAnswer} />
                        </div>
                        <span className="group-hover:block absolute bottom-0 right-0" />
                    </div>
                )}

                {/* MATCHING_HEADINGS */}
                {type === "MATCHING_HEADINGS" && (
                    <MatchingHeadings group={group} answers={answers} onAnswer={onAnswer} />
                )}

                {/* YES_NO_NOT_GIVEN */}
                {type === "YES_NO_NOT_GIVEN" && (
                    <div className="group">
                        <div>
                            <h3>{getRange(group)}</h3>
                            <div className="flex flex-col">
                                {group.instruction && (
                                    <div className="my-2" dangerouslySetInnerHTML={{ __html: group.instruction }} />
                                )}
                                <TrueFalseNotGiven group={group} answers={answers} onAnswer={onAnswer} isTrueFalse={false} />
                            </div>
                        </div>
                        <span className="group-hover:block absolute bottom-0 right-0" />
                    </div>
                )}

                {/* TRUE_FALSE_NOT_GIVEN */}
                {type === "TRUE_FALSE_NOT_GIVEN" && (
                    <div className="group">
                        <div>
                            <h3>{getRange(group)}</h3>
                            <div className="flex flex-col">
                                {group.instruction && (
                                    <div className="my-2" dangerouslySetInnerHTML={{ __html: group.instruction }} />
                                )}
                                <TrueFalseNotGiven group={group} answers={answers} onAnswer={onAnswer} isTrueFalse={true} />
                            </div>
                        </div>
                        <span className="group-hover:block absolute bottom-0 right-0" />
                    </div>
                )}

                {/* MULTIPLE_CHOICE */}
                {type === "MULTIPLE_CHOICE" && (
                    <div className="group">
                        <div>
                            <h3>{getRange(group)}</h3>
                            <div className="flex flex-col">
                                {group.instruction && (
                                    <div className="my-2" dangerouslySetInnerHTML={{ __html: group.instruction }} />
                                )}
                                {group.question_text && (
                                    <div className="my-2">  
                                    </div>
                                )}
                                <MultipleChoice group={group} answers={answers} onAnswer={onAnswer} />
                            </div>
                        </div>
                        <span className="group-hover:block absolute bottom-0 right-0" />
                    </div>
                )}

                {/* SUMMARY_COMPLETION */}
                {type === "SUMMARY_COMPLETION" && (
                    <div className="group">
                        <div>
                            <h3 className="mb-2">{getRange(group)}</h3>
                            <div className="flex flex-col">
                                {group.instruction && (
                                    <div className="my-3" dangerouslySetInnerHTML={{ __html: group.instruction }} />
                                )}
                                <InlineCompletion group={group} answers={answers} onAnswer={onAnswer} />
                            </div>
                        </div>
                        <span className="group-hover:block absolute bottom-0 right-0" />
                    </div>
                )}

                {/* SENTENCE_COMPLETION */}
                {type === "SENTENCE_COMPLETION" && (
                    <div className="group">
                        <div>
                            <h3 className="mb-2">{getRange(group)}</h3>
                            <div className="flex flex-col">
                                {group.instruction && (
                                    <div className="my-3" dangerouslySetInnerHTML={{ __html: group.instruction }} />
                                )}
                                <InlineCompletion group={group} answers={answers} onAnswer={onAnswer} />
                            </div>
                        </div>
                        <span className="group-hover:block absolute bottom-0 right-0" />
                    </div>
                )}

                {/* SUMMARY_COMPLETION_DRAG_DROP */}
                {type === "SUMMARY_COMPLETION_DRAG_DROP" && (
                    <SummaryCompletionDragDrop group={group} answers={answers} onAnswer={onAnswer} />
                )}

            </div>
        </div>
    );
}