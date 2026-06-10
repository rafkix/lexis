'use client'

import { useAuth } from '@/lib/AuthContext'
import { CEFRMeta } from '@/lib/api/auth'
import { userApi } from '@/lib/api/user'
import { useEffect, useRef, useState } from 'react'

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

const SCORE_OPTIONS = [
    '', '1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5',
    '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9',
]

// FIX: BASE_URL avatar URL larini to'g'ri resolve qilish uchun
const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ?? 'https://api.lexis.uz'

function resolveAvatar(src?: string | null): string | null {
    if (!src) return null
    if (src.startsWith('http://') || src.startsWith('https://')) return src
    if (src.startsWith('/static/')) return `${BASE_URL}${src}`
    return src
}

// ─────────────────────────────────────────────────────────────
// UI PRIMITIVES
// ─────────────────────────────────────────────────────────────

function Field({ label, hint, children }: {
    label: string
    hint?: string
    children: React.ReactNode
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-indigo-900/60 uppercase tracking-wider">
                {label}
            </label>
            {children}
            {hint && <p className="text-xs text-indigo-400/70">{hint}</p>}
        </div>
    )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    const { className = '', ...rest } = props
    return (
        <input
            {...rest}
            className={`w-full border border-indigo-100 rounded-xl px-3.5 py-2.5 text-sm outline-none
                bg-indigo-50/40 text-indigo-950
                focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:bg-white
                transition-all placeholder:text-indigo-300
                disabled:bg-indigo-50 disabled:text-indigo-300 disabled:cursor-not-allowed
                ${className}`}
        />
    )
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
    const { children, ...rest } = props
    return (
        <select
            {...rest}
            className="w-full border border-indigo-100 rounded-xl px-3.5 py-2.5 text-sm outline-none
                bg-indigo-50/40 text-indigo-950
                focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:bg-white
                transition-all appearance-none cursor-pointer"
        >
            {children}
        </select>
    )
}

function Btn({ loading, label, variant = 'primary', onClick, type = 'submit', disabled }: {
    loading?: boolean
    label: string
    variant?: 'primary' | 'outline' | 'ghost'
    onClick?: () => void
    type?: 'submit' | 'button'
    disabled?: boolean
}) {
    const styles = {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 active:scale-[0.98]',
        outline: 'border border-indigo-200 text-indigo-700 hover:bg-indigo-50 active:scale-[0.98]',
        ghost: 'text-indigo-600 hover:bg-indigo-50 active:scale-[0.98]',
    }
    return (
        <button
            type={type}
            disabled={loading || disabled}
            onClick={onClick}
            className={`text-sm px-5 py-2.5 rounded-xl font-semibold transition-all
                disabled:opacity-40 disabled:cursor-not-allowed ${styles[variant]}`}
        >
            {loading ? (
                <span className="flex items-center gap-2">
                    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                </span>
            ) : label}
        </button>
    )
}

function Msg({ msg, isError }: { msg: string | null; isError?: boolean }) {
    if (!msg) return null
    return (
        <span className={`text-xs font-semibold flex items-center gap-1.5
            ${isError ? 'text-rose-500' : 'text-emerald-600'}`}>
            {isError ? '✕' : '✓'} {msg}
        </span>
    )
}

function SectionCard({ title, subtitle, children, icon }: {
    title: string
    subtitle?: string
    children: React.ReactNode
    icon?: React.ReactNode
}) {
    return (
        <div className="rounded-2xl border border-indigo-100 bg-white shadow-sm shadow-indigo-50 overflow-hidden">
            <div className="px-6 py-4 border-b border-indigo-50 bg-gradient-to-r from-indigo-50/60 to-white flex items-center gap-3">
                {icon && (
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        {icon}
                    </div>
                )}
                <div>
                    <h2 className="font-bold text-sm text-indigo-950">{title}</h2>
                    {subtitle && <p className="text-xs text-indigo-400 mt-0.5">{subtitle}</p>}
                </div>
            </div>
            <div className="p-6 space-y-5">
                {children}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// AVATAR COMPONENT
// ─────────────────────────────────────────────────────────────

function Avatar({
    src,
    initial,
    onClick,
    hasPending,
    uploading,
}: {
    src: string | null
    initial: string
    onClick: () => void
    hasPending?: boolean
    // FIX: yuklash holati ko'rsatish
    uploading?: boolean
}) {
    const [imgErr, setImgErr] = useState(false)
    // FIX: src o'zgarganda xatoni reset qil
    useEffect(() => { setImgErr(false) }, [src])

    return (
        <div className="flex items-center gap-4">
            <button
                type="button"
                onClick={onClick}
                disabled={uploading}
                className="relative shrink-0 group"
                style={{ width: 80, height: 80 }}
                title="Change photo"
            >
                <div
                    className="w-full h-full rounded-[18px] overflow-hidden bg-gradient-to-br
                        from-indigo-500 to-indigo-700 shadow-lg shadow-indigo-200"
                    style={{ width: 80, height: 80 }}
                >
                    {src && !imgErr ? (
                        <img
                            key={src}
                            src={src}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                            style={{ width: 80, height: 80 }}
                            onError={() => setImgErr(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center
                            text-white text-2xl font-bold select-none">
                            {initial}
                        </div>
                    )}
                </div>
                {/* hover overlay */}
                {!uploading && (
                    <div className="absolute inset-0 rounded-[18px] bg-indigo-900/50
                        flex items-center justify-center
                        opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                )}
                {/* FIX: uploading spinner */}
                {uploading && (
                    <div className="absolute inset-0 rounded-[18px] bg-indigo-900/60
                        flex items-center justify-center">
                        <svg className="animate-spin w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    </div>
                )}
                {/* pending dot */}
                {hasPending && !uploading && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full
                        border-2 border-white shadow-sm" />
                )}
            </button>

            <div className="space-y-1">
                <p className="text-sm font-semibold text-indigo-950">Profile photo</p>
                <p className="text-xs text-indigo-400">JPG, PNG or WEBP · Max 2 MB</p>
                <button
                    type="button"
                    onClick={onClick}
                    disabled={uploading}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800
                        underline underline-offset-2 transition-colors disabled:opacity-40"
                >
                    {uploading ? 'Uploading...' : src ? 'Change photo' : 'Upload photo'}
                </button>
            </div>

            {hasPending && !uploading && (
                <span className="ml-auto text-xs font-semibold text-amber-500 bg-amber-50
                    border border-amber-200 px-2.5 py-1 rounded-full">
                    Unsaved
                </span>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// PHONE SECTION
// ─────────────────────────────────────────────────────────────

function PhoneSection({ currentPhone, onVerified }: {
    currentPhone?: string | null
    onVerified: () => Promise<void>
}) {
    const [phone, setPhone] = useState(currentPhone || '')
    const [code, setCode] = useState('')
    const [step, setStep] = useState<'idle' | 'sent'>('idle')
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null)
    const [countdown, setCountdown] = useState(0)

    useEffect(() => { setPhone(currentPhone || '') }, [currentPhone])

    useEffect(() => {
        if (countdown <= 0) return
        const t = setTimeout(() => setCountdown(c => c - 1), 1000)
        return () => clearTimeout(t)
    }, [countdown])

    const sendCode = async () => {
        if (!phone.trim()) return setMsg({ text: 'Enter a phone number', error: true })
        try {
            setLoading(true); setMsg(null)
            const res = await userApi.requestPhoneUpdate(phone)
            setStep('sent'); setCountdown(res.expires_in ?? 60)
            setMsg({ text: 'Code sent to your email', error: false })
        } catch (e: unknown) {
            const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
            setMsg({ text: detail || 'Failed to send code', error: true })
        } finally { setLoading(false) }
    }

    const verifyCode = async () => {
        if (!code.trim()) return setMsg({ text: 'Enter the code', error: true })
        try {
            setLoading(true); setMsg(null)
            await userApi.verifyPhoneUpdate(phone, code)
            setStep('idle'); setCode(''); setCountdown(0)
            setMsg({ text: 'Phone verified successfully', error: false })
            await onVerified()
        } catch (e: unknown) {
            const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
            setMsg({ text: detail || 'Invalid code', error: true })
        } finally { setLoading(false) }
    }

    return (
        <SectionCard
            title="Phone Number"
            subtitle="Add your phone for account recovery"
            icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
            }
        >
            <Field label="Phone number" hint="Include country code · e.g. +998901234567">
                <div className="flex gap-2">
                    <Input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+998901234567"
                        disabled={step === 'sent'}
                    />
                    <button
                        type="button"
                        onClick={step === 'sent'
                            ? () => { setStep('idle'); setCode(''); setMsg(null) }
                            : sendCode}
                        disabled={loading || (step === 'idle' && countdown > 0)}
                        className="shrink-0 text-sm px-4 py-2.5 rounded-xl border border-indigo-200
                            text-indigo-700 hover:bg-indigo-50 font-semibold transition-all
                            disabled:opacity-40 whitespace-nowrap"
                    >
                        {step === 'sent' ? 'Change'
                            : countdown > 0 ? `Resend (${countdown}s)`
                                : loading ? 'Sending...' : 'Send code'}
                    </button>
                </div>
            </Field>

            {step === 'sent' && (
                <Field label="Verification code">
                    <div className="flex gap-2">
                        <Input
                            type="text"
                            value={code}
                            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="• • • • • •"
                            maxLength={6}
                            className="tracking-[0.4em] text-center text-lg font-mono"
                        />
                        <Btn
                            type="button"
                            label="Verify"
                            loading={loading}
                            onClick={verifyCode}
                            disabled={code.length < 6}
                        />
                    </div>
                </Field>
            )}

            <Msg msg={msg?.text ?? null} isError={msg?.error} />
        </SectionCard>
    )
}

// ─────────────────────────────────────────────────────────────
// SET PASSWORD
// ─────────────────────────────────────────────────────────────

function SetPasswordSection({ onSaved }: { onSaved: () => Promise<void> }) {
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword.length < 8)
            return setMsg({ text: 'Password must be at least 8 characters', error: true })
        if (newPassword !== confirmPassword)
            return setMsg({ text: 'Passwords do not match', error: true })
        try {
            setLoading(true); setMsg(null)
            await userApi.setPassword(newPassword)
            setNewPassword(''); setConfirmPassword('')
            setMsg({ text: 'Password set successfully', error: false })
            await onSaved()
        } catch (e: unknown) {
            const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
            setMsg({ text: detail || 'Something went wrong', error: true })
        } finally { setLoading(false) }
    }

    return (
        <form onSubmit={handleSubmit}>
            <SectionCard
                title="Set Password"
                subtitle="You signed in with Google — add a password to also log in with email"
                icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                }
            >
                <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="New password" hint="Minimum 8 characters">
                        <Input type="password" placeholder="••••••••" value={newPassword}
                            onChange={e => setNewPassword(e.target.value)} autoComplete="new-password" />
                    </Field>
                    <Field label="Confirm password">
                        <Input type="password" placeholder="••••••••" value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" />
                    </Field>
                </div>
                <div className="flex items-center gap-4">
                    <Btn loading={loading} label="Set password" />
                    <Msg msg={msg?.text ?? null} isError={msg?.error} />
                </div>
            </SectionCard>
        </form>
    )
}

// ─────────────────────────────────────────────────────────────
// CHANGE PASSWORD
// ─────────────────────────────────────────────────────────────

function ChangePasswordSection() {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword.length < 8)
            return setMsg({ text: 'Password must be at least 8 characters', error: true })
        if (newPassword !== confirmPassword)
            return setMsg({ text: 'Passwords do not match', error: true })
        try {
            setLoading(true); setMsg(null)
            await userApi.changePassword({ current_password: currentPassword, new_password: newPassword })
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
            setMsg({ text: 'Password updated successfully', error: false })
        } catch (e: unknown) {
            const detail =
                (e as { response?: { data?: { detail?: string; message?: string } } })
                    ?.response?.data?.detail ||
                (e as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message
            setMsg({ text: detail || 'Something went wrong', error: true })
        } finally { setLoading(false) }
    }

    return (
        <form onSubmit={handleSubmit}>
            <SectionCard
                title="Security"
                subtitle="Change your login password"
                icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                }
            >
                <Field label="Current password">
                    <Input type="password" placeholder="••••••••" value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)} autoComplete="current-password" />
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="New password" hint="Minimum 8 characters">
                        <Input type="password" placeholder="••••••••" value={newPassword}
                            onChange={e => setNewPassword(e.target.value)} autoComplete="new-password" />
                    </Field>
                    <Field label="Confirm new password">
                        <Input type="password" placeholder="••••••••" value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" />
                    </Field>
                </div>
                <div className="flex items-center gap-4">
                    <Btn loading={loading} label="Update password" />
                    <Msg msg={msg?.text ?? null} isError={msg?.error} />
                </div>
            </SectionCard>
        </form>
    )
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function SettingsPage() {
    const { user, refresh } = useAuth()

    const [fullName, setFullName] = useState('')
    const [username, setUsername] = useState('')
    const [bio, setBio] = useState('')

    const fileRef = useRef<HTMLInputElement>(null)
    // FIX: avatarPreview uchun resolveAvatar ishlatiladi
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    // FIX: avatar alohida yuklash holati
    const [avatarUploading, setAvatarUploading] = useState(false)
    const [avatarMsg, setAvatarMsg] = useState<{ text: string; error: boolean } | null>(null)

    const [targetScore, setTargetScore] = useState('')
    const [currentScore, setCurrentScore] = useState('')
    const [listening, setListening] = useState('')
    const [reading, setReading] = useState('')
    const [writing, setWriting] = useState('')
    const [speaking, setSpeaking] = useState('')

    const [cefrLevel, setCefrLevel] = useState('')
    const [cefrTarget, setCefrTarget] = useState('')

    const [loadingProfile, setLoadingProfile] = useState(false)
    const [msgProfile, setMsgProfile] = useState<{ text: string; error: boolean } | null>(null)

    useEffect(() => {
        if (!user) return
        setFullName(user.full_name || '')
        setUsername(user.username || '')
        setBio(user.meta?.bio || '')
        // FIX: user.avatar o'zgarganda (avatarFile yo'q bo'lsa) resolveAvatar orqali set qil
        if (!avatarFile) {
            setAvatarPreview(resolveAvatar(user.avatar))
        }

        const ielts = user.meta?.ielts
        setTargetScore(ielts?.target_score?.toString() || '')
        setCurrentScore(ielts?.current_score?.toString() || '')
        setListening(ielts?.listening?.toString() || '')
        setReading(ielts?.reading?.toString() || '')
        setWriting(ielts?.writing?.toString() || '')
        setSpeaking(ielts?.speaking?.toString() || '')

        setCefrLevel(user.meta?.cefr?.level || '')
        setCefrTarget(user.meta?.cefr?.target_level || '')
    }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

    if (!user) return null

    const hasPassword = !!user.has_password

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setAvatarFile(file)
        setAvatarPreview(URL.createObjectURL(file))
        setAvatarMsg(null)
    }

    // FIX: Avatar yuklash — profil saqlashdan ALOHIDA, darhol yuklanadi
    const handleAvatarUpload = async () => {
        if (!avatarFile) return
        try {
            setAvatarUploading(true)
            setAvatarMsg(null)
            const newUrl = await userApi.uploadAvatar(avatarFile)
            // FIX: upload qaytargan URL ni to'g'ri resolve qil
            setAvatarPreview(resolveAvatar(newUrl))
            setAvatarFile(null)
            setAvatarMsg({ text: 'Photo updated', error: false })
            await refresh()
        } catch (e: unknown) {
            const detail =
                (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
            setAvatarMsg({ text: detail || 'Upload failed. Max size 2MB.', error: true })
        } finally {
            setAvatarUploading(false)
            if (fileRef.current) fileRef.current.value = ''
        }
    }

    // FIX: saveProfile — faqat profil ma'lumotlarini saqlaydi, avatarni emas
    const saveProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setLoadingProfile(true)
            setMsgProfile(null)

            await userApi.updateProfile({
                full_name: fullName || undefined,
                username: username || undefined,
                meta: {
                    version: 1,
                    bio: bio || undefined,
                    ielts: {
                        target_score: targetScore ? Number(targetScore) : undefined,
                        current_score: currentScore ? Number(currentScore) : undefined,
                        listening: listening ? Number(listening) : undefined,
                        reading: reading ? Number(reading) : undefined,
                        writing: writing ? Number(writing) : undefined,
                        speaking: speaking ? Number(speaking) : undefined,
                    },
                    cefr: {
                        level: (cefrLevel as CEFRMeta['level']) || undefined,
                        target_level: (cefrTarget as CEFRMeta['target_level']) || undefined,
                    },
                },
            })

            await refresh()
            setMsgProfile({ text: 'Profile saved', error: false })
        } catch (e: unknown) {
            const detail =
                (e as { response?: { data?: { detail?: string; message?: string } } })
                    ?.response?.data?.detail ||
                (e as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message ||
                'Something went wrong'
            setMsgProfile({ text: detail, error: true })
        } finally {
            setLoadingProfile(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-white">
            <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

                {/* ── Page header ── */}
                <div className="flex items-center gap-3 pb-2">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-indigo-950 tracking-tight">Settings</h1>
                        <p className="text-xs text-indigo-400">Manage your profile and account preferences</p>
                    </div>
                </div>

                {/* ── PROFILE + IELTS + CEFR ── */}
                <form onSubmit={saveProfile} className="space-y-5">

                    {/* Profile card */}
                    <SectionCard
                        title="Profile"
                        subtitle="Your public information"
                        icon={
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        }
                    >
                        {/* FIX: Avatar — uploading holati va alohida yuklash tugmasi */}
                        <Avatar
                            src={avatarPreview}
                            initial={user.full_name?.[0]?.toUpperCase() || 'U'}
                            onClick={() => fileRef.current?.click()}
                            hasPending={!!avatarFile}
                            uploading={avatarUploading}
                        />
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />

                        {/* FIX: Fayl tanlangandan keyin "Upload" tugmasi ko'rinadi */}
                        {avatarFile && !avatarUploading && (
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleAvatarUpload}
                                    className="text-sm px-4 py-2 rounded-xl font-semibold text-white
                                        bg-indigo-600 hover:bg-indigo-700 transition-all"
                                >
                                    Upload photo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAvatarFile(null)
                                        setAvatarPreview(resolveAvatar(user.avatar))
                                        setAvatarMsg(null)
                                        if (fileRef.current) fileRef.current.value = ''
                                    }}
                                    className="text-sm px-4 py-2 rounded-xl font-semibold
                                        text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <Msg msg={avatarMsg?.text ?? null} isError={avatarMsg?.error} />
                            </div>
                        )}
                        {!avatarFile && avatarMsg && (
                            <Msg msg={avatarMsg.text} isError={avatarMsg.error} />
                        )}

                        <div className="border-t border-indigo-50" />

                        <div className="grid sm:grid-cols-2 gap-4">
                            <Field label="Full name">
                                <Input
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    placeholder="John Smith"
                                />
                            </Field>
                            <Field label="Username" hint="Used in your public profile URL">
                                <Input
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    placeholder="johnsmith"
                                />
                            </Field>
                        </div>

                        <Field label="Bio">
                            <textarea
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                                placeholder="Tell something about yourself..."
                                rows={3}
                                className="w-full border border-indigo-100 rounded-xl px-3.5 py-2.5 text-sm
                                    outline-none bg-indigo-50/40 text-indigo-950
                                    focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:bg-white
                                    transition-all placeholder:text-indigo-300 resize-none"
                            />
                        </Field>
                    </SectionCard>

                    {/* IELTS Scores */}
                    <SectionCard
                        title="IELTS Scores"
                        subtitle="Track your current and target scores"
                        icon={
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        }
                    >
                        <div className="grid sm:grid-cols-2 gap-4">
                            <Field label="Current score">
                                <Select value={currentScore} onChange={e => setCurrentScore(e.target.value)}>
                                    <option value="">Select</option>
                                    {SCORE_OPTIONS.filter(Boolean).map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </Select>
                            </Field>
                            <Field label="Target score">
                                <Select value={targetScore} onChange={e => setTargetScore(e.target.value)}>
                                    <option value="">Select</option>
                                    {SCORE_OPTIONS.filter(Boolean).map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </Select>
                            </Field>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-indigo-900/60 uppercase tracking-wider mb-3">
                                Band scores
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { label: 'Listening', val: listening, set: setListening },
                                    { label: 'Reading', val: reading, set: setReading },
                                    { label: 'Writing', val: writing, set: setWriting },
                                    { label: 'Speaking', val: speaking, set: setSpeaking },
                                ].map(({ label, val, set }) => (
                                    <div key={label}
                                        className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 space-y-2">
                                        <span className="text-xs font-semibold text-indigo-500">{label}</span>
                                        <Select value={val} onChange={e => set(e.target.value)}>
                                            <option value="">–</option>
                                            {SCORE_OPTIONS.filter(Boolean).map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </Select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SectionCard>

                    {/* CEFR Level */}
                    <SectionCard
                        title="CEFR Level"
                        subtitle="Your English proficiency level"
                        icon={
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        }
                    >
                        <div className="grid sm:grid-cols-2 gap-4">
                            <Field label="Current level">
                                <Select value={cefrLevel} onChange={e => setCefrLevel(e.target.value)}>
                                    <option value="">Select</option>
                                    {CEFR_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                </Select>
                            </Field>
                            <Field label="Target level">
                                <Select value={cefrTarget} onChange={e => setCefrTarget(e.target.value)}>
                                    <option value="">Select</option>
                                    {CEFR_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                </Select>
                            </Field>
                        </div>
                    </SectionCard>

                    {/* Save button row */}
                    <div className="flex items-center gap-4 px-1">
                        <Btn loading={loadingProfile} label="Save changes" />
                        <Msg msg={msgProfile?.text ?? null} isError={msgProfile?.error} />
                    </div>
                </form>

                {/* ── PHONE ── */}
                <PhoneSection currentPhone={user.phone} onVerified={refresh} />

                {/* ── PASSWORD ── */}
                {hasPassword
                    ? <ChangePasswordSection />
                    : <SetPasswordSection onSaved={refresh} />
                }

                {/* Bottom spacing */}
                <div className="h-4" />
            </div>
        </div>
    )
}