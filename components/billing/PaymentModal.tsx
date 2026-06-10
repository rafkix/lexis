"use client"

import { useState } from "react"
import {
    X, Clock, Shield, CheckCircle, Upload,
    Loader2, ChevronRight, Sparkles, Zap, ArrowRight,
} from "lucide-react"
import Image from "next/image"
import type { Plan } from "@/lib/types/billing"
import { billingApi } from "@/lib/api/billing"

interface Props {
    open: boolean
    plan: Plan | null
    onClose: () => void
    onManualRequest?: (planSlug: string) => void
}

// ─── Provider config using real logo images ────────────────────────────────────

const PROVIDERS = [
    {
        id: "click",
        name: "Click",
        tagline: "UzCard & Humo",
        logo: "/pay/Click-01_hjB080W.png",
        accent: "#0D6EFD",
        bg: "#EBF3FF",
        border: "#BFDBFE",
    },
    {
        id: "payme",
        name: "Payme",
        tagline: "All cards",
        logo: "/pay/payme-01.png",
        accent: "#00AC4F",
        bg: "#ECFDF5",
        border: "#A7F3D0",
    },
    {
        id: "uzum",
        name: "Uzum Bank",
        tagline: "Uzum card",
        logo: "/pay/uzumbank.png",
        accent: "#6B21A8",
        bg: "#F5F3FF",
        border: "#DDD6FE",
    },
]

const intervalLabel: Record<string, string> = {
    monthly: "/ month",
    yearly: "/ year",
    lifetime: "one-time",
    daily: "/ day",
    weekly: "/ week",
}

export default function PaymentModal({ open, plan, onClose }: Props) {
    const [tab, setTab] = useState<"online" | "manual">("online")
    const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [dragOver, setDragOver] = useState(false)

    if (!open || !plan) return null

    const formatPrice = (price: number) => new Intl.NumberFormat("en-US").format(price)

    const handleManualSubmit = async () => {
        if (!screenshotFile) return
        setSubmitting(true)
        try {
            const reader = new FileReader()
            reader.onload = async () => {
                const base64 = (reader.result as string).split(",")[1]
                await billingApi.createSubscriptionRequest({
                    plan_slug: plan.slug,
                    screenshot: base64,
                })
                setSubmitted(true)
                setSubmitting(false)
            }
            reader.readAsDataURL(screenshotFile)
        } catch {
            setSubmitting(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file && file.type.startsWith("image/")) setScreenshotFile(file)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div
                className="relative w-full sm:max-w-md bg-white sm:rounded-2xl rounded-t-2xl overflow-hidden"
                style={{
                    boxShadow: "0 -4px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(99,102,241,0.1), 0 0 60px -12px rgba(99,102,241,0.15)",
                }}
            >
                {/* Indigo top accent */}
                <div
                    className="h-[3px] w-full"
                    style={{ background: "linear-gradient(90deg, #6366f1, #818cf8, #4f46e5)" }}
                />

                {submitted ? (
                    /* ── Success State ── */
                    <div className="p-8 flex flex-col items-center gap-5 text-center">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center"
                            style={{
                                background: "rgba(99,102,241,0.08)",
                                border: "1px solid rgba(99,102,241,0.18)",
                                boxShadow: "0 0 24px rgba(99,102,241,0.15)",
                            }}
                        >
                            <CheckCircle className="w-8 h-8" style={{ color: "#6366f1" }} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900 mb-1.5">Request Submitted!</h3>
                            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                                An admin will review your payment screenshot within 24 hours. You'll be notified once it's confirmed.
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
                            style={{
                                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                                boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
                            }}
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {/* ── Header ── */}
                        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-sm font-bold text-gray-900">
                                    {plan.name} — Subscribe
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {formatPrice(plan.price)} {plan.currency}{" "}
                                    {intervalLabel[plan.interval] ?? ""}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* ── Tab Switcher ── */}
                        <div className="flex gap-1 px-5 pt-4 pb-0">
                            {(["online", "manual"] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTab(t)}
                                    className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                                    style={
                                        tab === t
                                            ? {
                                                background: "rgba(99,102,241,0.1)",
                                                color: "#4f46e5",
                                                border: "1.5px solid rgba(99,102,241,0.25)",
                                            }
                                            : {
                                                background: "transparent",
                                                color: "#9ca3af",
                                                border: "1.5px solid transparent",
                                            }
                                    }
                                >
                                    {t === "online" ? "⚡ Online Payment" : "📎 Manual Confirmation"}
                                </button>
                            ))}
                        </div>

                        <div className="px-5 pb-5 pt-4">
                            {/* ── Online Tab ── */}
                            {tab === "online" && (
                                <div className="flex flex-col gap-3">
                                    {/* Fast confirmation badge */}
                                    <div
                                        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
                                        style={{
                                            background: "rgba(99,102,241,0.06)",
                                            border: "1px solid rgba(99,102,241,0.15)",
                                        }}
                                    >
                                        <Zap className="w-4 h-4 flex-shrink-0" style={{ color: "#6366f1" }} />
                                        <p className="text-xs" style={{ color: "#4f46e5" }}>
                                            <strong>Instant activation</strong> — your plan activates within 1 minute after payment
                                        </p>
                                    </div>

                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">
                                        Select payment provider
                                    </p>

                                    <div className="flex flex-col gap-2">
                                        {PROVIDERS.map((p) => (
                                            <div
                                                key={p.id}
                                                className="flex items-center justify-between px-4 py-3 rounded-xl border opacity-50 cursor-not-allowed select-none"
                                                style={{ background: p.bg, borderColor: p.border }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="relative h-6 w-20 flex-shrink-0">
                                                        <Image
                                                            src={p.logo}
                                                            alt={p.name}
                                                            fill
                                                            className="object-contain object-left"
                                                        />
                                                    </div>
                                                    <span className="text-xs text-gray-500">{p.tagline}</span>
                                                </div>
                                                <span
                                                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                                    style={{ background: p.accent + "18", color: p.accent }}
                                                >
                                                    Coming soon
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setTab("manual")}
                                        className="mt-1 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all"
                                        style={{
                                            border: "1.5px solid rgba(99,102,241,0.25)",
                                            background: "rgba(99,102,241,0.06)",
                                            color: "#4f46e5",
                                        }}
                                    >
                                        Use manual confirmation instead <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                            )}

                            {/* ── Manual Tab ── */}
                            {tab === "manual" && (
                                <div className="flex flex-col gap-3">
                                    {/* Steps */}
                                    <div
                                        className="rounded-xl p-3.5"
                                        style={{
                                            background: "rgba(99,102,241,0.05)",
                                            border: "1px solid rgba(99,102,241,0.15)",
                                        }}
                                    >
                                        <p className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: "#4f46e5" }}>
                                            <Sparkles className="w-3.5 h-3.5" /> How it works
                                        </p>
                                        <ol className="space-y-1.5">
                                            {[
                                                "Pay via Click, Payme, or Uzum Bank",
                                                "Take a screenshot of your payment receipt",
                                                "Upload the screenshot below",
                                                "Admin will confirm within 24 hours",
                                            ].map((step, i) => (
                                                <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "#4f46e5" }}>
                                                    <span
                                                        className="flex-shrink-0 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center mt-0.5"
                                                        style={{ background: "rgba(99,102,241,0.15)", color: "#4f46e5" }}
                                                    >
                                                        {i + 1}
                                                    </span>
                                                    <span style={{ color: "#4f46e5", opacity: 0.8 }}>{step}</span>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>

                                    {/* Provider logo badges */}
                                    <div className="flex gap-2">
                                        {PROVIDERS.map((p) => (
                                            <div
                                                key={p.id}
                                                className="flex-1 flex items-center justify-center py-2.5 rounded-lg border"
                                                style={{ background: p.bg, borderColor: p.border }}
                                            >
                                                <div className="relative h-5 w-16">
                                                    <Image
                                                        src={p.logo}
                                                        alt={p.name}
                                                        fill
                                                        className="object-contain"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* File upload zone */}
                                    <label
                                        className="flex flex-col items-center justify-center gap-2.5 py-8 rounded-xl border-2 border-dashed transition-all cursor-pointer"
                                        style={{
                                            borderColor: dragOver
                                                ? "#6366f1"
                                                : screenshotFile
                                                    ? "#6366f1"
                                                    : "#e5e7eb",
                                            background: dragOver || screenshotFile
                                                ? "rgba(99,102,241,0.05)"
                                                : "transparent",
                                        }}
                                        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                                        onDragLeave={() => setDragOver(false)}
                                        onDrop={handleDrop}
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => setScreenshotFile(e.target.files?.[0] ?? null)}
                                        />
                                        {screenshotFile ? (
                                            <>
                                                <div
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                                    style={{ background: "rgba(99,102,241,0.1)" }}
                                                >
                                                    <CheckCircle className="w-5 h-5" style={{ color: "#6366f1" }} />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs font-semibold" style={{ color: "#4f46e5" }}>{screenshotFile.name}</p>
                                                    <p className="text-[10px] text-indigo-400 mt-0.5">
                                                        {(screenshotFile.size / 1024).toFixed(0)} KB • Click to replace
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                                                    <Upload className="w-5 h-5 text-gray-400" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs font-semibold text-gray-600">Drop screenshot here</p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">or click to browse • PNG, JPG, WEBP max 5MB</p>
                                                </div>
                                            </>
                                        )}
                                    </label>

                                    <button
                                        onClick={handleManualSubmit}
                                        disabled={!screenshotFile || submitting}
                                        className="w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                        style={{
                                            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                                            boxShadow: screenshotFile
                                                ? "0 4px 16px rgba(99,102,241,0.45)"
                                                : "none",
                                        }}
                                    >
                                        {submitting ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting…
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                <ChevronRight className="w-3.5 h-3.5" /> Submit for Review
                                            </span>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* ── Footer ── */}
                        <div className="flex items-center justify-center gap-5 border-t border-gray-100 px-5 py-3">
                            {[
                                { icon: Shield, label: "Secure" },
                                { icon: CheckCircle, label: "30-day guarantee" },
                                { icon: Clock, label: "Cancel anytime" },
                            ].map(({ icon: Icon, label }) => (
                                <div key={label} className="flex items-center gap-1.5">
                                    <Icon className="w-3 h-3" style={{ color: "#6366f1" }} />
                                    <span className="text-[11px] text-gray-400 font-medium">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}