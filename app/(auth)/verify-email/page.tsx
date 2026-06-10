'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authApi } from '@/lib/api/auth'
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react'
import Link from 'next/link'

// ─── Inner component uses useSearchParams (must be inside Suspense) ───────────

function VerifyEmailInner() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'missing_token' | 'endpoint_missing'>(
        token ? 'loading' : 'missing_token'
    )
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (!token) return

        let cancelled = false

        const verify = async () => {
            try {
                const res = await authApi.verifyEmail(token)
                if (cancelled) return
                setMessage(res.message)
                setStatus('success')
                // Auto-redirect to login after 3 seconds
                setTimeout(() => {
                    if (!cancelled) router.replace('/login')
                }, 3000)
            } catch (err: any) {
                if (cancelled) return
                const statusCode = err?.response?.status
                if (statusCode === 404) {
                    // The backend endpoint does not exist yet — inform the user gracefully
                    setStatus('endpoint_missing')
                } else {
                    const detail =
                        err?.response?.data?.error?.detail ??
                        err?.response?.data?.detail ??
                        'Verification failed. The link may have expired or already been used.'
                    setMessage(detail)
                    setStatus('error')
                }
            }
        }

        verify()
        return () => { cancelled = true }
    }, [token, router])

    // ─── No token in URL ─────────────────────────────────────────────

    if (status === 'missing_token') {
        return (
            <div className="text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto">
                    <Mail className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Check your email</h1>
                    <p className="text-sm text-gray-500 mt-2">
                        We sent a verification link to your email address.
                        Click the link in the email to verify your account.
                    </p>
                </div>
                <p className="text-xs text-gray-400">
                    Didn&apos;t receive the email?{' '}
                    <button
                        onClick={async () => {
                            try {
                                await authApi.resendVerification()
                                setMessage('Verification email resent!')
                            } catch {
                                setMessage('Could not resend. Please contact support.')
                            }
                        }}
                        className="text-indigo-600 hover:underline font-medium"
                    >
                        Resend
                    </button>
                </p>
                {message && (
                    <p className="text-sm text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2">
                        {message}
                    </p>
                )}
                <Link
                    href="/login"
                    className="inline-block text-sm text-gray-500 hover:text-gray-700 underline"
                >
                    Back to login
                </Link>
            </div>
        )
    }

    // ─── Loading ────────────────────────────────────────────────────

    if (status === 'loading') {
        return (
            <div className="text-center space-y-4">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto" />
                <p className="text-sm text-gray-500">Verifying your email…</p>
            </div>
        )
    }

    // ─── Success ────────────────────────────────────────────────────

    if (status === 'success') {
        return (
            <div className="text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Email verified!</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {message || 'Your account is now active.'}
                    </p>
                </div>
                <p className="text-xs text-gray-400">Redirecting to login…</p>
                <Link
                    href="/login"
                    className="inline-block text-sm font-medium text-indigo-600 hover:underline"
                >
                    Go to login now
                </Link>
            </div>
        )
    }

    // ─── Backend endpoint not implemented yet ────────────────────────

    if (status === 'endpoint_missing') {
        return (
            <div className="text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-yellow-50 border border-yellow-200 flex items-center justify-center mx-auto">
                    <Mail className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Verification pending</h1>
                    <p className="text-sm text-gray-500 mt-2">
                        Email verification is not yet fully configured on this server.
                        Your account may still be active — try logging in.
                    </p>
                </div>
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition"
                >
                    Go to login
                </Link>
            </div>
        )
    }

    // ─── Error ──────────────────────────────────────────────────────

    return (
        <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto">
                <XCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
                <h1 className="text-xl font-bold text-gray-900">Verification failed</h1>
                <p className="text-sm text-gray-500 mt-1">{message}</p>
            </div>
            <div className="flex flex-col items-center gap-2">
                <button
                    onClick={async () => {
                        setStatus('loading')
                        try {
                            await authApi.resendVerification()
                            setStatus('missing_token')
                            setMessage('A new verification email has been sent.')
                        } catch {
                            setMessage('Could not resend. Please try again later.')
                            setStatus('error')
                        }
                    }}
                    className="text-sm text-indigo-600 hover:underline font-medium"
                >
                    Request a new link
                </button>
                <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600">
                    Back to login
                </Link>
            </div>
        </div>
    )
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                <Suspense
                    fallback={
                        <div className="text-center">
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                        </div>
                    }
                >
                    <VerifyEmailInner />
                </Suspense>
            </div>
        </div>
    )
}