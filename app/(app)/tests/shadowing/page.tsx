'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
    Repeat2,
    Clock,
    BarChart2,
    CheckCircle,
    Music2,
    Waves,
    Mic2,
    ChevronRight,
    Lock,
    TrendingUp,
    RefreshCw,
    ArrowLeft,
    FileText,
} from 'lucide-react'
import { PageBanner } from '@/components/layout/PageBanner'
import { quotaApi, hasQuota, resetLabel } from '@/lib/api/quota'
import type { QuotaOut, TestType } from '@/lib/api/quota'

// ── Constants ──────────────────────────────────────────────────────────────
const C1 = '#6366f1'
const C2 = '#4f46e5'

// ── Skill definitions ──────────────────────────────────────────────────────
type Skill = {
    id: string
    testType: TestType
    title: string
    description: string
    icon: React.ElementType
    href: string
    duration: string
    questions: string
    color: string
    light: string
    badge?: string
    available: boolean
}

const SKILLS: Skill[] = [
    {
        id: 'intonation',
        testType: "INTONATION",
        title: 'Intonation',
        description: 'Mirror the natural rise and fall of native speaker speech. Improve how your sentences sound.',
        icon: Music2,
        href: '/tests/shadowing/intonation',
        duration: '10 min',
        questions: '5 exercises',
        color: '#6366f1',
        light: 'rgba(99,102,241,0.08)',
        badge: 'Start here',
        available: true,
    },
    {
        id: 'rhythm',
        testType: 'RHYTHM',
        title: 'Rhythm',
        description: 'Match the stress patterns and linking sounds of natural spoken English.',
        icon: Waves,
        href: '/tests/shadowing/rhythm',
        duration: '10 min',
        questions: '5 exercises',
        color: '#0ea5e9',
        light: 'rgba(14,165,233,0.08)',
        available: false,
    },
    {
        id: 'pronunciation',
        testType: 'PRONUNCIATION',
        title: 'Pronunciation',
        description: 'Focus on individual sounds, minimal pairs, and tricky phonemes in context.',
        icon: Mic2,
        href: '/tests/shadowing/pronunciation',
        duration: '15 min',
        questions: '8 exercises',
        color: '#10b981',
        light: 'rgba(16,185,129,0.08)',
        available: false,
    },
]

// ── Quota badge ────────────────────────────────────────────────────────────
function QuotaBadge({
    testType,
    quota,
    skillColor,
}: {
    testType: TestType
    quota: QuotaOut | null
    skillColor: string
}) {
    if (!quota) return null

    const item = quota.quotas[testType]
    if (!item) {
        return (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
                <Lock size={9} />
                Unavailable
            </span>
        )
    }

    const isUnlimited = item.limit === -1
    const pct = isUnlimited ? 100 : Math.round((item.remaining / item.limit) * 100)
    const low = !isUnlimited && pct <= 20

    return (
        <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: low ? '#ef4444' : skillColor }}
                />
            </div>
            <span className="text-[11px] font-medium" style={{ color: low ? '#ef4444' : '#6b7280' }}>
                {isUnlimited ? '∞' : `${item.remaining}/${item.limit}`}
            </span>
        </div>
    )
}

// ── Skill card ─────────────────────────────────────────────────────────────
function SkillCard({
    skill,
    index,
    quota,
}: {
    skill: Skill
    index: number
    quota: QuotaOut | null
}) {
    const router = useRouter()
    const [hovered, setHovered] = useState(false)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 80 + index * 100)
        return () => clearTimeout(t)
    }, [index])

    const quotaItem = quota?.quotas[skill.testType]
    const quotaBlocked = skill.available && quota !== null && !hasQuota(quota, skill.testType)
    const clickable = skill.available && !quotaBlocked
    const Icon = skill.icon

    return (
        <div
            onClick={() => clickable && router.push(skill.href)}
            onMouseEnter={() => clickable && setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={clickable ? 'cursor-pointer' : 'cursor-default'}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.42s ease, transform 0.42s ease',
            }}
        >
            <div
                className="relative rounded-2xl bg-white p-6 flex flex-col gap-4 h-full"
                style={{
                    border: hovered ? `2px solid ${skill.color}` : '1.5px solid #e5e7eb',
                    boxShadow: hovered
                        ? `0 12px 32px -8px ${skill.color}28`
                        : '0 1px 4px rgba(0,0,0,0.05)',
                    transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
                    transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.18s ease',
                    opacity: skill.available && !quotaBlocked ? 1 : 0.6,
                    minHeight: 180,
                }}
            >
                {/* Badges */}
                {skill.badge && skill.available && !quotaBlocked && (
                    <span
                        className="absolute -top-3 left-5 text-xs font-semibold px-3 py-1 rounded-full text-white"
                        style={{ background: skill.color }}
                    >
                        {skill.badge}
                    </span>
                )}
                {!skill.available && (
                    <span className="absolute -top-3 left-5 text-xs font-medium px-3 py-1 rounded-full text-amber-800 bg-amber-100 border border-amber-200">
                        Coming soon
                    </span>
                )}
                {quotaBlocked && (
                    <span className="absolute -top-3 left-5 text-xs font-medium px-3 py-1 rounded-full text-red-700 bg-red-50 border border-red-200">
                        Quota exhausted · {quotaItem ? resetLabel(quotaItem.resets_at) : ''}
                    </span>
                )}

                {/* Icon row */}
                <div className="flex items-start justify-between">
                    <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                            background: skill.available ? skill.light : 'rgba(0,0,0,0.04)',
                            transform: hovered ? 'scale(1.1) rotate(-4deg)' : 'scale(1) rotate(0deg)',
                            transition: 'transform 0.28s ease',
                        }}
                    >
                        <Icon size={20} style={{ color: skill.available ? skill.color : '#9ca3af' }} />
                    </div>

                    {clickable ? (
                        <ChevronRight
                            size={18}
                            style={{
                                color: hovered ? skill.color : '#d1d5db',
                                transform: hovered ? 'translateX(3px)' : 'translateX(0)',
                                transition: 'all 0.2s ease',
                            }}
                        />
                    ) : (
                        <Lock size={15} className="text-gray-300 mt-0.5" />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1">
                    <h2 className="text-base font-semibold text-gray-900 mb-1">{skill.title}</h2>
                    <p className="text-sm text-gray-500 leading-snug line-clamp-3">{skill.description}</p>
                </div>

                {/* Footer */}
                <div
                    className="flex items-center gap-3 pt-3 flex-wrap"
                    style={{ borderTop: '1px solid #f3f4f6' }}
                >
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Clock size={11} />
                        <span>{skill.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <FileText size={11} />
                        <span>{skill.questions}</span>
                    </div>

                    {skill.available && quota && (
                        <div className="ml-auto">
                            <QuotaBadge
                                testType={skill.testType}
                                quota={quota}
                                skillColor={skill.color}
                            />
                        </div>
                    )}

                    {clickable && !quota && (
                        <span
                            className="ml-auto text-xs font-medium"
                            style={{ color: hovered ? skill.color : '#d1d5db', transition: 'color 0.18s' }}
                        >
                            Start →
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function ShadowingPage() {
    const router = useRouter()
    const [visible, setVisible] = useState(false)
    const [quota, setQuota] = useState<QuotaOut | null>(null)
    const [quotaLoading, setQuotaLoading] = useState(true)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 40)
        return () => clearTimeout(t)
    }, [])

    useEffect(() => {
        quotaApi
            .getMyQuota()
            .then(setQuota)
            .catch(() => setQuota(null))
            .finally(() => setQuotaLoading(false))
    }, [])

    const intonationQuota = quota?.quotas['INTONATION']

    return (
        <div className="w-full min-h-full bg-[#f8f9fd] px-5 md:px-8 py-6 flex flex-col gap-6">

            {/* ── Back button ── */}
            <div
                style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateX(0)' : 'translateX(-12px)',
                    transition: 'opacity 0.4s ease, transform 0.4s ease',
                }}
            >
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors duration-150"
                >
                    <ArrowLeft size={15} />
                    <span>Back</span>
                </button>
            </div>

            {/* ── Banner ── */}
            <PageBanner
                visible={visible}
                tag="Shadowing Practice"
                title={<>Sound like a <span style={{ color: '#c7d2fe' }}>native speaker.</span></>}
                subtitle="Repeat native audio in real time to improve rhythm, intonation, and natural pronunciation."
                ctaLabel="Start shadowing"
                onCta={() => router.push('/tests/shadowing/intonation')}
                stats={[
                    { icon: Clock, value: '15–25 min', label: 'Per session' },
                    { icon: BarChart2, value: 'A2 – C1', label: 'Level range' },
                    { icon: CheckCircle, value: '3 modes', label: 'Intonation · Rhythm · Pronunciation' },
                ]}
            />

            {/* ── Section label ── */}
            <div
                className="flex items-center gap-3"
                style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease 0.28s' }}
            >
                <div
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full shrink-0"
                    style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)' }}
                >
                    <Repeat2 size={12} style={{ color: C1 }} />
                    <span className="text-[11px] font-semibold" style={{ color: C2 }}>Choose a mode</span>
                </div>
                <div className="flex-1 h-px" style={{ background: '#eef1f7' }} />

                {/* Quota stat pill */}
                <div className="flex gap-2 shrink-0">
                    {quotaLoading ? (
                        <div className="flex items-center justify-center px-4 py-2 rounded-xl bg-white border border-gray-100 shadow-sm">
                            <RefreshCw size={13} className="text-gray-300 animate-spin" />
                        </div>
                    ) : intonationQuota ? (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-100 shadow-sm">
                            <span className="text-sm font-bold" style={{ color: C1 }}>
                                {intonationQuota.limit === -1 ? '∞' : intonationQuota.remaining}
                            </span>
                            <span className="text-xs text-gray-400">Sessions left</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-100 shadow-sm">
                            <TrendingUp size={13} className="text-indigo-400" />
                            <span className="text-xs text-gray-400">Free</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Cards grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
                {SKILLS.map((skill, i) => (
                    <SkillCard
                        key={skill.id}
                        skill={skill}
                        index={i}
                        quota={quotaLoading ? null : quota}
                    />
                ))}
            </div>

            {/* ── Footer ── */}
            <p
                className="text-center text-[11px] text-gray-400 pb-2"
                style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease 0.6s' }}
            >
                All sessions are free &nbsp;•&nbsp; More modes coming soon &nbsp;•&nbsp; No account required
            </p>
        </div>
    )
}