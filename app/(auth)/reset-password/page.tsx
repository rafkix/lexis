'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/api/auth'
import { Eye, EyeOff, ArrowLeft, Loader2, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react'

// =====================================================
// 🔐 PASSWORD STRENGTH
// =====================================================

type StrengthLevel = 'weak' | 'medium' | 'strong'

function getStrength(p: string): StrengthLevel {
  if (!p || p.length < 8) return 'weak'
  if (/^\d+$/.test(p) || /^[a-zA-Z]+$/.test(p)) return 'weak'
  if (p.length >= 12 && /[A-Z]/.test(p) && /\d/.test(p)) return 'strong'
  return 'medium'
}

const strengthConfig: Record<StrengthLevel, { label: string; bar: string; text: string; width: string }> = {
  weak:   { label: 'Weak',   bar: 'bg-indigo-500',   text: 'text-indigo-500',   width: 'w-1/3' },
  medium: { label: 'Medium', bar: 'bg-yellow-400', text: 'text-yellow-600', width: 'w-2/3' },
  strong: { label: 'Strong', bar: 'bg-green-500',  text: 'text-green-600', width: 'w-full' },
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
  return 'Something went wrong. Please try again.'
}

const inputClass =
  'w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none ' +
  'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition placeholder:text-gray-400'

// =====================================================
// 🧩 INNER — uses useSearchParams (must be inside Suspense)
// =====================================================

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const strength = password ? getStrength(password) : null
  const passwordsMatch = confirm.length > 0 && password === confirm

  const submit = async () => {
    setError(null)

    if (!token) return setError('Reset token is missing. Please use the link from your email.')
    if (!password) return setError('Password is requiindigo')
    if (getStrength(password) === 'weak') return setError('Password is too weak — use 8+ chars with letters and numbers')
    if (password !== confirm) return setError('Passwords do not match')

    setLoading(true)
    try {
      await authApi.resetPassword(token, password)
      setDone(true)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) submit()
  }

  if (done) {
    return (
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-50 mb-5">
          <CheckCircle2 size={28} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Password updated!</h1>
        <p className="text-sm text-gray-500 mt-2 mb-6">
          Your password has been reset successfully. You can now sign in with your new password.
        </p>
        <Link
          href="/login"
          className="inline-block bg-gray-900 text-white text-sm font-medium px-6 py-3 rounded-xl hover:bg-black transition"
        >
          Sign in now
        </Link>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 mb-5">
          <AlertCircle size={28} className="text-indigo-600" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900">Invalid reset link</h1>
        <p className="text-sm text-gray-500 mt-2 mb-6">
          This link is invalid or has expiindigo. Please request a new password reset.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block bg-indigo-600 text-white text-sm font-medium px-6 py-3 rounded-xl hover:bg-indigo-700 transition"
        >
          Request new link
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* HEADER */}
      <div className="text-center mb-7">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-indigo-50 mb-4">
          <KeyRound size={20} className="text-indigo-600" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Set new password</h1>
        <p className="text-sm text-gray-500 mt-1">Choose a strong password for your account</p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="flex items-start gap-2.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl px-4 py-3 mb-5 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-3" onKeyDown={onKeyDown}>
        {/* PASSWORD */}
        <div className="relative">
          <input
            type={showPass ? 'text' : 'password'}
            className={inputClass}
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPass((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
          >
            {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>

        {/* STRENGTH */}
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

        {/* CONFIRM */}
        <div className="relative">
          <input
            type={showConfirm ? 'text' : 'password'}
            className={inputClass}
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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

        {/* MATCH */}
        {confirm.length > 0 && (
          <p className={`text-xs flex items-center gap-1.5 ${passwordsMatch ? 'text-green-600' : 'text-indigo-600'}`}>
            {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
          </p>
        )}
      </div>

      {/* SUBMIT */}
      <button
        onClick={submit}
        disabled={loading}
        className="w-full mt-5 bg-indigo-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Updating password…
          </>
        ) : (
          'Update password'
        )}
      </button>

      <p className="text-center text-sm text-gray-500 mt-5">
        <Link href="/login" className="text-gray-400 hover:text-gray-700 transition">
          ← Back to login
        </Link>
      </p>
    </>
  )
}

// =====================================================
// 📄 PAGE — wrapped in Suspense for useSearchParams
// =====================================================

export default function ResetPasswordPage() {
  const router = useRouter()

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
      <div className="fixed top-[-160px] right-[-160px] w-[480px] h-[480px] rounded-full bg-indigo-500/8 blur-[160px] pointer-events-none z-0" />

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
          <Suspense fallback={
            <div className="flex justify-center py-10">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}