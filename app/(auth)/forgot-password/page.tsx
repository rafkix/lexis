'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/api/auth'
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, Mail } from 'lucide-react'

// =====================================================
// 🔧 UTILS
// =====================================================

function getErrorMessage(err: unknown): string {
    if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { detail?: string } } }).response
        if (res?.data?.detail) return res.data.detail
    }
    if (err instanceof Error) return err.message
    return 'Something went wrong. Please try again.'
}

// =====================================================
// 📄 PAGE
// =====================================================

export default function ForgotPasswordPage() {
    const router = useRouter()

    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [sent, setSent] = useState(false)

    const submit = async () => {
        setError(null)
        if (!email.trim()) return setError('Email is requiindigo')
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Enter a valid email address')

        setLoading(true)
        try {
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

    return (
        <div className="relative min-h-screen flex items-center justify-center px-4 bg-white overflow-hidden">

            {/* BACKGROUND */}
            <div
                className="fixed inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.045) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.045) 1px, transparent 1px)
          `,
                    backgroundSize: '42px 42px',
                }}
            />
            <div className="fixed top-[-160px] left-[-160px] w-[480px] h-[480px] rounded-full bg-indigo-500/8 blur-[160px] pointer-events-none z-0" />

            {/* BACK */}
            <button
                onClick={() => router.back()}
                className="absolute top-6 left-6 z-20 flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition text-sm"
            >
                <ArrowLeft size={16} />
                Back
            </button>

            {/* CARD */}
            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-7 sm:p-9">

                    {sent ? (
                        /* ── SUCCESS STATE ── */
                        <div className="text-center py-4">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-50 mb-5">
                                <CheckCircle2 size={28} className="text-green-600" />
                            </div>
                            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Check your email</h1>
                            <p className="text-sm text-gray-500 mt-2 mb-6">
                                We sent a password reset link to{' '}
                                <span className="font-medium text-gray-700">{email}</span>.
                                Check your inbox and follow the instructions.
                            </p>
                            <p className="text-xs text-gray-400 mb-6">
                                Didn&apos;t receive it? Check spam or{' '}
                                <button
                                    onClick={() => { setSent(false); setEmail('') }}
                                    className="text-indigo-500 hover:underline"
                                >
                                    try again
                                </button>
                            </p>
                            <Link
                                href="/login"
                                className="inline-block text-sm text-gray-700 font-medium border border-gray-200 rounded-xl px-6 py-2.5 hover:border-gray-300 transition"
                            >
                                Back to login
                            </Link>
                        </div>
                    ) : (
                        /* ── FORM STATE ── */
                        <>
                            {/* HEADER */}
                            <div className="text-center mb-7">
                                <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-indigo-50 mb-4">
                                    <Mail size={20} className="text-indigo-600" />
                                </div>
                                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Forgot password?</h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    Enter your email and we&apos;ll send you a reset link
                                </p>
                            </div>

                            {/* ERROR */}
                            {error && (
                                <div className="flex items-start gap-2.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl px-4 py-3 mb-5 text-sm">
                                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* INPUT */}
                            <input
                                type="email"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition placeholder:text-gray-400"
                                placeholder="Your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={onKeyDown}
                                autoFocus
                                autoComplete="email"
                            />

                            {/* SUBMIT */}
                            <button
                                onClick={submit}
                                disabled={loading}
                                className="w-full mt-4 bg-gray-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-black transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Sending…
                                    </>
                                ) : (
                                    'Send reset link'
                                )}
                            </button>

                            <p className="text-center text-sm text-gray-500 mt-5">
                                Remember your password?{' '}
                                <Link href="/login" className="text-indigo-600 font-medium hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}