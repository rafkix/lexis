"use client"

import { useState } from "react"
import { AlertTriangle, X } from "lucide-react"

interface Props {
    open: boolean
    onClose: () => void
    onConfirm: (reason: string) => Promise<void>
}

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
            <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="h-1 w-full bg-indigo-600" />

                <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                                <AlertTriangle className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-gray-900">Cancel subscription</h2>
                                <p className="text-[11px] text-gray-400 mt-0.5">This action cannot be undone</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5 mb-4">
                        <p className="text-xs text-amber-700 leading-relaxed">
                            You'll keep access until the end of your current billing period.
                        </p>
                    </div>

                    <label className="block mb-3">
                        <span className="text-xs font-medium text-gray-500 block mb-1.5">
                            Reason <span className="text-gray-300">(optional)</span>
                        </span>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Tell us why you're leaving..."
                            rows={3}
                            className="w-full border border-gray-200 bg-gray-50 text-gray-800 placeholder:text-gray-300 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition"
                        />
                    </label>

                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                        >
                            Keep subscription
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={loading}
                            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                                        <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Cancelling…
                                </span>
                            ) : "Yes, cancel"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}