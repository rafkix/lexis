'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/api/auth'
import { useAuth } from '@/lib/AuthContext'
import { GoogleSignInButton } from '@/components/auth/social-auth/auth-buttons-google'
import { TelegramSignIn } from '@/components/auth/social-auth/auth-buttons-telegram'
import { Eye, EyeOff, ArrowLeft, Check, X, AlertCircle, Loader2 } from 'lucide-react'

// =====================================================
// 🔐 PASSWORD STRENGTH
// =====================================================

type StrengthLevel = 'weak' | 'medium' | 'strong'

function getStrength(p: string): StrengthLevel {
    if (!p || p.length < 8) return 'weak'
    if (/^\d+$/.test(p) || /^[a-zA-Z]+$/.test(p)) return 'weak'
    if (['12345678', 'password', 'qwerty123'].includes(p.toLowerCase())) return 'weak'
    if (p.length >= 12 && /[A-Z]/.test(p) && /\d/.test(p)) return 'strong'
    return 'medium'
}

const strengthConfig: Record<StrengthLevel, { label: string; bar: string; text: string; width: string }> = {
    weak: { label: 'Weak', bar: 'bg-indigo-500', text: 'text-indigo-500', width: 'w-1/3' },
    medium: { label: 'Medium', bar: 'bg-yellow-400', text: 'text-yellow-600', width: 'w-2/3' },
    strong: { label: 'Strong', bar: 'bg-green-500', text: 'text-green-600', width: 'w-full' },
}

// =====================================================
// 🔧 UTILS
// =====================================================

function getErrorMessage(err: unknown): string {
    if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { detail?: string } } }).response
        if (res?.data?.detail) return res.data.detail
    }
    if (err instanceof Error) return err.message
    return 'Registration failed. Please try again.'
}

const inputClass =
    'w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none ' +
    'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition placeholder:text-gray-400'

// =====================================================
// 📋 FORM
// =====================================================

type Form = {
    full_name: string
    username: string
    email: string
    password: string
    confirm: string
}

// =====================================================
// 📄 PAGE
// =====================================================

export default function RegisterPage() {
    const router = useRouter()
    const { refresh } = useAuth()

    const [form, setForm] = useState<Form>({
        full_name: '',
        username: '',
        email: '',
        password: '',
        confirm: '',
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPass, setShowPass] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const set = (key: keyof Form, value: string) =>
        setForm((prev) => ({ ...prev, [key]: value }))

    // ── USERNAME SUGGESTIONS ──────────────────────────
    const suggestions = useMemo(() => {
        if (!form.full_name || form.username) return []
        const base = form.full_name
            .toLowerCase()
            .replace(/\s+/g, '')
            .replace(/[^a-z0-9]/g, '')
        return base ? [base, `${base}1`, `${base}_uz`] : []
    }, [form.full_name, form.username])

    // ── PASSWORD STATE ────────────────────────────────
    const strength = form.password ? getStrength(form.password) : null
    const passwordsMatch = form.confirm.length > 0 && form.password === form.confirm

    // ── VALIDATION ────────────────────────────────────
    const validate = (): string | null => {
        if (!form.full_name.trim()) return 'Full name is requiindigo'
        if (!form.username.trim()) return 'Username is requiindigo'
        if (!form.email.trim()) return 'Email is requiindigo'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Invalid email address'
        if (!form.password) return 'Password is requiindigo'
        if (getStrength(form.password) === 'weak') return 'Password is too weak — use 8+ chars with letters and numbers'
        if (form.password !== form.confirm) return 'Passwords do not match'
        return null
    }

    // ── SUBMIT ────────────────────────────────────────
    const register = async () => {
        setError(null)
        const err = validate()
        if (err) return setError(err)

        setLoading(true)
        try {
            await authApi.register({
                full_name: form.full_name.trim(),
                username: form.username.trim(),
                email: form.email.trim(),
                password: form.password,
            })
            await refresh()
            router.replace('/dashboard')
        } catch (err) {
            setError(getErrorMessage(err))
        } finally {
            setLoading(false)
        }
    }

    const onSocialSuccess = async () => {
        await refresh()
        router.replace('/dashboard')
    }

    // ── RENDER ────────────────────────────────────────
    return (
        <div className="relative min-h-screen flex items-center justify-center px-4 py-10 bg-white overflow-hidden">

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
            <div className="fixed top-[-160px] left-[-100px] w-[480px] h-[480px] rounded-full bg-indigo-500/8 blur-[160px] pointer-events-none z-0" />
            <div className="fixed bottom-[-100px] right-[-100px] w-[360px] h-[360px] rounded-full bg-indigo-500/6 blur-[140px] pointer-events-none z-0" />

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

                    {/* HEADER */}
                    <div className="text-center mb-7">
                        <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-indigo-50 mb-4">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-indigo-600">
                                <path d="M15 12c2.7 0 4.8-2.1 4.8-4.8S17.7 2.4 15 2.4s-4.8 2.1-4.8 4.8S12.3 12 15 12zm-9.6 0C7.8 12 9.6 10.2 9.6 7.8S7.8 3.6 5.4 3.6 1.2 5.4 1.2 7.8 3 12 5.4 12zm0 2.4C2.4 14.4 0 15.6 0 18v1.2h10.8V18c0-2.4-2.4-3.6-5.4-3.6zm9.6 0c-3 0-9 1.5-9 4.8v1.2H24V19.2c0-3.3-6-4.8-9-4.8z" fill="currentColor" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Create account</h1>
                        <p className="text-sm text-gray-500 mt-1">Start learning with us today</p>
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="flex items-start gap-2.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl px-4 py-3 mb-5 text-sm">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* INPUTS */}
                    <div className="space-y-3">

                        {/* FULL NAME */}
                        <input
                            className={inputClass}
                            placeholder="Full name"
                            value={form.full_name}
                            onChange={(e) => set('full_name', e.target.value)}
                            autoFocus
                        />

                        {/* USERNAME */}
                        <input
                            className={inputClass}
                            placeholder="Username"
                            value={form.username}
                            onChange={(e) => set('username', e.target.value)}
                            autoComplete="username"
                        />

                        {/* USERNAME SUGGESTIONS */}
                        {suggestions.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {suggestions.map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => set('username', s)}
                                        className="px-2.5 py-1 text-xs border border-gray-200 rounded-lg text-gray-500 hover:border-indigo-400 hover:text-indigo-500 transition bg-white"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* EMAIL */}
                        <input
                            type="email"
                            className={inputClass}
                            placeholder="Email address"
                            value={form.email}
                            onChange={(e) => set('email', e.target.value)}
                            autoComplete="email"
                        />

                        {/* PASSWORD */}
                        <div className="relative">
                            <input
                                type={showPass ? 'text' : 'password'}
                                className={inputClass}
                                placeholder="Password"
                                value={form.password}
                                onChange={(e) => set('password', e.target.value)}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass((s) => !s)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                            >
                                {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                            </button>
                        </div>

                        {/* PASSWORD STRENGTH */}
                        {strength && (
                            <div className="space-y-1.5">
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-300 ${strengthConfig[strength].bar} ${strengthConfig[strength].width}`}
                                    />
                                </div>
                                <p className={`text-xs ${strengthConfig[strength].text}`}>
                                    {strengthConfig[strength].label} password
                                </p>
                            </div>
                        )}

                        {/* CONFIRM PASSWORD */}
                        <div className="relative">
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                className={inputClass}
                                placeholder="Confirm password"
                                value={form.confirm}
                                onChange={(e) => set('confirm', e.target.value)}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm((s) => !s)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                            >
                                {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                            </button>
                        </div>

                        {/* MATCH INDICATOR */}
                        {form.confirm.length > 0 && (
                            <div className="flex items-center gap-1.5 text-xs">
                                {passwordsMatch ? (
                                    <><Check size={13} className="text-green-500" /><span className="text-green-600">Passwords match</span></>
                                ) : (
                                    <><X size={13} className="text-indigo-500" /><span className="text-indigo-600">Passwords do not match</span></>
                                )}
                            </div>
                        )}
                    </div>

                    {/* SUBMIT */}
                    <button
                        onClick={register}
                        disabled={loading}
                        className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-indigo-700 active:bg-indigo-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Creating account…
                            </>
                        ) : (
                            'Create account'
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

                    {/* LOGIN LINK */}
                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account?{' '}
                        <Link href="/login" className="text-indigo-600 font-medium hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}