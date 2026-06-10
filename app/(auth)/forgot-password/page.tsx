'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/api/auth'

function getErrorMessage(err: unknown): string {
    if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { detail?: string } } }).response
        if (res?.data?.detail) return res.data.detail
    }
    if (err instanceof Error) return err.message
    return 'Something went wrong. Please try again.'
}

export default function ForgotPasswordPage() {
    const router = useRouter()

    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [sent, setSent] = useState(false)

    const submit = async () => {
        setError(null)
        // FIX: was 'Email is requiindigo' (typo)
        if (!email.trim()) return setError('Email is required')
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Enter a valid email address')

        setLoading(true)
        try {
            // POST /auth/password/forgot  (fixed endpoint)
            await authApi.forgotPassword(email.trim())
            setSent(true)
        } catch (err) {
            setError(getErrorMessage(err))
        } finally {
            setLoading(false)
        }
    }

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !loading) submit()
    }

    if (sent) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-[#eef0f8]">
                <div className="w-full max-w-[430px] bg-white rounded-3xl p-8 shadow-xl text-center space-y-5">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <path d="M4 12l5 5L20 7" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Check your inbox</h2>
                    <p className="text-sm text-gray-500">
                        If <strong>{email}</strong> is registered, you'll receive a reset link shortly.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block mt-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                        ← Back to login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-[#eef0f8] relative overflow-hidden">

            {/* Grid bg */}
            <div
                className="fixed inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage: 'linear-gradient(rgba(99,111,240,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(99,111,240,.07) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }}
            />
            {/* Blobs */}
            <div className="fixed top-[-80px] right-[-80px] w-80 h-80 rounded-full bg-indigo-200/40 z-0" />
            <div className="fixed bottom-5 left-[-60px] w-52 h-52 rounded-full bg-indigo-200/28 z-0" />

            {/* Back */}
            <button
                className="fixed top-5 left-5 z-20 flex items-center gap-1.5 text-xs text-gray-400 hover:text-indigo-600 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition-all"
                onClick={() => router.back()}
            >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 3L5 8l5 5" />
                </svg>
                Back
            </button>

            {/* Card */}
            <div className="w-full max-w-[430px] bg-white rounded-3xl px-8 py-9 relative z-10 shadow-[0_0_0_1px_rgba(90,99,240,.08),0_12px_28px_rgba(90,99,240,.11)]">

                {/* Header */}
                <div className="flex flex-col items-center gap-3 mb-7">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center shadow-[0_4px_14px_rgba(99,102,241,.18)]">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                            <rect x="2" y="4" width="20" height="16" rx="2" stroke="#6366f1" strokeWidth="1.8" />
                            <path d="M2 8l10 7 10-7" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div className="text-center">
                        <h1 className="text-xl font-bold text-gray-900">Forgot your password?</h1>
                        <p className="text-sm text-gray-400 mt-1">Enter your email and we'll send a reset link.</p>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-start gap-2 bg-indigo-50 border border-indigo-200/50 rounded-xl px-3.5 py-3 mb-5">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#4338ca" strokeWidth="1.6" strokeLinecap="round" className="shrink-0 mt-0.5">
                            <circle cx="8" cy="8" r="6" />
                            <path d="M8 5v3M8 10.5v.5" />
                        </svg>
                        <span className="text-xs text-indigo-700">{error}</span>
                    </div>
                )}

                {/* Field */}
                <div className="mb-5" onKeyDown={onKeyDown}>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                        Email address
                    </label>
                    <div className="relative">
                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                            <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" />
                            <path d="M1.5 6l6.5 4 6.5-4" />
                        </svg>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            autoFocus
                            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 bg-gray-50 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:bg-white transition-all placeholder:text-gray-300"
                        />
                    </div>
                </div>

                {/* Submit */}
                <button
                    onClick={submit}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-lg shadow-indigo-200 hover:-translate-y-0.5 hover:shadow-indigo-300 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2">
                                <circle cx="8" cy="8" r="6" />
                                <path d="M8 2a6 6 0 016 6" stroke="white" strokeLinecap="round" />
                            </svg>
                            Sending…
                        </>
                    ) : (
                        <>
                            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                                <path d="M3 8h10M9 4l4 4-4 4" />
                            </svg>
                            Send reset link
                        </>
                    )}
                </button>

                <p className="text-center text-sm text-gray-400 mt-5">
                    Remember it?{' '}
                    <Link href="/login" className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}