"use client"

import { useMemo, useState } from "react"
import {
    Check,
    Zap,
    Star,
    Crown,
    Tag,
    X,
    ChevronRight,
    Loader2,
} from "lucide-react"

import type { Plan } from "@/lib/types/billing"
import { billingApi } from "@/lib/api/billing"

const IND5 = "#6366f1"
const IND6 = "#4f46e5"

type FeatureValue =
    | string
    | number
    | boolean
    | {
        value?: string | number | boolean
    }

type PlanFeatures = Record<string, FeatureValue>

interface Props {
    plan: Plan
    index?: number
    isCurrentPlan?: boolean
    onSubscribe: (slug: string, promoCode?: string) => void
    loading: boolean
}

export default function PlanCard({
    plan,
    index = 0,
    isCurrentPlan,
    onSubscribe,
    loading,
}: Props) {
    const [promoCode, setPromoCode] = useState("")
    const [promoOpen, setPromoOpen] = useState(false)
    const [promoLoading, setPromoLoading] = useState(false)

    const [promoResult, setPromoResult] = useState<{
        valid: boolean
        message: string
        discountPercent?: number
    } | null>(null)

    const [appliedPromo, setAppliedPromo] = useState<string | null>(null)

    const features = plan.features as PlanFeatures | null

    const isFeatured = plan.is_featured
    const isFree = plan.price <= 0

    const formatPrice = (price: number) =>
        new Intl.NumberFormat("en-US").format(Math.round(price))

    const intervalLabel: Record<string, string> = {
        monthly: "/ month",
        yearly: "/ year",
        weekly: "/ week",
        daily: "/ day",
        lifetime: "lifetime",
    }

    /**
     * Backend price = already discounted price
     * Fake compare price (+30%)
     */
    const originalPrice = useMemo(() => {
        if (isFree) return 0
        return Math.round(plan.price * 1.3)
    }, [plan.price, isFree])

    /**
     * Promo discounted price
     */
    const finalPrice = useMemo(() => {
        if (!promoResult?.discountPercent) return plan.price

        return Math.max(
            0,
            plan.price * (1 - promoResult.discountPercent / 100)
        )
    }, [plan.price, promoResult])

    const validatePromo = async () => {
        if (!promoCode.trim()) return

        try {
            setPromoLoading(true)
            setPromoResult(null)

            const result = await billingApi.validatePromo({
                code: promoCode.trim(),
                plan_slug: plan.slug,
            })

            if (!result.valid) {
                setPromoResult({
                    valid: false,
                    message:
                        result.message || "Invalid or expired promo code",
                })

                return
            }

            const percent =
                result.discount_percent ??
                Math.round(
                    (result.discount_amount / result.original_price) * 100
                )

            setPromoResult({
                valid: true,
                message: result.message || "Promo code applied",
                discountPercent: percent,
            })

            setAppliedPromo(result.code)
        } catch {
            setPromoResult({
                valid: false,
                message: "Invalid or expired promo code",
            })
        } finally {
            setPromoLoading(false)
        }
    }

    const removePromo = () => {
        setAppliedPromo(null)
        setPromoResult(null)
        setPromoCode("")
        setPromoOpen(false)
    }

    const handleSubscribe = () => {
        if (isCurrentPlan || isFree) return
        onSubscribe(plan.slug, appliedPromo ?? undefined)
    }

    return (
        <div
            className="relative flex flex-col rounded-3xl overflow-hidden bg-white transition-all duration-300"
            style={{
                border:
                    isFeatured || isCurrentPlan
                        ? `2px solid ${IND5}`
                        : "1px solid #e5e7eb",

                boxShadow: isFeatured
                    ? "0 20px 60px rgba(99,102,241,0.15)"
                    : "0 4px 20px rgba(0,0,0,0.05)",

                animationDelay: `${index * 70}ms`,
            }}
        >
            {(isFeatured || isCurrentPlan) && (
                <div
                    className="h-1 w-full"
                    style={{
                        background: `linear-gradient(90deg, ${IND5}, #818cf8, ${IND6})`,
                    }}
                />
            )}

            <div className="p-6 flex flex-col gap-6 flex-1">

                {/* BADGES */}

                <div className="flex items-center gap-2 min-h-[24px]">
                    {isFeatured && !isCurrentPlan && (
                        <span
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide text-white"
                            style={{ background: IND5 }}
                        >
                            <Star className="w-3 h-3 fill-white" />
                            Most Popular
                        </span>
                    )}

                    {isCurrentPlan && (
                        <span
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide text-white"
                            style={{ background: IND5 }}
                        >
                            <Check className="w-3 h-3" />
                            Active Plan
                        </span>
                    )}

                    {isFree && !isCurrentPlan && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700">
                            <Zap className="w-3 h-3" />
                            Free Forever
                        </span>
                    )}
                </div>

                {/* HEADER */}

                <div>
                    <div className="flex items-center gap-3 mb-2">
                        {isFeatured && (
                            <div
                                className="w-8 h-8 rounded-xl flex items-center justify-center"
                                style={{ background: IND5 }}
                            >
                                <Crown className="w-4 h-4 text-white" />
                            </div>
                        )}

                        <h3 className="text-xl font-bold text-gray-900">
                            {plan.name}
                        </h3>
                    </div>

                    {plan.description && (
                        <p className="text-sm leading-relaxed text-gray-500">
                            {plan.description}
                        </p>
                    )}
                </div>

                {/* PRICE */}

                <div className="flex flex-col gap-1">
                    {isFree ? (
                        <>
                            <div className="text-4xl font-black text-gray-900">
                                Free
                            </div>

                            <p className="text-sm text-emerald-600 font-medium">
                                Always active by default
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-400 line-through">
                                    {formatPrice(originalPrice)}{" "}
                                    {plan.currency}
                                </span>

                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">
                                    SAVE 30%
                                </span>
                            </div>

                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-black text-gray-900">
                                    {formatPrice(finalPrice)}
                                </span>

                                <span className="text-sm text-gray-400 mb-1">
                                    {plan.currency}{" "}
                                    {intervalLabel[plan.interval] ?? ""}
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {/* FEATURES */}

                {features && Object.keys(features).length > 0 && (
                    <ul className="space-y-3 flex-1">
                        {Object.entries(features).map(([key, value]) => {
                            const featureValue =
                                typeof value === "object" &&
                                    value !== null &&
                                    "value" in value
                                    ? value.value
                                    : value

                            return (
                                <li
                                    key={key}
                                    className="flex items-start gap-3"
                                >
                                    <div
                                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                                        style={{
                                            background: `${IND5}15`,
                                            color: IND5,
                                        }}
                                    >
                                        <Check className="w-3 h-3" />
                                    </div>

                                    <span className="text-sm text-gray-600">
                                        {key.replace(/_/g, " ")}

                                        {featureValue !== true &&
                                            featureValue !== undefined &&
                                            featureValue !== "" && (
                                                <>
                                                    :{" "}
                                                    <strong className="text-gray-800">
                                                        {String(featureValue)}
                                                    </strong>
                                                </>
                                            )}
                                    </span>
                                </li>
                            )
                        })}
                    </ul>
                )}

                {/* PROMO */}

                {!isFree && !isCurrentPlan && (
                    <div className="space-y-2">
                        {!promoOpen && !appliedPromo ? (
                            <button
                                onClick={() => setPromoOpen(true)}
                                className="flex items-center gap-2 text-sm font-medium transition-colors"
                                style={{ color: IND5 }}
                            >
                                <Tag className="w-4 h-4" />
                                I have a promo code
                            </button>
                        ) : appliedPromo ? (
                            <div
                                className="flex items-center justify-between rounded-2xl px-3 py-2"
                                style={{
                                    background: `${IND5}10`,
                                    border: `1px solid ${IND5}30`,
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <Tag
                                        className="w-4 h-4"
                                        style={{ color: IND5 }}
                                    />

                                    <span
                                        className="text-sm font-semibold"
                                        style={{ color: IND6 }}
                                    >
                                        {appliedPromo}
                                    </span>

                                    {promoResult?.discountPercent && (
                                        <span
                                            className="px-2 py-1 rounded-full text-[10px] font-bold text-white"
                                            style={{ background: IND5 }}
                                        >
                                            -
                                            {
                                                promoResult.discountPercent
                                            }
                                            %
                                        </span>
                                    )}
                                </div>

                                <button
                                    onClick={removePromo}
                                    className="text-gray-400 hover:text-gray-700 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <input
                                        value={promoCode}
                                        onChange={(e) =>
                                            setPromoCode(
                                                e.target.value.toUpperCase()
                                            )
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                validatePromo()
                                            }
                                        }}
                                        placeholder="PROMO25"
                                        className="flex-1 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 transition-all"
                                    />

                                    <button
                                        onClick={validatePromo}
                                        disabled={
                                            promoLoading ||
                                            !promoCode.trim()
                                        }
                                        className="px-4 rounded-2xl text-white disabled:opacity-50"
                                        style={{
                                            background: IND5,
                                        }}
                                    >
                                        {promoLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>

                                {promoResult && (
                                    <p
                                        className={`text-xs font-medium ${promoResult.valid
                                                ? "text-emerald-600"
                                                : "text-red-500"
                                            }`}
                                    >
                                        {promoResult.message}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* CTA */}

                {isFree ? (
                    <div
                        className="w-full py-3 rounded-2xl text-sm font-semibold text-center"
                        style={{
                            background: "#ecfdf5",
                            color: "#047857",
                            border: "1px solid #a7f3d0",
                        }}
                    >
                        Active by Default
                    </div>
                ) : (
                    <button
                        onClick={handleSubscribe}
                        disabled={loading || isCurrentPlan}
                        className="w-full py-3 rounded-2xl text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{
                            background: isCurrentPlan
                                ? `${IND5}12`
                                : `linear-gradient(135deg, ${IND5}, ${IND6})`,
                            color: isCurrentPlan ? IND5 : "#fff",
                        }}
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                {isCurrentPlan ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <Zap className="w-4 h-4" />
                                )}

                                {isCurrentPlan
                                    ? "Current Plan"
                                    : "Upgrade Plan"}
                            </span>
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}