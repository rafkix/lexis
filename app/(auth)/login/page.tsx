'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/api/auth'
import { useAuth } from '@/lib/AuthContext'
import { GoogleSignInButton } from '@/components/auth/social-auth/auth-buttons-google'
import { TelegramSignIn } from '@/components/auth/social-auth/auth-buttons-telegram'
import { Eye, EyeOff, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

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
// 🎨 SHARED INPUT CLASS
// =====================================================

const inputClass =
    'w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none ' +
    'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition placeholder:text-gray-400'

// =====================================================
// 📄 PAGE
// =====================================================

export default function LoginPage() {
    const router = useRouter()
    const { refresh } = useAuth()

    const [identifier, setIdentifier] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const searchParams = useSearchParams()
    const redirectFromQuery = searchParams.get('redirect')

    const redirectFromStorage =
        typeof window !== 'undefined'
            ? sessionStorage.getItem('redirect_after_login')
            : null

    const redirect = redirectFromQuery || redirectFromStorage
    const [redirectPath, setRedirectPath] = useState<string | null>(null)

    // =====================================================
    // 🚀 SUBMIT
    // =====================================================
    useEffect(() => {
        if (redirect && !redirectPath) {
            setRedirectPath(redirect)
        }
    }, [redirect, redirectPath])

    const login = async () => {
        setError(null)

        if (!identifier.trim()) {
            return setError('Email, username or phone is required')
        }

        if (!password) {
            return setError('Password is required')
        }

        setLoading(true)

        try {
            await authApi.login(identifier.trim(), password)
            await refresh()

            const safeRedirect =
                redirectPath && redirectPath.startsWith('/')
                    ? redirectPath
                    : '/dashboard'

            router.replace(safeRedirect)

        } catch (err) {
            setError(getErrorMessage(err))
        } finally {
            setLoading(false)
        }
    }

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !loading) login()
    }

    // =====================================================
    // ✅ SOCIAL SUCCESS
    // =====================================================

    const onSocialSuccess = async () => {
        await refresh()

        const safeRedirect =
            redirectPath && redirectPath.startsWith('/')
                ? redirectPath
                : '/dashboard'

        router.replace(safeRedirect)
    }

    // =====================================================
    // 🎨 RENDER
    // =====================================================

    return (
        <div className="relative min-h-screen flex items-center justify-center px-4 bg-white overflow-hidden">

            {/* ── BACKGROUND ── */}
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
            <div className="fixed bottom-[-160px] right-[-160px] w-[480px] h-[480px] rounded-full bg-indigo-500/8 blur-[160px] pointer-events-none z-0" />

            {/* ── BACK BUTTON ── */}
            <button
                onClick={() => router.back()}
                className="absolute top-6 left-6 z-20 flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition text-sm"
            >
                <ArrowLeft size={16} />
                Back
            </button>

            {/* ── CARD ── */}
            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-7 sm:p-9">

                    {/* HEADER */}
                    <div className="text-center mb-7">
                        <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-indigo-50 mb-4">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-indigo-600">
                                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" fill="currentColor" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Welcome back</h1>
                        <p className="text-sm text-gray-500 mt-1">Sign in to continue learning</p>
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="flex items-start gap-2.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl px-4 py-3 mb-5 text-sm">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* INPUTS */}
                    <div className="space-y-3" onKeyDown={onKeyDown}>
                        <input
                            className={inputClass}
                            placeholder="Email, username or phone"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            autoComplete="username"
                            autoFocus
                        />

                        <div className="relative">
                            <input
                                type={showPass ? 'text' : 'password'}
                                className={inputClass}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass((s) => !s)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                            >
                                {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                            </button>
                        </div>
                    </div>

                    {/* FORGOT */}
                    <div className="flex justify-end mt-2.5">
                        <Link
                            href="/forgot-password"
                            className="text-xs text-gray-400 hover:text-indigo-500 transition"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    {/* SUBMIT */}
                    <button
                        onClick={login}
                        disabled={loading}
                        className="w-full mt-5 bg-indigo-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Signing in…
                            </>
                        ) : (
                            'Sign in'
                        )}
                    </button>

                    {/* DIVIDER */}
                    <div className="my-5 flex items-center gap-3">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-xs text-gray-400">or continue with</span>
                        <div className="flex-1 h-px bg-gray-100" />
                    </div>

                    {/* SOCIAL */}
                    <div className="space-y-2.5">
                        <GoogleSignInButton onSuccess={onSocialSuccess} onError={setError} />
                        <TelegramSignIn onSuccess={onSocialSuccess} onError={setError} />
                    </div>

                    {/* REGISTER LINK */}
                    <p className="text-center text-sm text-gray-500 mt-6">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="text-indigo-600 font-medium hover:underline">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}