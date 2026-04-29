"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import {
    CheckCircle, Clock, XCircle, Upload, X,
    CreditCard, Copy, Check, ChevronRight,
    ImageIcon, AlertCircle, RefreshCw, Zap
} from "lucide-react"
import type { Plan, SubscriptionRequest } from "@/lib/types/billing"
import { billingApi } from "@/lib/api/billing"
import CurrentSubscription from "@/components/billing/CurrentSubscription"
import type { Subscription } from "@/lib/types/billing"

// ─── Card info (configure these) ─────────────────────────────────────────────
const PAYMENT_CARDS = [
    // { bank: "Kapitalbank", number: "8600 1234 5678 9012", holder: "JOHN DOE" },
    { bank: "Uzcard", number: "6262 5700 00051 9183", holder: "DIYORBEK ABDUMUTALIBOV" },
]

// ─── Status config ─────────────────────────────────────────────────────────────
const statusConfig = {
    pending: { icon: Clock, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-100 dark:border-amber-500/20", label: "Under review" },
    approved: { icon: CheckCircle, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-100 dark:border-emerald-500/20", label: "Approved" },
    rejected: { icon: XCircle, color: "text-indigo-500 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-500/10", border: "border-indigo-100 dark:border-indigo-500/20", label: "Rejected" },
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false)
    const copy = () => {
        navigator.clipboard.writeText(text.replace(/\s/g, ""))
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }
    return (
        <button
            onClick={copy}
            className="p-1.5 rounded-lg hover:bg-white/60 dark:hover:bg-white/10 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
    )
}

function CardInfoPanel() {
    return (
        <div className="space-y-3">
            {PAYMENT_CARDS.map((card) => (
                <div
                    key={card.number}
                    className="bg-gradient-to-br from-gray-900 to-gray-700 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-4 text-white"
                >
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">{card.bank}</span>
                        <CreditCard className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="font-mono text-lg font-semibold tracking-widest">{card.number}</span>
                        <CopyButton text={card.number} />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{card.holder}</p>
                </div>
            ))}
        </div>
    )
}

function RequestStatusCard({ req }: { req: SubscriptionRequest }) {
    const cfg = statusConfig[req.status]
    const Icon = cfg.icon
    return (
        <div className={`rounded-2xl border p-5 ${cfg.bg} ${cfg.border}`}>
            <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${cfg.color}`} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</p>
                        <span className="text-[11px] text-gray-400 dark:text-gray-500">
                            {new Date(req.created_at).toLocaleDateString("en-GB", {
                                day: "2-digit", month: "short", year: "numeric",
                            })}
                        </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                        Plan: <strong>{req.plan.name}</strong> — {new Intl.NumberFormat("en-US").format(req.plan.price)} {req.plan.currency}
                    </p>
                    {req.status === "pending" && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Your payment is being reviewed. We'll activate your subscription once confirmed.
                        </p>
                    )}
                    {req.status === "rejected" && req.rejection_reason && (
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                            Reason: {req.rejection_reason}
                        </p>
                    )}
                    {/* Screenshot thumbnail */}
                    <a
                        href={req.screenshot_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        <ImageIcon className="w-3 h-3" /> View screenshot
                    </a>
                </div>
            </div>
        </div>
    )
}

function PlanSelectCard({
    plan,
    selected,
    onClick,
}: {
    plan: Plan
    selected: boolean
    onClick: () => void
}) {
    const intervalLabel: Record<string, string> = {
        monthly: "/ mo", yearly: "/ yr", lifetime: "one-time",
    }
    return (
        <button
            onClick={onClick}
            className={`
                w-full text-left rounded-2xl border-2 p-4 transition-all duration-200
                ${selected
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                    : "border-gray-100 dark:border-white/10 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-white/20"
                }
                ${plan.is_featured && !selected ? "ring-1 ring-blue-200 dark:ring-blue-500/30" : ""}
            `}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${selected ? "border-blue-500 bg-blue-500" : "border-gray-300 dark:border-gray-600"}`}>
                        {selected && <div className="w-full h-full rounded-full flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white rounded-full" /></div>}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{plan.name}</p>
                            {plan.is_featured && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex-shrink-0">Popular</span>
                            )}
                        </div>
                        {plan.description && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{plan.description}</p>
                        )}
                    </div>
                </div>
                <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {plan.price === 0 ? "Free" : `${new Intl.NumberFormat("en-US").format(plan.price)} ${plan.currency}`}
                    </p>
                    <p className="text-[11px] text-gray-400">{intervalLabel[plan.interval]}</p>
                </div>
            </div>
        </button>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SubscriptionPage() {
    const [plans, setPlans] = useState<Plan[]>([])
    const [activeSub, setActiveSub] = useState<Subscription | null>(null)
    const [requests, setRequests] = useState<SubscriptionRequest[]>([])
    const [loading, setLoading] = useState(true)

    // Form state
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
    const [step, setStep] = useState<"plan" | "payment" | "upload">("plan")
    const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
    const [note, setNote] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const load = async () => {
            try {
                const [plansData, subData, reqData] = await Promise.all([
                    billingApi.getPlans(),
                    billingApi.getMySubscription().catch(() => null),
                    billingApi.getMySubscriptionRequests({ page: 1, size: 5 }).catch(() => ({ items: [] })),
                ])
                setPlans(plansData)
                setActiveSub(subData)
                setRequests(reqData.items)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const hasPendingRequest = requests.some((r) => r.status === "pending")

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file")
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be under 5MB")
            return
        }
        setScreenshotFile(file)
        const reader = new FileReader()
        reader.onload = () => setScreenshotPreview(reader.result as string)
        reader.readAsDataURL(file)
    }

    const handleSubmit = async () => {
        if (!selectedPlan || !screenshotFile) return
        setSubmitting(true)
        try {
            // 1. Upload screenshot → get URL
            const uploadedUrl = await billingApi.uploadScreenshot(screenshotFile)

            // 2. Create subscription request
            const req = await billingApi.createSubscriptionRequest({
                plan_slug: selectedPlan.slug,
                screenshot_url: uploadedUrl,
                note: note.trim() || undefined,
            })

            setRequests((prev) => [req, ...prev])
            toast.success("Your request has been submitted! We'll review it shortly.")

            // Reset form
            setStep("plan")
            setSelectedPlan(null)
            setScreenshotFile(null)
            setScreenshotPreview(null)
            setNote("")
        } catch (e: any) {
            toast.error(e?.response?.data?.detail ?? "Something went wrong")
        } finally {
            setSubmitting(false)
        }
    }

    const handleCancelSub = async (reason: string) => {
        const cancelled = await billingApi.cancelSubscription(reason)
        setActiveSub(cancelled)
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-96 gap-3">
                <div className="w-8 h-8 border-[3px] border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-400 dark:text-gray-500">Loading…</p>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">

            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Subscription</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Choose a plan and pay via bank card. We'll activate your account after confirming your payment.
                </p>
            </div>

            {/* Active subscription */}
            {activeSub && ["active", "trial"].includes(activeSub.status) && (
                <section>
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                        Current subscription
                    </p>
                    <CurrentSubscription subscription={activeSub} onCancel={handleCancelSub} />
                </section>
            )}

            {/* Pending request warning */}
            {hasPendingRequest && (
                <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-2xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                        You have a pending request. Please wait for admin review before submitting a new one.
                    </p>
                </div>
            )}

            {/* Request form — hide if there is a pending request */}
            {!hasPendingRequest && (
                <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">

                    {/* Step tabs */}
                    <div className="flex border-b border-gray-100 dark:border-white/10">
                        {(["plan", "payment", "upload"] as const).map((s, i) => {
                            const labels = ["1. Choose plan", "2. Pay", "3. Upload receipt"]
                            const active = step === s
                            const done = (
                                (s === "plan" && (step === "payment" || step === "upload")) ||
                                (s === "payment" && step === "upload")
                            )
                            return (
                                <button
                                    key={s}
                                    onClick={() => {
                                        if (s === "plan") setStep("plan")
                                        if (s === "payment" && selectedPlan) setStep("payment")
                                        if (s === "upload" && selectedPlan) setStep("upload")
                                    }}
                                    className={`
                                        flex-1 py-3 text-xs font-semibold transition-colors
                                        ${active ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-500" : ""}
                                        ${done ? "text-emerald-600 dark:text-emerald-400" : ""}
                                        ${!active && !done ? "text-gray-400 dark:text-gray-500" : ""}
                                    `}
                                >
                                    {done ? <span className="flex items-center justify-center gap-1"><Check className="w-3 h-3" />{labels[i]}</span> : labels[i]}
                                </button>
                            )
                        })}
                    </div>

                    <div className="p-6">

                        {/* Step 1 — Plan selection */}
                        {step === "plan" && (
                            <div className="space-y-3">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    Select the plan you want to subscribe to.
                                </p>
                                {plans.map((plan) => (
                                    <PlanSelectCard
                                        key={plan.id}
                                        plan={plan}
                                        selected={selectedPlan?.id === plan.id}
                                        onClick={() => setSelectedPlan(plan)}
                                    />
                                ))}
                                <button
                                    onClick={() => setStep("payment")}
                                    disabled={!selectedPlan}
                                    className="
                                        w-full mt-2 py-3 rounded-xl font-semibold text-sm
                                        bg-blue-600 hover:bg-blue-700 text-white
                                        disabled:opacity-40 disabled:cursor-not-allowed
                                        transition-colors flex items-center justify-center gap-2
                                    "
                                >
                                    Continue <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* Step 2 — Payment info */}
                        {step === "payment" && selectedPlan && (
                            <div className="space-y-5">
                                {/* Amount due */}
                                <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl px-4 py-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Amount to pay</p>
                                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-0.5">
                                            {new Intl.NumberFormat("en-US").format(selectedPlan.price)}{" "}
                                            <span className="text-base font-semibold">{selectedPlan.currency}</span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Plan</p>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{selectedPlan.name}</p>
                                    </div>
                                </div>

                                {/* Card details */}
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                                        Transfer to one of these cards
                                    </p>
                                    <CardInfoPanel />
                                </div>

                                <div className="bg-gray-50 dark:bg-white/5 rounded-xl px-4 py-3 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                    <p className="font-medium text-gray-800 dark:text-gray-200">Instructions:</p>
                                    <ol className="list-decimal list-inside space-y-1 text-xs">
                                        <li>Transfer the exact amount to one of the cards above</li>
                                        <li>Take a screenshot of the confirmation screen</li>
                                        <li>Upload the screenshot in the next step</li>
                                    </ol>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setStep("plan")}
                                        className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={() => setStep("upload")}
                                        className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                                    >
                                        I've paid <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3 — Upload screenshot */}
                        {step === "upload" && selectedPlan && (
                            <div className="space-y-5">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Upload a screenshot of your payment confirmation.
                                </p>

                                {/* Drop zone */}
                                <div
                                    onClick={() => fileRef.current?.click()}
                                    className={`
                                        relative border-2 border-dashed rounded-2xl cursor-pointer transition-colors
                                        ${screenshotPreview
                                            ? "border-emerald-300 dark:border-emerald-500/40"
                                            : "border-gray-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/40"
                                        }
                                    `}
                                >
                                    {screenshotPreview ? (
                                        <div className="relative">
                                            <img
                                                src={screenshotPreview}
                                                alt="Payment screenshot"
                                                className="w-full max-h-64 object-contain rounded-2xl"
                                            />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setScreenshotFile(null)
                                                    setScreenshotPreview(null)
                                                }}
                                                className="absolute top-2 right-2 p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow text-gray-500 hover:text-indigo-500 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-10 gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                                                <Upload className="w-5 h-5 text-blue-500" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Click to upload screenshot
                                                </p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                    PNG, JPG or WEBP · Max 5MB
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </div>

                                {/* Note */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                                        Note <span className="text-gray-300 dark:text-gray-600">(optional)</span>
                                    </label>
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="e.g. Transferred from Kapitalbank on 24 Apr"
                                        rows={2}
                                        className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-gray-200 placeholder:text-gray-300 dark:placeholder:text-gray-600 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500/40"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setStep("payment")}
                                        className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!screenshotFile || submitting}
                                        className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                                                    <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Submitting…
                                            </>
                                        ) : (
                                            <>
                                                <Zap className="w-4 h-4" /> Submit request
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Past requests */}
            {requests.length > 0 && (
                <section>
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                        Payment requests
                    </p>
                    <div className="space-y-3">
                        {requests.map((req) => (
                            <RequestStatusCard key={req.id} req={req} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}