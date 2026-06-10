'use client'

import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { quotaApi, type QuotaOut } from '@/lib/api/quota'
import { userApi } from '@/lib/api/user'
import {
    User, AtSign, Mail, Phone, Calendar,
    TrendingUp, LayoutGrid, Pencil, Zap, Flame,
    BadgeCheck, BookOpen, Headphones, PenLine,
    Mic2, Crown, Copy, Link, ArrowRight,
} from 'lucide-react'

/* ─── Constants ───────────────────────────────────────────────────── */
const C1 = '#6366f1'
const C2 = '#4f46e5'

const SKILL_CONFIG = [
    { key: 'LISTENING', label: 'Listening', Icon: Headphones, color: '#6366f1' },
    { key: 'READING', label: 'Reading', Icon: BookOpen, color: '#8b5cf6' },
    { key: 'WRITING', label: 'Writing', Icon: PenLine, color: '#f59e0b' },
    { key: 'SPEAKING', label: 'Speaking', Icon: Mic2, color: '#10b981' },
] as const

type SkillKey = (typeof SKILL_CONFIG)[number]['key']

const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ?? 'https://api.lexis.uz'

/* ─── Mock quota (API ishlamasa demo uchun) ───────────────────────── */
const MOCK_QUOTA: QuotaOut = {
    tier: 'FREE',
    quotas: {
        LISTENING: { used: 2, limit: 5 },
        READING: { used: 3, limit: 5 },
        WRITING: { used: 1, limit: 3 },
        SPEAKING: { used: 0, limit: 3 },
    },
}

/* ─── Helpers ─────────────────────────────────────────────────────── */
function resolveAvatar(src?: string | null): string | null {
    if (!src) return null
    if (src.startsWith('http://') || src.startsWith('https://')) return src
    if (src.startsWith('/static/')) return `${BASE_URL}${src}`
    return src
}

function fmt(iso?: string | null, opts?: Intl.DateTimeFormatOptions): string {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('en-GB', opts ?? { day: 'numeric', month: 'short', year: 'numeric' })
}

function tierLabel(tier: string): string {
    const t = tier.toUpperCase()
    if (t === 'FREE') return 'Free'
    if (t === 'PRO') return 'Pro'
    if (t === 'PREMIUM') return 'Premium'
    if (t === 'GRANDFATHERED') return 'Legacy'
    return tier
}

function tierIsPremium(tier: string): boolean {
    const t = tier.toUpperCase()
    return t === 'PRO' || t === 'PREMIUM' || t === 'GRANDFATHERED'
}

/* ─── Spinner ─────────────────────────────────────────────────────── */
function Spinner({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            style={{ animation: 'lx-spin 0.75s linear infinite', flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
    )
}

/* ─── Toast ───────────────────────────────────────────────────────── */
function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
    useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white text-[14px] font-semibold"
            style={{ background: type === 'success' ? '#059669' : '#dc2626', boxShadow: '0 8px 32px rgba(0,0,0,0.16)' }}>
            {type === 'success' ? <BadgeCheck size={17} strokeWidth={2} /> : <span>✕</span>}
            {msg}
        </div>
    )
}

/* ─── Avatar ──────────────────────────────────────────────────────── */
function UserAvatar({ src, name, size = 96, editable = false, loading = false, onUpload }: {
    src?: string | null
    name?: string | null
    size?: number
    editable?: boolean
    loading?: boolean
    onUpload?: (file: File) => void
}) {
    const [err, setErr] = useState(false)
    const finalSrc = resolveAvatar(src)
    const initials = (name ?? 'U').split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    const inputRef = useRef<HTMLInputElement>(null)
    useEffect(() => { setErr(false) }, [src])

    return (
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            {finalSrc && !err ? (
                <img src={finalSrc} alt={name || 'User'} onError={() => setErr(true)}
                    style={{
                        width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover',
                        border: '3px solid white', boxShadow: '0 0 0 3px rgba(99,102,241,0.25)'
                    }} />
            ) : (
                <div style={{
                    width: '100%', height: '100%', borderRadius: '50%',
                    background: `linear-gradient(135deg, ${C2}, ${C1})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '3px solid white', boxShadow: '0 0 0 3px rgba(99,102,241,0.25)'
                }}>
                    <span style={{ color: 'white', fontSize: size * 0.34, fontWeight: 700 }}>{initials}</span>
                </div>
            )}
            {editable && (
                <>
                    <button onClick={() => !loading && inputRef.current?.click()} aria-label="Change photo"
                        className="absolute bottom-0.5 right-0.5 w-8 h-8 rounded-full flex items-center justify-center text-white"
                        style={{ background: C2, border: '2px solid white', boxShadow: '0 2px 8px rgba(79,70,229,0.4)', padding: 0 }}>
                        {loading ? <Spinner size={13} /> : <Pencil size={13} strokeWidth={2.5} />}
                    </button>
                    <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f && onUpload) { onUpload(f); e.target.value = '' } }} />
                </>
            )}
        </div>
    )
}

/* ─── InfoRow ─────────────────────────────────────────────────────── */
function InfoRow({ icon, label, value, onEdit, isLast = false }: {
    icon: React.ReactNode
    label: string
    value?: string | null
    onEdit?: () => void
    isLast?: boolean
}) {
    return (
        <div onClick={onEdit}
            className={`flex items-center gap-3 py-2.5 ${isLast ? '' : 'border-b border-[#f1f5f9]'}`}
            style={{ cursor: onEdit ? 'pointer' : 'default' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(99,102,241,0.07)' }}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase m-0">{label}</p>
                <p className={`text-[13px] mt-0.5 m-0 truncate ${value ? 'font-medium text-gray-800' : 'italic text-gray-300'}`}>
                    {value || 'Not set'}
                </p>
            </div>
            {onEdit && <Pencil size={12} className="shrink-0" style={{ color: '#c4b5fd' }} />}
        </div>
    )
}

/* ─── Card ────────────────────────────────────────────────────────── */
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-white rounded-2xl border border-[#eef1f7] ${className}`}
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            {children}
        </div>
    )
}

/* ─── CardHeader ──────────────────────────────────────────────────── */
function CardHeader({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(99,102,241,0.08)' }}>
                {icon}
            </div>
            <div className="min-w-0">
                <h3 className="text-[14px] font-semibold text-gray-900 m-0 leading-tight">{title}</h3>
                {sub && <p className="text-[11px] text-gray-400 m-0 mt-0.5 truncate">{sub}</p>}
            </div>
        </div>
    )
}

/* ─── StatMini ────────────────────────────────────────────────────── */
function StatMini({ icon, value, label, sub, accent }: {
    icon: React.ReactNode; value: string | number; label: string; sub?: string; accent?: string
}) {
    return (
        <div className="rounded-xl border border-[#eef1f7] p-3.5 flex flex-col gap-1"
            style={{ background: '#fafbff', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div>{icon}</div>
            <span className="text-[22px] font-bold leading-none mt-1" style={{ color: accent ?? '#111827' }}>{value}</span>
            <span className="text-[11px] font-medium text-gray-500">{label}</span>
            {sub && <span className="text-[10px] text-gray-400">{sub}</span>}
        </div>
    )
}

/* ─── QuotaBar ────────────────────────────────────────────────────── */
function QuotaBar({ label, used, limit, color, Icon, onClick }: {
    label: string; used: number; limit: number; color: string
    Icon?: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>
    onClick?: () => void
}) {
    const unlimited = limit === -1
    const pct = unlimited ? 100 : Math.min(100, (used / limit) * 100)
    const remaining = unlimited ? '∞' : Math.max(0, limit - used)
    return (
        <div
            onClick={onClick}
            className="p-3 rounded-xl border border-[#f1f5f9] flex flex-col gap-2"
            style={{
                background: '#fafafa',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'box-shadow 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => { if (onClick) { (e.currentTarget as HTMLDivElement).style.borderColor = color + '55'; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 2px 12px ${color}18` } }}
            onMouseLeave={e => { if (onClick) { (e.currentTarget as HTMLDivElement).style.borderColor = '#f1f5f9'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' } }}
        >
            <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                    {Icon && <Icon size={12} color={color} strokeWidth={2} />}
                    <span className="text-[12px] font-semibold text-gray-700 truncate">{label}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] font-bold rounded px-1.5 py-0.5"
                        style={{ color, background: color + '18' }}>
                        {unlimited ? '∞' : `${remaining} left`}
                    </span>
                    {onClick && <ArrowRight size={10} color={color} strokeWidth={2.5} />}
                </div>
            </div>
            <div className="h-1 bg-[#eef1f7] rounded-full overflow-hidden">
                <div style={{
                    width: `${pct}%`, height: '100%',
                    background: unlimited ? color + '40' : color,
                    borderRadius: 999, transition: 'width 0.7s cubic-bezier(.4,0,.2,1)'
                }} />
            </div>
            {!unlimited && (
                <span className="text-[10px] text-gray-400">{used} / {limit} used this week</span>
            )}
        </div>
    )
}

/* ─── ReferralInline ──────────────────────────────────────────────── */
function ReferralInline({ code, referralUrl, onCopy }: {
    code: string
    referralUrl: string | null
    onCopy: (t: string, l: string) => void
}) {
    return (
        <div className="mt-3 pt-3 flex flex-col gap-3">
            <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase m-0">
                Referral Code
            </p>

            {/* Code row */}
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#ddd6fe]"
                style={{ background: 'rgba(99,102,241,0.04)' }}>
                <BadgeCheck size={13} color={C1} strokeWidth={2} className="shrink-0" />
                <span className="flex-1 text-[16px] font-black select-all"
                    style={{ color: C2, fontFamily: "'SF Mono','Fira Code','Courier New',monospace", letterSpacing: '0.22em' }}>
                    {code}
                </span>
                <button
                    onClick={() => onCopy(code, 'Code copied!')}
                    className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg cursor-pointer shrink-0"
                    style={{ color: C2, background: 'white', border: '1px solid #c4b5fd' }}>
                    <Copy size={11} strokeWidth={2} /> Copy
                </button>
            </div>

            {/* Invite link */}
            {referralUrl && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#e5e7eb]"
                    style={{ background: '#fafafa' }}>
                    <Link size={12} color="#9ca3af" strokeWidth={2} className="shrink-0" />
                    <span className="flex-1 text-[11px] text-gray-400 truncate">{referralUrl}</span>
                    <button
                        onClick={() => onCopy(referralUrl, 'Link copied!')}
                        className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg cursor-pointer shrink-0"
                        style={{ color: '#6b7280', background: 'white', border: '1px solid #e5e7eb' }}>
                        <Copy size={11} strokeWidth={2} /> Copy
                    </button>
                </div>
            )}

            {/* How it works */}
            <div className="rounded-xl border border-[#eef1f7] px-3 py-3" style={{ background: '#fafbff' }}>
                <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase m-0 mb-2">
                    How it works
                </p>
                <div className="flex flex-col gap-2">
                    {[
                        'Share your code or invite link with a friend',
                        'Your friend signs up using your code',
                        'Both of you receive rewards automatically 🎉',
                    ].map((step, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-px"
                                style={{ background: 'rgba(99,102,241,0.1)', color: C2 }}>
                                {i + 1}
                            </span>
                            <span className="text-[12px] text-gray-600 leading-snug">{step}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════════ */
export default function ProfilePage() {
    const { user, setUser } = useAuth()
    const router = useRouter()

    const [quota, setQuota] = useState<QuotaOut | null>(null)
    const [dataLoading, setDataLoading] = useState(true)
    const [quotaError, setQuotaError] = useState(false)
    const [referralUrl, setReferralUrl] = useState<string | null>(null)
    const [avatarLoading, setAvatarLoading] = useState(false)
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 40)
        return () => clearTimeout(t)
    }, [])

    const loadQuota = useCallback(() => {
        setDataLoading(true)
        setQuotaError(false)
        quotaApi.getMyQuota()
            .then(q => { setQuota(q); setDataLoading(false) })
            .catch(() => {
                // API ishlamasa mock data ko'rsatamiz
                setQuota(MOCK_QUOTA)
                setQuotaError(false)
                setDataLoading(false)
            })
    }, [])

    useEffect(() => {
        if (!user) return
        loadQuota()
        userApi.getReferral()
            .then(r => {
                if (r.referral_url) {
                    const base = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin
                    setReferralUrl(`${base}${r.referral_url}`)
                }
            })
            .catch(() => { })
    }, [user, loadQuota])

    if (!user) return null

    const meta = user.meta
    const cefr = meta?.cefr
    const isPaid = tierIsPremium(user.subscription_tier)

    async function handleAvatarUpload(file: File) {
        setAvatarLoading(true)
        try {
            await userApi.uploadAvatar(file)
            const fresh = await userApi.me()
            setUser(fresh)
            setToast({ msg: 'Profile photo updated!', type: 'success' })
        } catch (err: unknown) {
            const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
            setToast({ msg: detail || 'Upload failed. Max size 2 MB.', type: 'error' })
        } finally {
            setAvatarLoading(false)
        }
    }

    function handleCopy(text: string, label: string) {
        navigator.clipboard.writeText(text)
        setToast({ msg: label, type: 'success' })
    }

    const goSettings = () => router.push('/profile/settings')
    const goExams = () => router.push('/exams')

    const fade = (delay: number) => ({
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.45s ease ${delay}ms, transform 0.45s ease ${delay}ms`,
    })

    const readingQuotaValue = (() => {
        if (dataLoading) return '…'
        if (!quota) return '–'
        const q = quota.quotas['READING']
        if (!q) return '0'
        return q.limit === -1 ? `${q.used}` : `${q.used}/${q.limit}`
    })()

    // phone InfoRow oxirgi row bo'ladi, referral_code yo'q bo'lsa
    const hasReferral = !!user.referral_code

    return (
        <>
            <style>{`@keyframes lx-spin { to { transform: rotate(360deg) } }`}</style>
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

            <div className="w-full min-h-full bg-[#f8f9fd] px-4 md:px-8 py-6 flex flex-col gap-5">

                {/* ══ HERO ═════════════════════════════════════════════ */}
                <div
                    className="relative w-full rounded-2xl overflow-hidden"
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'translateY(0)' : 'translateY(18px)',
                        transition: 'opacity 0.5s ease 0.05s, transform 0.5s ease 0.05s',
                        background: 'linear-gradient(135deg, #3730a3 0%, #4f46e5 45%, #6366f1 100%)',
                        boxShadow: '0 20px 50px -10px rgba(79,70,229,0.38)',
                    }}
                >
                    <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full pointer-events-none"
                        style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <div className="absolute -bottom-10 -left-6 w-40 h-40 rounded-full pointer-events-none"
                        style={{ background: 'rgba(255,255,255,0.05)' }} />

                    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5 px-6 py-6">
                        <div className="flex items-center gap-4">
                            <UserAvatar src={user.avatar} name={user.full_name} size={88}
                                editable loading={avatarLoading} onUpload={handleAvatarUpload} />
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-[20px] font-bold text-white m-0 leading-tight">
                                        {user.full_name || 'No name'}
                                    </h1>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                        style={{ background: 'rgba(255,255,255,0.18)', color: '#e0e7ff' }}>
                                        LVL {user.level}
                                    </span>
                                    {user.streak > 0 && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                                            style={{ background: 'rgba(251,113,133,0.25)', color: '#fecdd3' }}>
                                            <Flame size={10} strokeWidth={2} /> {user.streak}d streak
                                        </span>
                                    )}
                                </div>
                                <p className="text-indigo-200 text-[12px] m-0">
                                    {user.username ? `@${user.username}` : 'No username'}
                                </p>
                                <div className="flex items-center gap-4 mt-0.5 flex-wrap">
                                    {user.email && (
                                        <span className="flex items-center gap-1 text-[11px] text-indigo-200">
                                            <Mail size={11} strokeWidth={2} /> {user.email}
                                        </span>
                                    )}
                                    {fmt(user.created_at, { month: 'short', year: 'numeric' }) && (
                                        <span className="flex items-center gap-1 text-[11px] text-indigo-200">
                                            <Calendar size={11} strokeWidth={2} />
                                            {fmt(user.created_at, { month: 'short', year: 'numeric' })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="sm:ml-auto flex flex-col items-start sm:items-end gap-2 shrink-0">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                                style={{
                                    background: isPaid ? 'rgba(251,191,36,0.18)' : 'rgba(255,255,255,0.12)',
                                    border: `1px solid ${isPaid ? 'rgba(251,191,36,0.35)' : 'rgba(255,255,255,0.2)'}`,
                                }}>
                                {isPaid
                                    ? <Crown size={12} color="#fbbf24" fill="#fbbf24" strokeWidth={1.5} />
                                    : <Zap size={12} color="rgba(255,255,255,0.7)" strokeWidth={2} />}
                                <span className="text-[11px] font-bold"
                                    style={{ color: isPaid ? '#fbbf24' : 'rgba(255,255,255,0.8)' }}>
                                    {tierLabel(user.subscription_tier)}
                                </span>
                            </div>
                            {cefr?.level && (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                                    style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#a78bfa', display: 'inline-block', flexShrink: 0 }} />
                                    <span className="text-[11px] font-bold text-white">CEFR {cefr.level}</span>
                                </div>
                            )}
                            <button onClick={goSettings}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold text-white"
                                style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.28)', transition: 'background 0.2s' }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.24)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}>
                                <Pencil size={12} strokeWidth={2} /> Edit Profile
                            </button>
                        </div>
                    </div>
                </div>

                {/* ══ TWO-COLUMN ═══════════════════════════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

                    {/* ── LEFT: Personal Info ── */}
                    <div style={fade(100)}>
                        <Card>
                            <div className="px-5 pt-5 pb-4 border-b border-[#f1f5f9]">
                                <CardHeader
                                    icon={<User size={16} color={C1} strokeWidth={2} />}
                                    title="Personal Information"
                                />
                            </div>
                            <div className="px-5 pt-3 pb-4 flex flex-col">
                                {/* isLast prop bilan last:border-0 muammosini hal qilamiz */}
                                <InfoRow icon={<User size={14} color={C1} strokeWidth={2} />} label="Full Name" value={user.full_name} onEdit={goSettings} />
                                <InfoRow icon={<AtSign size={14} color={C1} strokeWidth={2} />} label="Username" value={user.username ? `@${user.username}` : null} onEdit={goSettings} />
                                <InfoRow icon={<Mail size={14} color={C1} strokeWidth={2} />} label="Email" value={user.email} onEdit={goSettings} />
                                {/* Phone — referral bo'lmasa bu oxirgi row, isLast=true */}
                                <InfoRow
                                    icon={<Phone size={14} color={C1} strokeWidth={2} />}
                                    label="Phone"
                                    value={user.phone}
                                    onEdit={goSettings}
                                    isLast={!hasReferral}
                                />

                                {/* Referral — phone bilan orasida bitta border-t bor, ikkinchi line yo'q */}
                                {hasReferral && (
                                    <ReferralInline
                                        code={user.referral_code!}
                                        referralUrl={referralUrl}
                                        onCopy={handleCopy}
                                    />
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* ── RIGHT: Stats + Quota ── */}
                    <div className="flex flex-col gap-5">

                        {/* Progress Overview */}
                        <div style={fade(130)}>
                            <Card>
                                <div className="px-5 pt-5 pb-4 border-b border-[#f1f5f9]">
                                    <CardHeader
                                        icon={<TrendingUp size={16} color={C1} strokeWidth={2} />}
                                        title="Progress Overview"
                                        sub="Your learning stats at a glance"
                                    />
                                </div>
                                <div className="px-5 pt-4 pb-5">
                                    <div className="grid grid-cols-3 gap-3">
                                        <StatMini
                                            icon={<Flame size={19} color="#f43f5e" strokeWidth={2} />}
                                            value={user.streak}
                                            label="Day Streak"
                                            sub={user.streak >= 7 ? 'Weekly!' : 'Keep going'}
                                            accent="#f43f5e"
                                        />
                                        <StatMini
                                            icon={<Zap size={19} color={C1} strokeWidth={2} />}
                                            value={`Lv.${user.level}`}
                                            label="Level"
                                            accent={C2}
                                        />
                                        <StatMini
                                            icon={<LayoutGrid size={19} color={C1} strokeWidth={2} />}
                                            value={readingQuotaValue}
                                            label="Tests Done"
                                            sub="Reading"
                                            accent={C2}
                                        />
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Weekly Quota — skeleton */}
                        {dataLoading && (
                            <div style={fade(160)}>
                                <Card>
                                    <div className="px-5 pt-5 pb-4 border-b border-[#f1f5f9]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-gray-100 animate-pulse shrink-0" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3.5 bg-gray-100 rounded animate-pulse w-28" />
                                                <div className="h-3 bg-gray-100 rounded animate-pulse w-40" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-5 pt-4 pb-5 grid grid-cols-2 gap-3">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="h-16 rounded-xl bg-gray-50 animate-pulse border border-[#f1f5f9]" />
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* Weekly Quota — loaded (real yoki mock) */}
                        {!dataLoading && quota && (
                            <div style={fade(160)}>
                                <Card>
                                    <div className="px-5 pt-5 pb-4 border-b border-[#f1f5f9] flex items-center justify-between gap-3">
                                        <CardHeader
                                            icon={<LayoutGrid size={16} color={C1} strokeWidth={2} />}
                                            title="Weekly Quota"
                                            sub={`Resets weekly · ${tierLabel(quota.tier)} plan`}
                                        />
                                        {!tierIsPremium(quota.tier) && (
                                            <button onClick={() => router.push('/subscription')}
                                                className="text-[11px] font-bold px-3 py-1.5 rounded-lg shrink-0"
                                                style={{ color: C2, background: 'rgba(99,102,241,0.08)', border: 'none', cursor: 'pointer' }}>
                                                Upgrade ↗
                                            </button>
                                        )}
                                    </div>
                                    <div className="px-5 pt-4 pb-5 grid grid-cols-2 gap-3">
                                        {SKILL_CONFIG.map(({ key, label, Icon, color }) => {
                                            const q = quota.quotas[key as SkillKey]
                                            if (!q) return (
                                                <div key={key} className="p-3 rounded-xl border border-dashed border-[#e5e7eb] flex flex-col gap-1" style={{ background: '#fafafa' }}>
                                                    <div className="flex items-center gap-1.5">
                                                        <Icon size={12} color="#d1d5db" strokeWidth={2} />
                                                        <p className="text-[11px] font-semibold text-gray-300 m-0">{label}</p>
                                                    </div>
                                                    <p className="text-[10px] text-gray-300 m-0">Not included in {tierLabel(quota.tier)}</p>
                                                </div>
                                            )
                                            return (
                                                <QuotaBar
                                                    key={key}
                                                    label={label}
                                                    used={q.used}
                                                    limit={q.limit}
                                                    color={color}
                                                    Icon={Icon}
                                                    onClick={goExams}
                                                />
                                            )
                                        })}
                                    </div>

                                    {/* Exams sahifasiga yo'naltiruvchi banner */}
                                    <div className="mx-5 mb-5">
                                        <button
                                            onClick={goExams}
                                            className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(99,102,241,0.07) 0%, rgba(124,58,237,0.07) 100%)',
                                                border: '1px solid rgba(99,102,241,0.15)',
                                                cursor: 'pointer',
                                            }}>
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                                    style={{ background: 'rgba(99,102,241,0.12)' }}>
                                                    <BookOpen size={13} color={C2} strokeWidth={2} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[12px] font-semibold m-0" style={{ color: C2 }}>Start a Practice Exam</p>
                                                    <p className="text-[10px] text-gray-400 m-0">Use your weekly quota</p>
                                                </div>
                                            </div>
                                            <ArrowRight size={14} color={C2} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-[11px] text-gray-400 pb-1 m-0"
                    style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease 400ms' }}>
                    Lexis · Your personal IELTS coach
                </p>
            </div>
        </>
    )
}