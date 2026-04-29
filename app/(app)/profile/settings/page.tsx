'use client'

import { useAuth } from '@/lib/AuthContext'
import { userApi } from '@/lib/api/user'
import { useEffect, useRef, useState } from 'react'

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

const SCORE_OPTIONS = [
    '', '1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5',
    '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9',
]

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
            <label className="text-sm font-medium text-gray-700">{label}</label>
            {children}
            {hint && <p className="text-xs text-gray-400">{hint}</p>}
        </div>
    )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    const { className = '', ...rest } = props
    return (
        <input
            {...rest}
            className={`w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none
                focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-colors placeholder:text-gray-300 disabled:bg-gray-50
                disabled:text-gray-400 ${className}`}
        />
    )
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
    const { children, ...rest } = props
    return (
        <select
            {...rest}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none
                focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-colors bg-white appearance-none cursor-pointer"
        >
            {children}
        </select>
    )
}

function Btn({ loading, label, variant = 'primary', onClick, type = 'submit', disabled }: {
    loading?: boolean
    label: string
    variant?: 'primary' | 'outline'
    onClick?: () => void
    type?: 'submit' | 'button'
    disabled?: boolean
}) {
    const styles = {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200',
        outline: 'border border-gray-200 text-gray-700 hover:bg-gray-50',
    }
    return (
        <button
            type={type}
            disabled={loading || disabled}
            onClick={onClick}
            className={`text-sm px-5 py-2.5 rounded-xl font-medium transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]}`}
        >
            {loading ? 'Saving...' : label}
        </button>
    )
}

function Msg({ msg, isError }: { msg: string | null; isError?: boolean }) {
    if (!msg) return null
    return (
        <p className={`text-xs font-medium ${isError ? 'text-indigo-500' : 'text-emerald-600'}`}>
            {msg}
        </p>
    )
}

function SectionCard({ title, subtitle, children }: {
    title: string
    subtitle?: string
    children: React.ReactNode
}) {
    return (
        <div className="border border-indigo-50 rounded-2xl p-6 space-y-5 bg-white shadow-sm shadow-indigo-50/50">
            <div>
                <h2 className="font-semibold text-base">{title}</h2>
                {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
            </div>
            {children}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// PHONE SECTION
// uses: userApi.requestPhoneUpdate + userApi.verifyPhoneUpdate
// ─────────────────────────────────────────────────────────────

function PhoneSection({ currentPhone, onVerified }: {
    currentPhone?: string | null
    onVerified: () => Promise<void>
}) {
    const [phone, setPhone]         = useState(currentPhone || '')
    const [code, setCode]           = useState('')
    const [step, setStep]           = useState<'idle' | 'sent'>('idle')
    const [loading, setLoading]     = useState(false)
    const [msg, setMsg]             = useState<{ text: string; error: boolean } | null>(null)
    const [countdown, setCountdown] = useState(0)

    // sync if parent user changes
    useEffect(() => { setPhone(currentPhone || '') }, [currentPhone])

    useEffect(() => {
        if (countdown <= 0) return
        const t = setTimeout(() => setCountdown(c => c - 1), 1000)
        return () => clearTimeout(t)
    }, [countdown])

    const sendCode = async () => {
        if (!phone.trim()) return setMsg({ text: 'Enter a phone number', error: true })
        try {
            setLoading(true)
            setMsg(null)
            // ✅ userApi.requestPhoneUpdate → POST /users/me/phone/request
            const res = await userApi.requestPhoneUpdate(phone)
            setStep('sent')
            setCountdown(res.expires_in ?? 60)
            setMsg({ text: 'Code sent to your phone', error: false })
        } catch (e: unknown) {
            const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
            setMsg({ text: detail || 'Failed to send code', error: true })
        } finally {
            setLoading(false)
        }
    }

    const verifyCode = async () => {
        if (!code.trim()) return setMsg({ text: 'Enter the code', error: true })
        try {
            setLoading(true)
            setMsg(null)
            // ✅ userApi.verifyPhoneUpdate → POST /users/me/phone/verify
            await userApi.verifyPhoneUpdate(phone, code)
            setStep('idle')
            setCode('')
            setCountdown(0)
            setMsg({ text: 'Phone verified successfully ✓', error: false })
            await onVerified() // refresh user
        } catch (e: unknown) {
            const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
            setMsg({ text: detail || 'Invalid code', error: true })
        } finally {
            setLoading(false)
        }
    }

    return (
        <SectionCard
            title="Phone Number"
            subtitle="Add your phone number for account recovery"
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
                        onClick={step === 'sent' ? () => { setStep('idle'); setCode(''); setMsg(null) } : sendCode}
                        disabled={loading || (step === 'idle' && countdown > 0)}
                        className="shrink-0 text-sm px-4 py-2.5 rounded-xl border border-gray-200
                            hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium whitespace-nowrap"
                    >
                        {step === 'sent'
                            ? 'Change'
                            : countdown > 0
                            ? `Resend (${countdown}s)`
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
// SET PASSWORD  (Google login — no password yet)
// uses: userApi.setPassword → POST /users/me/password/set
// ─────────────────────────────────────────────────────────────

function SetPasswordSection({ onSaved }: { onSaved: () => Promise<void> }) {
    const [newPassword, setNewPassword]         = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading]                 = useState(false)
    const [msg, setMsg]                         = useState<{ text: string; error: boolean } | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword.length < 8)
            return setMsg({ text: 'Password must be at least 8 characters', error: true })
        if (newPassword !== confirmPassword)
            return setMsg({ text: 'Passwords do not match', error: true })

        try {
            setLoading(true)
            setMsg(null)
            // ✅ userApi.setPassword → POST /users/me/password/set
            await userApi.setPassword(newPassword)
            setNewPassword('')
            setConfirmPassword('')
            setMsg({ text: 'Password set successfully ✓', error: false })
            await onSaved()
        } catch (e: unknown) {
            const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
            setMsg({ text: detail || 'Something went wrong', error: true })
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <SectionCard
                title="Set Password"
                subtitle="You signed in with Google — add a password to also log in with email"
            >
                <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="New password" hint="Minimum 8 characters">
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                    </Field>
                    <Field label="Confirm password">
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            autoComplete="new-password"
                        />
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
// CHANGE PASSWORD  (has password already)
// uses: userApi.changePassword → POST /users/me/password/change
// ─────────────────────────────────────────────────────────────

function ChangePasswordSection() {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword]         = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading]                 = useState(false)
    const [msg, setMsg]                         = useState<{ text: string; error: boolean } | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword.length < 8)
            return setMsg({ text: 'Password must be at least 8 characters', error: true })
        if (newPassword !== confirmPassword)
            return setMsg({ text: 'Passwords do not match', error: true })

        try {
            setLoading(true)
            setMsg(null)
            // ✅ userApi.changePassword → POST /users/me/password/change
            await userApi.changePassword({ current_password: currentPassword, new_password: newPassword })
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setMsg({ text: 'Password updated successfully ✓', error: false })
        } catch (e: unknown) {
            const detail =
                (e as { response?: { data?: { detail?: string; message?: string } } })
                    ?.response?.data?.detail ||
                (e as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message
            setMsg({ text: detail || 'Something went wrong', error: true })
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <SectionCard title="Security" subtitle="Change your login password">
                <Field label="Current password">
                    <Input
                        type="password"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        autoComplete="current-password"
                    />
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="New password" hint="Minimum 8 characters">
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                    </Field>
                    <Field label="Confirm new password">
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            autoComplete="new-password"
                        />
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
    const [bio, setBio]           = useState('')

    const fileRef = useRef<HTMLInputElement>(null)
    // avatarPreview: tracks what is shown. Updated from user OR local file pick
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [avatarFile, setAvatarFile]       = useState<File | null>(null)

    const [targetScore, setTargetScore] = useState('')
    const [currentScore, setCurrentScore] = useState('')
    const [listening, setListening] = useState('')
    const [reading, setReading]     = useState('')
    const [writing, setWriting]     = useState('')
    const [speaking, setSpeaking]   = useState('')

    const [cefrLevel, setCefrLevel]   = useState('')
    const [cefrTarget, setCefrTarget] = useState('')

    const [loadingProfile, setLoadingProfile] = useState(false)
    const [msgProfile, setMsgProfile] = useState<{ text: string; error: boolean } | null>(null)

    // ── sync from user ──
    useEffect(() => {
        if (!user) return
        setFullName(user.full_name || '')
        setUsername(user.username || '')
        setBio(user.meta?.bio || '')

        // ✅ only update preview from server if no local file is pending
        setAvatarPreview(prev => avatarFile ? prev : (user.avatar || null))

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

    const hasPassword = user.has_password !== false

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setAvatarFile(file)
        // show preview immediately
        const objectUrl = URL.createObjectURL(file)
        setAvatarPreview(objectUrl)
    }

    const saveProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setLoadingProfile(true)
            setMsgProfile(null)

            // 1. Upload avatar first if a new file was picked
            if (avatarFile) {
                // ✅ userApi.uploadAvatar → PATCH /users/me/avatar/upload
                const newAvatarUrl = await userApi.uploadAvatar(avatarFile)
                setAvatarFile(null)
                // ✅ immediately update preview with the real URL from server
                setAvatarPreview(newAvatarUrl)
            }

            // 2. Update profile
            // ✅ userApi.updateProfile → PUT /users/me
            await userApi.updateProfile({
                full_name: fullName,
                username,
                meta: {
                    version: 1,
                    bio: bio || undefined,
                    ielts: {
                        target_score:  targetScore  ? Number(targetScore)  : undefined,
                        current_score: currentScore ? Number(currentScore) : undefined,
                        listening:     listening    ? Number(listening)    : undefined,
                        reading:       reading      ? Number(reading)      : undefined,
                        writing:       writing      ? Number(writing)      : undefined,
                        speaking:      speaking     ? Number(speaking)     : undefined,
                    },
                    cefr: {
                        level:        cefrLevel  || undefined,
                        target_level: cefrTarget || undefined,
                    },
                },
            })

            // 3. Refresh AuthContext so ProfilePage also updates
            await refresh()
            setMsgProfile({ text: 'Profile saved ✓', error: false })
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
        <div className="max-w-2xl mx-auto space-y-6">

            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
                <p className="text-sm text-gray-400 mt-1">
                    Manage your profile and account preferences
                </p>
            </div>

            {/* ── PROFILE + IELTS + CEFR ── */}
            <form onSubmit={saveProfile} className="space-y-5">

                <SectionCard title="Profile">
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                        <div
                            className="relative w-16 h-16 rounded-[18px] overflow-hidden bg-black
                                shrink-0 cursor-pointer group shadow-sm"
                            onClick={() => fileRef.current?.click()}
                        >
                            {avatarPreview ? (
                                <img
                                    src={avatarPreview}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                    // ✅ cache-busting: force reload after upload
                                    key={avatarPreview}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center
                                    text-white text-xl font-bold select-none">
                                    {user.full_name?.[0]?.toUpperCase() || 'U'}
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center
                                justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-xs font-medium">Change</span>
                            </div>
                        </div>

                        <div>
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                className="text-sm border border-gray-200 px-3 py-1.5 rounded-lg
                                    hover:bg-gray-50 transition-colors font-medium"
                            >
                                Upload photo
                            </button>
                            <p className="text-xs text-gray-400 mt-1">
                                JPG, PNG or WEBP · Max 2MB
                            </p>
                        </div>

                        {/* ✅ show pending indicator if file picked but not saved yet */}
                        {avatarFile && (
                            <span className="text-xs text-amber-500 font-medium ml-auto">
                                Pending save ↑
                            </span>
                        )}

                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                    </div>

                    <div className="border-t border-gray-100" />

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
                            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm
                                outline-none focus:border-black transition-colors
                                placeholder:text-gray-300 resize-none"
                        />
                    </Field>
                </SectionCard>

                <SectionCard title="IELTS Scores">
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

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Listening', val: listening, set: setListening },
                            { label: 'Reading',   val: reading,   set: setReading },
                            { label: 'Writing',   val: writing,   set: setWriting },
                            { label: 'Speaking',  val: speaking,  set: setSpeaking },
                        ].map(({ label, val, set }) => (
                            <Field key={label} label={label}>
                                <Select value={val} onChange={e => set(e.target.value)}>
                                    <option value="">–</option>
                                    {SCORE_OPTIONS.filter(Boolean).map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </Select>
                            </Field>
                        ))}
                    </div>
                </SectionCard>

                <SectionCard title="CEFR Level">
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

                <div className="flex items-center gap-4">
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
        </div>
    )
}