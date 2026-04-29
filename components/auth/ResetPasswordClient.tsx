'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/api/auth'
import { Loader2 } from 'lucide-react'

// utils
function getErrorMessage(err: unknown): string {
    if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as any).response
        if (res?.data?.detail) return res.data.detail
    }
    if (err instanceof Error) return err.message
    return 'Something went wrong'
}

function getStrength(p: string) {
    if (!p || p.length < 8) return 'weak'
    if (/^\d+$/.test(p) || /^[a-zA-Z]+$/.test(p)) return 'weak'
    if (p.length >= 12 && /[A-Z]/.test(p) && /\d/.test(p)) return 'strong'
    return 'medium'
}

export default function ResetPasswordClient() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // ⚠️ muhim: hydration flicker oldini olish
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [done, setDone] = useState(false)

    if (token === null) {
        return null // loading yoki skeleton
    }

    const submit = async () => {
        if (loading) return // double submit fix

        setError(null)

        if (!token) return setError('Invalid reset link')
        if (!password) return setError('Password required')
        if (getStrength(password) === 'weak') return setError('Weak password')
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

    if (done) {
        return (
            <div className="text-center">
                <h2>Password updated</h2>
                <Link href="/login">Login</Link>
            </div>
        )
    }

    if (!token) {
        return (
            <div className="text-center">
                <h2>Invalid or expired link</h2>
                <Link href="/forgot-password">Try again</Link>
            </div>
        )
    }

    return (
        <div className="space-y-4">

            {error && <div className="text-red-500">{error}</div>}

            <input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <input
                type="password"
                placeholder="Confirm password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
            />

            <button onClick={submit} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : 'Reset password'}
            </button>
        </div>
    )
}