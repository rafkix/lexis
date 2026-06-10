"use client"

import { useState } from "react"
import { X, CheckCircle, AlertCircle } from "lucide-react"

// ─── Constants ────────────────────────────────────────────────────────────────
const IND5 = "#6366f1"
const IND6 = "#4f46e5"

interface Props {
    open: boolean
    onClose: () => void
    onConfirm: (reason: string) => Promise<void>
}

const QUICK_REASONS = [
    "Too expensive",
    "I rarely use it",
    "Missing features I need",
    "Found a better alternative",
    "Technical issues",
]

export default function CancelModal({ open, onClose, onConfirm }: Props) {
    const [reason, setReason] = useState("")
    const [loading, setLoading] = useState(false)

    if (!open) return null

    const handleConfirm = async () => {
        setLoading(true)
        try {
            await onConfirm(reason)
            onClose()
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

            <div
                className="relative w-full max-w-sm bg-white rounded-2xl overflow-hidden"
                style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)" }}
            >
                <div
                    className="h-[3px] w-full"
                    style={{ background: `linear-gradient(90deg, ${IND5}, #818cf8, ${IND6})` }}
                />

                <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{
                                    background: `${IND5}14`,
                                    border: `1px solid ${IND5}2e`,
                                }}
                            >
                                <AlertCircle className="w-4 h-4" style={{ color: IND5 }} />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-gray-900">Cancel Subscription</h2>
                                <p className="text-[11px] text-gray-400 mt-0.5">We're sorry to see you go</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Notice */}
                    <div
                        className="rounded-xl px-4 py-3 mb-4"
                        style={{
                            background: `${IND5}0a`,
                            border: `1px solid ${IND5}26`,
                        }}
                    >
                        <div className="flex items-start gap-2.5">
                            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: IND5 }} />
                            <p className="text-xs leading-relaxed" style={{ color: IND6 }}>
                                You'll keep full access until the end of the current billing period. No further charges will be made.
                            </p>
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="mb-3">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Reason <span className="font-normal normal-case">(optional)</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {QUICK_REASONS.map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setReason(reason === r ? "" : r)}
                                    className="text-[11px] px-2.5 py-1 rounded-full border transition-all"
                                    style={
                                        reason === r
                                            ? {
                                                background: `${IND5}1a`,
                                                borderColor: `${IND5}59`,
                                                color: IND6,
                                                fontWeight: 600,
                                            }
                                            : {
                                                background: "#f9fafb",
                                                borderColor: "#e5e7eb",
                                                color: "#6b7280",
                                            }
                                    }
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Or write your own reason..."
                            rows={2}
                            className="w-full border bg-gray-50 text-gray-800 placeholder:text-gray-300 rounded-xl px-3 py-2.5 text-xs resize-none transition-all focus:outline-none"
                            style={{ borderColor: "#e5e7eb" }}
                            onFocus={(e) => (e.target.style.borderColor = IND5)}
                            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-all"
                        >
                            Keep Plan
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={loading}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: `linear-gradient(135deg, ${IND5}, ${IND6})` }}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                                        <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Cancelling…
                                </span>
                            ) : "Yes, Cancel"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
