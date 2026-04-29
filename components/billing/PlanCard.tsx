"use client"

import { Check, Zap, Star, Crown } from "lucide-react"
import type { Plan } from "@/lib/types/billing"

interface Props {
    plan: Plan
    isCurrentPlan?: boolean
    onSubscribe: (slug: string) => void
    loading: boolean
}

export default function PlanCard({ plan, isCurrentPlan, onSubscribe, loading }: Props) {
    const features = plan.features as Record<string, string | number> | null

    const formatPrice = (price: number) => {
        if (price === 0) return "Free"
        return new Intl.NumberFormat("en-US").format(price)
    }

    const intervalLabel: Record<string, string> = {
        monthly: "/ mo",
        yearly: "/ yr",
        lifetime: "one-time",
        daily: "/ day",
        weekly: "/ wk",
    }

    const isFeatured = plan.is_featured
    const isFree = plan.price === 0

    return (
        <div className={`
            relative rounded-2xl flex flex-col gap-4 p-5 transition-all duration-200
            ${isCurrentPlan
                ? "bg-white border-2 border-indigo-500 shadow-lg shadow-indigo-100"
                : isFeatured
                    ? "bg-white border-2 border-gray-900 shadow-xl shadow-gray-200"
                    : "bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md shadow-sm"
            }
        `}>
            {/* Badge */}
            <div className="min-h-[20px]">
                {isFeatured && !isCurrentPlan && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wide uppercase bg-gray-900 text-white px-2.5 py-1 rounded-full">
                        <Star className="w-2.5 h-2.5 fill-white" /> Most popular
                    </span>
                )}
                {isCurrentPlan && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wide uppercase bg-indigo-500 text-white px-2.5 py-1 rounded-full">
                        <Check className="w-2.5 h-2.5" /> Current plan
                    </span>
                )}
            </div>

            {/* Name */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    {isFeatured && (
                        <div className="w-5 h-5 rounded bg-gray-900 flex items-center justify-center">
                            <Crown className="w-3 h-3 text-white" />
                        </div>
                    )}
                    <h3 className="text-base font-bold text-gray-900">{plan.name}</h3>
                </div>
                {plan.description && (
                    <p className="text-xs text-gray-500 leading-relaxed">{plan.description}</p>
                )}
            </div>

            {/* Price */}
            <div>
                <div className="flex items-end gap-1">
                    <span className="text-3xl font-extrabold text-gray-900 leading-none">
                        {isFree ? "Free" : formatPrice(plan.price)}
                    </span>
                    {!isFree && (
                        <>
                            <span className="text-sm text-gray-400 mb-0.5">{plan.currency}</span>
                            <span className="text-sm text-gray-400 mb-0.5">{intervalLabel[plan.interval] ?? ""}</span>
                        </>
                    )}
                </div>
                {plan.trial_days > 0 && (
                    <p className="text-xs text-indigo-500 font-medium mt-1.5 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {plan.trial_days}-day free trial
                    </p>
                )}
            </div>

            <div className="border-t border-gray-100" />

            {/* Features */}
            {features && Object.keys(features).length > 0 && (
                <ul className="space-y-2 flex-1">
                    {Object.entries(features).map(([key, value]) => (
                        <li key={key} className="flex items-start gap-2 text-xs">
                            <span className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center
                                ${isCurrentPlan ? "bg-indigo-100 text-indigo-600" : isFeatured ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}>
                                <Check className="w-2.5 h-2.5" />
                            </span>
                            <span className="text-gray-600">
                                {key.replace(/_/g, " ")}
                                {value !== true && value !== "" && (
                                    <>: <strong className="text-gray-800">{String(value)}</strong></>
                                )}
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            {/* CTA */}
            <button
                onClick={() => onSubscribe(plan.slug)}
                disabled={loading || isCurrentPlan}
                className={`
                    w-full py-2.5 rounded-xl font-semibold text-sm transition-all
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${isCurrentPlan
                        ? "bg-indigo-50 text-indigo-500 border border-indigo-200 cursor-default"
                        : isFeatured
                            ? "bg-gray-900 hover:bg-gray-800 text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                    }
                `}
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                            <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Subscribing…
                    </span>
                ) : isCurrentPlan ? (
                    <span className="flex items-center justify-center gap-1.5">
                        <Check className="w-3.5 h-3.5" /> Active plan
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" /> Get started
                    </span>
                )}
            </button>
        </div>
    )
}