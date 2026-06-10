"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

import {
    Check,
    CheckCircle,
    ChevronRight,
    Clock,
    Copy,
    CreditCard,
    FileText,
    Loader2,
    RefreshCw,
    Shield,
    Tag,
    Upload,
    Wallet,
    XCircle,
    Zap,
    AlertTriangle,
} from "lucide-react"

import { billingApi } from "@/lib/api/billing"
import type { Plan, PromoCodeValidateOut } from "@/lib/types/billing"

const PRIMARY = "#6366f1"
const PRIMARY_DARK = "#4f46e5"

const P2P_CARD = {
    number: "6262570000519183",
    formatted: "6262 5700 0051 9183",
    holder: "Abdumutalibov Diyorbek",
    bank: "Agrobank",
}

const intervalLabel: Record<string, string> = {
    daily: "/day",
    monthly: "/month",
    yearly: "/year",
    lifetime: "one-time",
}

const PAYMENT_METHODS = [
    { id: "p2p", name: "P2P Card", icon: "/pay/Uzcard-01.png", description: "Manual transfer", active: true },
    { id: "click", name: "Click", icon: "/pay/Click-01_hjB080W.png", description: "Coming soon", active: false },
    { id: "payme", name: "Payme", icon: "/pay/payme-01.png", description: "Coming soon", active: false },
    { id: "uzum", name: "Uzum Bank", icon: "/pay/uzumbank.png", description: "Coming soon", active: false },
]

const COUNTDOWN_SECONDS = 15 * 60

function formatMoney(value: number) {
    return new Intl.NumberFormat("en-US").format(value)
}

function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0")
    const s = (seconds % 60).toString().padStart(2, "0")
    return `${m}:${s}`
}

// ─── FIX: readAsDataURL "data:image/png;base64,XXX" qaytaradi ────────────────
// Backend faqat "XXX" (toza base64) kutadi → prefix olib tashlanadi
function stripDataURI(dataURI: string): string {
    const idx = dataURI.indexOf("base64,")
    return idx !== -1 ? dataURI.slice(idx + 7) : dataURI
}

// ─── Countdown Timer ──────────────────────────────────────────────────────────
function CountdownTimer() {
    const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS)
    const expired = seconds === 0
    const urgent = seconds <= 3 * 60

    useEffect(() => {
        if (expired) return
        const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000)
        return () => clearInterval(id)
    }, [expired])

    return (
        <div
            className="rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{
                border: `1px solid ${expired ? "#fecaca" : urgent ? "#fde68a" : "#ececf3"}`,
                background: expired ? "#fef2f2" : urgent ? "#fffbeb" : "#fafaff",
            }}
        >
            {expired
                ? <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                : <Clock className="w-4 h-4 shrink-0" style={{ color: urgent ? "#d97706" : PRIMARY }} />
            }
            <div className="flex-1">
                <p className="text-xs font-semibold" style={{ color: expired ? "#dc2626" : urgent ? "#92400e" : "#374151" }}>
                    {expired ? "Time expired — please refresh" : "Complete payment within"}
                </p>
            </div>
            {!expired && (
                <span className="font-black text-base tabular-nums" style={{ color: urgent ? "#dc2626" : PRIMARY_DARK }}>
                    {formatTime(seconds)}
                </span>
            )}
        </div>
    )
}

// ─── Summary Bar ──────────────────────────────────────────────────────────────
function SummaryBar({ plan, promoResult, finalAmount }: {
    plan: Plan
    promoResult: PromoCodeValidateOut | null
    finalAmount: number
}) {
    const boostedPrice = Math.round(plan.price * 1.3)

    return (
        <div
            className="rounded-2xl px-4 py-4 mt-4 grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3 sm:gap-4"
            style={{ border: "1px solid #ececf3", background: "#fff" }}
        >
            {/* Plan */}
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${PRIMARY}12` }}>
                    <Wallet className="w-4 h-4" style={{ color: PRIMARY }} />
                </div>
                <div>
                    <p className="text-[11px] text-gray-400">Plan</p>
                    <p className="font-black text-gray-900 text-sm">{plan.name}</p>
                </div>
            </div>

            <div className="hidden sm:block w-px h-8 bg-gray-100" />

            {/* Original */}
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${PRIMARY}12` }}>
                    <CreditCard className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
                </div>
                <div>
                    <p className="text-[11px] text-gray-400">Original</p>
                    <p className="font-bold text-gray-400 text-sm line-through">{formatMoney(boostedPrice)} {plan.currency}</p>
                </div>
            </div>

            {promoResult?.valid && (
                <>
                    <div className="hidden sm:block w-px h-8 bg-gray-100" />
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-50">
                            <Tag className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-[11px] text-gray-400">Promo</p>
                            <p className="font-bold text-emerald-600 text-sm">
                                {promoResult.discount_percent
                                    ? `−${promoResult.discount_percent}%`
                                    : `−${formatMoney(promoResult.discount_amount)} ${plan.currency}`}
                            </p>
                        </div>
                    </div>
                </>
            )}

            <div className="hidden sm:block w-px h-8 bg-gray-100" />

            {/* Total */}
            <div className="col-span-2 sm:col-span-1">
                <p className="text-[11px] text-gray-400">Total to pay</p>
                <p className="font-black text-xl" style={{ color: PRIMARY_DARK }}>
                    {formatMoney(finalAmount)}
                    <span className="text-sm font-semibold text-gray-400 ml-1">{plan.currency}</span>
                </p>
            </div>
        </div>
    )
}

// ─── Copy Button ──────────────────────────────────────────────────────────────
function CopyButton({ value }: { value: string }) {
    const [copied, setCopied] = useState(false)
    const copy = async () => {
        await navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }
    return (
        <button onClick={copy} className="flex items-center gap-1 text-xs font-semibold transition-all shrink-0" style={{ color: copied ? "#059669" : PRIMARY }}>
            {copied ? <><CheckCircle className="w-3.5 h-3.5" />Copied</> : <><Copy className="w-3.5 h-3.5" />Copy</>}
        </button>
    )
}

// ─── Feature List ─────────────────────────────────────────────────────────────
function resolveFeatureValue(value: unknown): string | null {
    if (value === false || value === null || value === undefined) return null
    if (typeof value === "boolean") return null
    if (typeof value === "string") return value || null
    if (typeof value === "number") return String(value)
    if (Array.isArray(value)) return value.join(", ") || null
    if (typeof value === "object") {
        const obj = value as Record<string, unknown>
        if ("value" in obj && (typeof obj.value === "string" || typeof obj.value === "number"))
            return String(obj.value) || null
        if ("label" in obj && typeof obj.label === "string") return obj.label || null
        if ("text" in obj && typeof obj.text === "string") return obj.text || null
        return null
    }
    return null
}

function FeatureList({ features }: { features?: Record<string, unknown> }) {
    if (!features || typeof features !== "object") return null
    const entries = Object.entries(features).filter(([, v]) => {
        if (v === false || v === null || v === undefined) return false
        if (Array.isArray(v) && v.length === 0) return false
        return true
    })
    if (entries.length === 0) return null
    return (
        <div className="py-4 space-y-3">
            {entries.map(([key, value]) => {
                const label = key.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())
                const displayValue = resolveFeatureValue(value)
                return (
                    <div key={key} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${PRIMARY}15` }}>
                            <Check className="w-3 h-3" style={{ color: PRIMARY }} />
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {label}
                            {displayValue && <span className="font-semibold text-gray-800 ml-1">— {displayValue}</span>}
                        </p>
                    </div>
                )
            })}
        </div>
    )
}

// ─── Shared state ─────────────────────────────────────────────────────────────
interface CheckoutState {
    plan: Plan
    finalAmount: number
    promoCode: string
    setPromoCode: (v: string) => void
    promoResult: PromoCodeValidateOut | null
    setPromoResult: (v: PromoCodeValidateOut | null) => void
    promoLoading: boolean
    promoError: string | null
    validatePromo: () => void
    file: File | null
    setFile: (f: File | null) => void
    fileError: string | null
    setFileError: (e: string | null) => void
    submitLoading: boolean
    submitError: string | null
    submitSuccess: string | null
    submit: () => void
}

// ─── Panel 2: Payment Method ──────────────────────────────────────────────────
function PaymentMethodPanel({ selectedMethod, setSelectedMethod, ctx }: {
    selectedMethod: string
    setSelectedMethod: (id: string) => void
    ctx: CheckoutState
}) {
    const { plan, promoCode, setPromoCode, promoResult, setPromoResult, promoLoading, promoError, validatePromo, finalAmount } = ctx

    return (
        <div className="bg-white rounded-3xl p-5 flex flex-col gap-5" style={{ border: "1px solid #ececf3" }}>
            <div>
                <h2 className="text-lg font-black text-gray-900">Payment Method</h2>
                <p className="text-sm text-gray-500 mt-0.5">Choose payment system</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((method) => (
                    <button
                        key={method.id}
                        onClick={() => method.active && setSelectedMethod(method.id)}
                        className="rounded-2xl p-3 border text-left relative transition-all"
                        style={{
                            borderColor: selectedMethod === method.id ? PRIMARY : "#e5e7eb",
                            background: selectedMethod === method.id ? `${PRIMARY}08` : "#fff",
                            opacity: method.active ? 1 : 0.6,
                            cursor: method.active ? "pointer" : "not-allowed",
                        }}
                    >
                        {!method.active && (
                            <div className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#fef3c7", color: "#92400e" }}>
                                Soon
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-white border border-gray-100 shrink-0">
                                <Image src={method.icon} alt={method.name} fill className="object-contain p-1.5" unoptimized />
                            </div>
                            <div>
                                <h3 className="font-bold text-xs text-gray-800">{method.name}</h3>
                                <p className="text-[11px] text-gray-400 mt-0.5">{method.description}</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {selectedMethod !== "p2p" && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="font-black text-xl text-gray-800">Coming Soon</h3>
                    <p className="text-sm text-gray-500 mt-2">Payment integration in progress</p>
                </div>
            )}

            {selectedMethod === "p2p" && (
                <div className="flex flex-col gap-4">
                    {/* Promo */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                            Promo Code <span className="font-normal text-gray-400">(optional)</span>
                        </label>
                        <div className="flex gap-2">
                            <input
                                value={promoCode}
                                onChange={(e) => { setPromoCode(e.target.value); setPromoResult(null) }}
                                onKeyDown={(e) => e.key === "Enter" && validatePromo()}
                                placeholder="Enter promo code"
                                className="flex-1 h-11 rounded-2xl border border-gray-200 px-4 outline-none focus:border-indigo-500 text-sm min-w-0"
                            />
                            <button
                                onClick={validatePromo}
                                disabled={!promoCode.trim() || promoLoading}
                                className="h-11 px-4 rounded-2xl font-bold text-sm text-white disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                                style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)` }}
                            >
                                {promoLoading
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <><Tag className="w-4 h-4" /><span className="hidden sm:inline">Apply</span></>
                                }
                            </button>
                        </div>
                        {promoResult?.valid && (
                            <div className="mt-2 rounded-xl px-3 py-2.5 bg-emerald-50 text-emerald-700 text-xs font-medium flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 shrink-0" />
                                <span>
                                    {promoResult.discount_percent
                                        ? `${promoResult.discount_percent}% discount`
                                        : `${formatMoney(promoResult.discount_amount)} ${plan.currency} discount`
                                    }{" — "}Final: <strong>{formatMoney(promoResult.final_price)} {plan.currency}</strong>
                                </span>
                            </div>
                        )}
                        {promoError && (
                            <div className="mt-2 rounded-xl px-3 py-2.5 bg-red-50 text-red-700 text-xs font-medium flex items-center gap-2">
                                <XCircle className="w-4 h-4 shrink-0" />{promoError}
                            </div>
                        )}
                    </div>

                    {/* Card visual */}
                    <div className="rounded-3xl p-5 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)` }}>
                        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
                        <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/10" />
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] text-white/70">Bank</p>
                                    <h3 className="text-white font-bold text-sm">{P2P_CARD.bank}</h3>
                                </div>
                                <CreditCard className="w-6 h-6 text-white/60" />
                            </div>
                            <div>
                                <p className="text-[11px] text-white/70 mb-1">Card Number</p>
                                <h2 className="text-base sm:text-lg font-black tracking-widest text-white break-all">{P2P_CARD.formatted}</h2>
                            </div>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-[11px] text-white/70">Holder</p>
                                    <h3 className="text-white font-semibold text-xs">{P2P_CARD.holder}</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-[11px] text-white/70">Amount</p>
                                    {promoResult?.valid && (
                                        <p className="text-white/40 text-[11px] line-through">{formatMoney(plan.price)} {plan.currency}</p>
                                    )}
                                    <h3 className="text-white font-black">{formatMoney(finalAmount)} {plan.currency}</h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Copy row */}
                    <div className="rounded-2xl p-4 flex items-center justify-between gap-3" style={{ border: "1px solid #ececf3" }}>
                        <div className="min-w-0">
                            <p className="text-xs text-gray-400">Card Number</p>
                            <p className="font-mono font-bold text-gray-800 tracking-widest text-sm truncate">{P2P_CARD.formatted}</p>
                        </div>
                        <CopyButton value={P2P_CARD.number} />
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Panel 3: Upload Receipt ──────────────────────────────────────────────────
function CheckFilePanel({ ctx }: { ctx: CheckoutState }) {
    const {
        plan, promoResult, setPromoResult, setPromoCode, finalAmount,
        file, setFile, fileError, setFileError,
        submitLoading, submitError, submitSuccess, submit,
    } = ctx

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf"]
    const maxSize = 10 * 1024 * 1024

    const validateFile = (f: File) => {
        if (!allowedTypes.includes(f.type)) throw new Error("Only PNG, JPG, WEBP and PDF files are allowed")
        if (f.size > maxSize) throw new Error("File size must be smaller than 10MB")
    }

    return (
        <div className="bg-white rounded-3xl p-5 flex flex-col gap-4" style={{ border: "1px solid #ececf3" }}>
            <div>
                <h2 className="text-lg font-black text-gray-900">Upload Receipt</h2>
                <p className="text-sm text-gray-500 mt-0.5">PNG, JPG, WEBP or PDF · max 10MB</p>
            </div>

            <CountdownTimer />

            {promoResult?.valid && (
                <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ border: "1px solid #d1fae5", background: "#f0fdf4" }}>
                    <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-emerald-700 truncate">{promoResult.code} applied</p>
                        <p className="text-xs text-emerald-600">
                            {promoResult.discount_percent
                                ? `${promoResult.discount_percent}% off`
                                : `${formatMoney(promoResult.discount_amount)} ${plan.currency} off`
                            }{" — "}Pay <strong>{formatMoney(promoResult.final_price)} {plan.currency}</strong>
                        </p>
                    </div>
                    <button onClick={() => { setPromoResult(null); setPromoCode("") }} className="text-xs text-emerald-600 underline shrink-0">
                        Remove
                    </button>
                </div>
            )}

            <div className="rounded-2xl p-4 space-y-2.5" style={{ border: "1px solid #ececf3", background: "#fafaff" }}>
                <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4" style={{ color: PRIMARY }} />
                    <p className="text-sm font-bold" style={{ color: PRIMARY_DARK }}>How to pay</p>
                </div>
                {[
                    "Copy the card number from Payment Method",
                    `Send exactly ${formatMoney(finalAmount)} ${plan.currency}`,
                    "Upload your receipt below",
                    "Admin confirms within 24h",
                ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5" style={{ background: `${PRIMARY}15`, color: PRIMARY }}>
                            {i + 1}
                        </div>
                        <p className="text-xs text-gray-600">{item}</p>
                    </div>
                ))}
            </div>

            <label
                className="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all"
                style={{
                    borderColor: file ? PRIMARY : "#e5e7eb",
                    background: file ? `${PRIMARY}08` : "#fff",
                    minHeight: "130px",
                }}
            >
                <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp,.pdf"
                    hidden
                    onChange={(e) => {
                        const selected = e.target.files?.[0]
                        if (!selected) return
                        try {
                            validateFile(selected)
                            setFile(selected)
                            setFileError(null)
                        } catch (e: unknown) {
                            setFile(null)
                            setFileError(e instanceof Error ? e.message : "Invalid file")
                        }
                    }}
                />
                {file ? (
                    <>
                        {file.type === "application/pdf"
                            ? <FileText className="w-8 h-8 mb-2" style={{ color: PRIMARY }} />
                            : <CheckCircle className="w-8 h-8 mb-2" style={{ color: PRIMARY }} />
                        }
                        <h3 className="font-bold break-all text-sm" style={{ color: PRIMARY_DARK }}>{file.name}</h3>
                        <p className="text-xs text-gray-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </>
                ) : (
                    <>
                        <Upload className="w-8 h-8 text-gray-300 mb-2" />
                        <h3 className="font-bold text-gray-700 text-sm">Upload Receipt</h3>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP, PDF</p>
                    </>
                )}
            </label>

            {(fileError || submitError) && (
                <div className="rounded-xl px-4 py-3 bg-red-50 text-red-700 text-sm font-medium flex items-start gap-2">
                    <XCircle className="w-4 h-4 mt-0.5 shrink-0" />{fileError || submitError}
                </div>
            )}
            {submitSuccess && (
                <div className="rounded-xl px-4 py-3 bg-emerald-50 text-emerald-700 text-sm font-medium flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />{submitSuccess}
                </div>
            )}

            <button
                disabled={!file || submitLoading}
                onClick={submit}
                className="w-full h-12 rounded-2xl text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)` }}
            >
                {submitLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Processing...</>
                    : <><CheckCircle className="w-4 h-4" />Submit Payment</>
                }
            </button>
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()

    const slug = (params?.slug as string) || searchParams.get("plan") || ""

    const [plan, setPlan] = useState<Plan | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedMethod, setSelectedMethod] = useState("p2p")
    const [submitted, setSubmitted] = useState(false)

    const [promoCode, setPromoCode] = useState("")
    const [promoResult, setPromoResult] = useState<PromoCodeValidateOut | null>(null)
    const [promoLoading, setPromoLoading] = useState(false)
    const [promoError, setPromoError] = useState<string | null>(null)
    const [file, setFile] = useState<File | null>(null)
    const [fileError, setFileError] = useState<string | null>(null)
    const [submitLoading, setSubmitLoading] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

    useEffect(() => {
        if (!slug) { setLoading(false); return }
        billingApi.getPlan(slug).then(setPlan).finally(() => setLoading(false))
    }, [slug])

    const displayPrice = useMemo(() => plan?.price || 0, [plan])
    const finalAmount = promoResult?.valid ? promoResult.final_price : displayPrice

    const validatePromo = useCallback(async () => {
        if (!plan || !promoCode.trim()) return
        setPromoLoading(true)
        setPromoError(null)
        setPromoResult(null)
        try {
            const result = await billingApi.validatePromo({ code: promoCode.trim(), plan_slug: plan.slug })
            setPromoResult(result)
            if (!result.valid) setPromoError(result.message || "Invalid promo code")
        } catch {
            setPromoError("Could not validate promo code")
        } finally {
            setPromoLoading(false)
        }
    }, [plan, promoCode])

    // FIX 500: readAsDataURL "data:image/png;base64,XXX" qaytaradi
    // Backend SubscriptionRequestCreate.screenshot faqat toza base64 kutadi
    // stripDataURI() prefix "data:...;base64," ni olib tashlaydi
    const fileToBase64 = (f: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(stripDataURI(reader.result as string))
            reader.onerror = () => reject(new Error("File read failed"))
            reader.readAsDataURL(f)
        })

    const submit = useCallback(async () => {
        if (!plan || !file) { setSubmitError("Please upload payment receipt"); return }
        try {
            setSubmitLoading(true)
            setSubmitError(null)
            setSubmitSuccess(null)
            const base64 = await fileToBase64(file)
            await billingApi.createSubscriptionRequest({
                plan_slug: plan.slug,
                screenshot: base64,
                promo_code: promoResult?.valid ? promoCode.trim() : undefined,
                note: "Manual payment confirmation",
            })
            setSubmitSuccess("Payment request submitted successfully")
            setTimeout(() => setSubmitted(true), 1000)
        } catch (e: unknown) {
            setSubmitError(e instanceof Error ? e.message : "Something went wrong")
        } finally {
            setSubmitLoading(false)
        }
    }, [plan, file, promoResult, promoCode])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f5f7fb]">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: PRIMARY }} />
            </div>
        )
    }

    if (!plan) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-black text-gray-900">Plan not found</h1>
                    <p className="text-gray-500 mt-2">Invalid or deleted plan</p>
                </div>
            </div>
        )
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#f5f7fb] p-6 flex items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 text-center" style={{ border: "1px solid #ececf3" }}>
                    <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5" style={{ background: `${PRIMARY}12` }}>
                        <CheckCircle className="w-10 h-10" style={{ color: PRIMARY }} />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900">Payment Submitted</h1>
                    <p className="text-gray-500 mt-3 leading-relaxed">Your payment request is under review. We'll confirm within 24 hours.</p>
                    <button
                        onClick={() => router.push("/billing")}
                        className="w-full h-12 rounded-2xl text-white font-bold mt-6"
                        style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)` }}
                    >
                        Back To Billing
                    </button>
                </div>
            </div>
        )
    }

    const ctx: CheckoutState = {
        plan, finalAmount,
        promoCode, setPromoCode,
        promoResult, setPromoResult,
        promoLoading, promoError, validatePromo,
        file, setFile,
        fileError, setFileError,
        submitLoading, submitError, submitSuccess, submit,
    }

    return (
        <div className="min-h-screen bg-[#f5f7fb] px-4 py-5 sm:px-6 sm:py-7">
            <div className="max-w-7xl mx-auto">

                {/* Breadcrumb */}
                <div className="mb-1">
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                        <Link href="/billing" className="font-medium" style={{ color: PRIMARY }}>Billing</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span>Checkout</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Checkout</h1>
                </div>

                {/* Summary bar */}
                <SummaryBar plan={plan} promoResult={promoResult} finalAmount={finalAmount} />

                {/* 3-col grid — mobile: stacks vertically */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 mt-4 sm:mt-6">
                    <div className="bg-white rounded-3xl p-5 flex flex-col" style={{ border: "1px solid #ececf3" }}>
                        <h2 className="text-lg font-black text-gray-900 mb-4">Order Summary</h2>

                        <div className="flex items-start justify-between pb-4 border-b border-gray-100">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${PRIMARY}12` }}>
                                    <Wallet className="w-5 h-5" style={{ color: PRIMARY }} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm">{plan.name}</h3>
                                    <p className="text-xs text-gray-400 mt-1">{plan.interval} subscription</p>
                                </div>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                                <h3 className="text-xl font-black text-gray-900">{formatMoney(displayPrice)}</h3>
                                <p className="text-xs text-gray-400">{plan.currency} {intervalLabel[plan.interval]}</p>
                            </div>
                        </div>

                        <FeatureList features={plan.features} />

                        <div className="mt-auto pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-500 text-sm">Total</span>
                                <div className="text-right">
                                    <h2 className="text-2xl font-black text-gray-900">{formatMoney(displayPrice)}</h2>
                                    <p className="text-xs text-gray-400">{plan.currency}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 rounded-2xl p-4 flex items-start gap-3" style={{ border: "1px solid #ececf3", background: "#fafaff" }}>
                            <Shield className="w-5 h-5 shrink-0 mt-0.5" style={{ color: PRIMARY }} />
                            <div>
                                <h3 className="font-bold text-sm text-gray-800">Secure Payment</h3>
                                <p className="text-xs text-gray-500 mt-1">All payments are manually verified</p>
                            </div>
                        </div>
                    </div>

                    <PaymentMethodPanel
                        selectedMethod={selectedMethod}
                        setSelectedMethod={setSelectedMethod}
                        ctx={ctx}
                    />

                    <CheckFilePanel ctx={ctx} />
                </div>

                {/* Trust cards — always 3 cols, compact on mobile */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
                    {[
                        { icon: Shield, title: "Secure", desc: "Protected transactions", color: "#6366f1", bg: "#eef2ff" },
                        { icon: Zap, title: "Fast", desc: "Usually within 24h", color: "#f59e0b", bg: "#fffbeb" },
                        { icon: RefreshCw, title: "Refundable", desc: "Money-back guarantee", color: "#10b981", bg: "#ecfdf5" },
                    ].map((item) => (
                        <div
                            key={item.title}
                            className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 flex flex-col items-center text-center gap-2 sm:gap-3"
                            style={{ border: "1px solid #ececf3" }}
                        >
                            <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center" style={{ background: item.bg }}>
                                <item.icon className="w-4 h-4 sm:w-6 sm:h-6" style={{ color: item.color }} />
                            </div>
                            <div>
                                <h3 className="font-black text-xs sm:text-base text-gray-900">{item.title}</h3>
                                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 hidden sm:block">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    )
}