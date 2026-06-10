'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    BookOpen, Clock, Target, Play, Eye,
    Lock, TrendingUp, Timer, Award, AlertCircle,
    RefreshCw, BarChart2, CheckCircle, Sparkles,
    ArrowRight, Zap, Star,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type ExamStatus = 'completed' | 'available' | 'locked'

type Exam = {
    id: string | number
    title: string
    type: 'Academic' | 'General'
    sections: number
    questions: number
    duration: number
    bandRange: string
    status: ExamStatus
    score: number | null
    band: number | null
    completedAt: string | null
    locked: boolean
    popular?: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const C1 = '#6366f1'
const C2 = '#4f46e5'

const LEXIS_BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://apply.lexis.uz'

const FALLBACK_EXAMS: Exam[] = [
    {
        id: 1, title: 'Academic Mock Test 1', type: 'Academic',
        sections: 3, questions: 40, duration: 60, bandRange: '5.5–8.0',
        status: 'completed', score: 34, band: 7.0, completedAt: '2024-05-10', locked: false,
    },
    {
        id: 2, title: 'Academic Mock Test 2', type: 'Academic',
        sections: 3, questions: 40, duration: 60, bandRange: '6.0–8.5',
        status: 'completed', score: 28, band: 6.0, completedAt: '2024-05-03', locked: false,
    },
    {
        id: 3, title: 'General Training Mock 1', type: 'General',
        sections: 3, questions: 40, duration: 60, bandRange: '4.5–7.5',
        status: 'available', score: null, band: null, completedAt: null, locked: false,
    },
    {
        id: 4, title: 'Academic Mock Test 3', type: 'Academic',
        sections: 3, questions: 40, duration: 60, bandRange: '6.5–9.0',
        status: 'available', score: null, band: null, completedAt: null, locked: false, popular: true,
    },
    {
        id: 5, title: 'Cambridge Practice Set A', type: 'Academic',
        sections: 3, questions: 40, duration: 60, bandRange: '7.0–9.0',
        status: 'locked', score: null, band: null, completedAt: null, locked: true,
    },
    {
        id: 6, title: 'Cambridge Practice Set B', type: 'Academic',
        sections: 3, questions: 40, duration: 60, bandRange: '7.0–9.0',
        status: 'locked', score: null, band: null, completedAt: null, locked: true,
    },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildExamUrl(id: string | number) {
    return `${LEXIS_BASE}/mock-exams/${id}`
}

function buildReviewUrl(id: string | number) {
    return `${LEXIS_BASE}/mock-exams/${id}/review`
}

// ─── StatItem (matches TestSelectionPage) ─────────────────────────────────────

function StatItem({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
    return (
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Icon size={12} className="shrink-0" />
            <span>{label}</span>
        </div>
    )
}

// ─── Hero Banner ──────────────────────────────────────────────────────────────

function HeroBanner({
    visible,
    completed,
    bestBand,
    avgBand,
}: {
    visible: boolean
    completed: number
    bestBand: number | string
    avgBand: number | string
}) {
    const stats = [
        { icon: Zap, value: String(completed), label: 'Completed' },
        { icon: Star, value: String(bestBand), label: 'Best Band' },
        { icon: BarChart2, value: String(avgBand), label: 'Avg Band' },
    ]

    return (
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
            {/* Blobs */}
            <div
                className="absolute -top-12 -right-12 w-56 h-56 rounded-full pointer-events-none"
                style={{ background: 'rgba(255,255,255,0.06)' }}
            />
            <div
                className="absolute -bottom-14 -left-8 w-44 h-44 rounded-full pointer-events-none"
                style={{ background: 'rgba(255,255,255,0.05)' }}
            />

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 px-7 py-7">
                {/* Left */}
                <div className="flex flex-col gap-3 max-w-md">
                    <div
                        className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full text-[11px] font-semibold"
                        style={{
                            background: 'rgba(255,255,255,0.15)',
                            color: '#e0e7ff',
                            border: '1px solid rgba(255,255,255,0.22)',
                        }}
                    >
                        <Sparkles size={10} />
                        Full-length simulation tests
                    </div>

                    <h1 className="text-[22px] sm:text-[26px] font-bold text-white leading-tight tracking-tight">
                        Mock Exams.{' '}
                        <span style={{ color: '#c7d2fe' }}>Real conditions.</span>
                    </h1>

                    <p className="text-[13px] text-indigo-200 leading-relaxed max-w-xs">
                        Timed IELTS simulation tests — exactly like the real exam. Get your band score instantly.
                    </p>

                    <button
                        className="self-start mt-0.5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold"
                        style={{
                            background: 'rgba(255,255,255,0.15)',
                            color: '#fff',
                            border: '1.5px solid rgba(255,255,255,0.28)',
                            backdropFilter: 'blur(6px)',
                            transition: 'background 0.2s ease',
                        }}
                        onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.24)')
                        }
                        onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)')
                        }
                    >
                        Start for free <ArrowRight size={13} />
                    </button>
                </div>

                {/* Right: stats */}
                <div className="flex sm:flex-col gap-4 sm:gap-3 shrink-0">
                    {stats.map(({ icon: Icon, value, label }) => (
                        <div key={label} className="flex items-center gap-2.5">
                            <div
                                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: 'rgba(255,255,255,0.14)' }}
                            >
                                <Icon size={15} className="text-white" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-[15px] leading-none">{value || '—'}</p>
                                <p className="text-indigo-200 text-[11px] mt-0.5">{label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ─── Tips Row ─────────────────────────────────────────────────────────────────

function ExamTips({ visible }: { visible: boolean }) {
    const tips = [
        { icon: Timer, label: 'Strict Timing', desc: 'Exactly 60 min — real exam conditions', color: C1 },
        { icon: AlertCircle, label: 'No Pausing', desc: 'Timer runs continuously once started', color: '#e11d48' },
        { icon: Award, label: 'Instant Results', desc: 'Band score and breakdown shown right away', color: '#059669' },
    ]

    return (
        <div
            className="grid sm:grid-cols-3 gap-3"
            style={{
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.5s ease 0.18s',
            }}
        >
            {tips.map(({ icon: Icon, label, desc, color }) => (
                <div
                    key={label}
                    className="relative rounded-2xl bg-white p-4 flex items-center gap-3"
                    style={{
                        border: '1.5px solid #eef1f7',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    }}
                >
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: color + '18' }}
                    >
                        <Icon size={15} style={{ color }} />
                    </div>
                    <div>
                        <p className="text-[12.5px] font-bold text-gray-800">{label}</p>
                        <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{desc}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}

// ─── Exam Card ────────────────────────────────────────────────────────────────

function ExamCard({ exam, index }: { exam: Exam; index: number }) {
    const [hovered, setHovered] = useState(false)
    const [visible, setVisible] = useState(false)

    const isCompleted = exam.status === 'completed'
    const isLocked = exam.locked

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 80 + index * 120)
        return () => clearTimeout(t)
    }, [index])

    const handleStart = () => {
        if (isLocked) {
            window.location.href = `${LEXIS_BASE}/billing`
            return
        }
        window.location.href = buildExamUrl(exam.id)
    }

    const handleReview = () => {
        window.location.href = buildReviewUrl(exam.id)
    }

    return (
        <div
            onMouseEnter={() => !isLocked && setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => !isLocked && !isCompleted && handleStart()}
            className={isLocked ? 'cursor-default' : isCompleted ? 'cursor-default' : 'cursor-pointer'}
            style={{
                opacity: visible ? (isLocked ? 0.6 : 1) : 0,
                transform: visible ? 'translateY(0px)' : 'translateY(24px)',
                transition: 'opacity 0.45s ease, transform 0.45s ease',
            }}
        >
            <div className="relative h-full">
                <div
                    className="relative rounded-2xl bg-white p-5 flex flex-col gap-4 h-full"
                    style={{
                        border: !isLocked && hovered ? `2px solid ${C2}` : '1.5px solid #eef1f7',
                        boxShadow: !isLocked && hovered
                            ? '0 16px 40px -8px rgba(99,102,241,0.18)'
                            : '0 1px 4px rgba(0,0,0,0.04)',
                        transform: !isLocked && hovered ? 'translateY(-4px)' : 'translateY(0)',
                        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.2s ease',
                    }}
                >
                    {/* Popular badge */}
                    {exam.popular && !isLocked && (
                        <span
                            className="absolute -top-3 left-5 text-[10px] font-bold px-3 py-1 rounded-full text-white"
                            style={{ background: C2 }}
                        >
                            Most popular
                        </span>
                    )}

                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span
                                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
                                    style={{ background: 'rgba(99,102,241,0.08)', color: C2 }}
                                >
                                    {exam.type}
                                </span>
                                {isCompleted && (
                                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700">
                                        ✓ Completed
                                    </span>
                                )}
                                {isLocked && (
                                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700">
                                        👑 Premium
                                    </span>
                                )}
                            </div>
                            <h3 className="text-[14px] font-semibold text-gray-900 leading-snug">
                                {exam.title}
                            </h3>
                        </div>

                        {isCompleted && exam.band != null && (
                            <div
                                className="text-center shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center"
                                style={{ background: 'rgba(99,102,241,0.08)' }}
                            >
                                <p
                                    className="text-[18px] font-black leading-none"
                                    style={{ color: C2 }}
                                >
                                    {exam.band}
                                </p>
                                <p className="text-[9px] font-semibold text-gray-400 uppercase mt-0.5">Band</p>
                            </div>
                        )}
                    </div>

                    {/* Meta stats */}
                    <div className="flex flex-wrap gap-3">
                        <StatItem icon={BookOpen} label={`${exam.sections} sections`} />
                        <StatItem icon={Target} label={`${exam.questions} questions`} />
                        <StatItem icon={Clock} label={`${exam.duration} min`} />
                        <StatItem icon={TrendingUp} label={exam.bandRange} />
                    </div>

                    {/* Section tags */}
                    <div className="flex flex-wrap gap-1.5">
                        {['Reading', 'Listening', 'Writing'].map((s) => (
                            <span
                                key={s}
                                className="text-[11px] px-2.5 py-1 rounded-lg font-medium"
                                style={{ background: 'rgba(99,102,241,0.08)', color: C2 }}
                            >
                                {s}
                            </span>
                        ))}
                    </div>

                    {/* Progress bar (completed only) */}
                    {isCompleted && exam.score != null && (
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[11px]">
                                <span className="text-gray-400">Score</span>
                                <span className="font-bold text-gray-700">
                                    {exam.score}/{exam.questions}
                                </span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden bg-indigo-50">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                        width: `${Math.round((exam.score / exam.questions) * 100)}%`,
                                        background: C1,
                                    }}
                                />
                            </div>
                            {exam.completedAt && (
                                <p className="text-[10px] text-gray-400">
                                    {new Date(exam.completedAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleStart() }}
                            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white flex items-center justify-center gap-1.5"
                            style={
                                isLocked
                                    ? { background: '#f1f5f9', color: '#94a3b8' }
                                    : {
                                        background: !isLocked && hovered
                                            ? `linear-gradient(135deg, ${C1} 0%, ${C2} 100%)`
                                            : C2,
                                        transform: !isLocked && hovered ? 'scale(1.02)' : 'scale(1)',
                                        transition: 'background 0.3s ease, transform 0.2s ease',
                                        boxShadow: !isLocked && hovered
                                            ? '0 6px 18px rgba(79,70,229,0.32)'
                                            : 'none',
                                    }
                            }
                        >
                            {isLocked ? (
                                <><Lock size={12} /> Unlock</>
                            ) : isCompleted ? (
                                <><Play size={12} /> Retake →</>
                            ) : (
                                <><Play size={12} /> Start Exam →</>
                            )}
                        </button>

                        {isCompleted && (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleReview() }}
                                className="h-10 px-3.5 rounded-xl flex items-center justify-center transition-opacity hover:opacity-70"
                                style={{ background: 'rgba(99,102,241,0.08)', color: C2 }}
                                title="Review answers"
                            >
                                <Eye size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
    return (
        <div
            className="rounded-2xl bg-white p-5 flex flex-col gap-4 animate-pulse"
            style={{ border: '1.5px solid #eef1f7' }}
        >
            <div className="flex gap-2">
                <div className="h-5 w-16 rounded-lg bg-gray-100" />
            </div>
            <div className="h-4 w-3/4 rounded bg-gray-100" />
            <div className="flex gap-3">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-3 w-14 rounded bg-gray-100" />
                ))}
            </div>
            <div className="flex gap-1.5">
                {[1, 2, 3].map(i => <div key={i} className="h-6 w-16 rounded-lg bg-gray-100" />)}
            </div>
            <div className="h-9 rounded-xl bg-gray-100 mt-auto" />
        </div>
    )
}

// ─── Filter Pill ──────────────────────────────────────────────────────────────

function FilterPill({
    label,
    active,
    onClick,
    dark = false,
}: {
    label: string
    active: boolean
    onClick: () => void
    dark?: boolean
}) {
    return (
        <button
            onClick={onClick}
            className="px-3 h-9 rounded-xl text-xs font-semibold transition-all"
            style={
                active
                    ? {
                        background: dark ? '#1e1b4b' : C1,
                        color: 'white',
                    }
                    : {
                        background: 'white',
                        color: '#6b7280',
                        border: '1.5px solid #eef1f7',
                    }
            }
        >
            {label}
        </button>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type TypeFilter = 'All' | 'Academic' | 'General'
type StatusFilter = 'All' | 'Available' | 'Completed'

export default function MockExamsPage() {
    const [exams, setExams] = useState<Exam[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('All')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 40)
        return () => clearTimeout(t)
    }, [])

    const fetchExams = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`${LEXIS_BASE}/api/mock-exams`, {
                headers: { 'Content-Type': 'application/json' },
            })
            if (!res.ok) throw new Error(`Server error: ${res.status}`)
            const data: Exam[] = await res.json()
            setExams(data)
        } catch (err) {
            console.error('Failed to fetch mock exams:', err)
            setExams(FALLBACK_EXAMS)
            setError('Could not load from server — showing cached data.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchExams() }, [fetchExams])

    // Derived stats
    const completedExams = exams.filter(e => e.status === 'completed')
    const bestBand = completedExams.reduce((b, e) => Math.max(b, e.band ?? 0), 0)
    const avgBand = completedExams.length
        ? +(completedExams.reduce((s, e) => s + (e.band ?? 0), 0) / completedExams.length).toFixed(1)
        : 0

    // Filtered
    const filtered = exams.filter(e => {
        if (typeFilter !== 'All' && e.type !== typeFilter) return false
        if (statusFilter === 'Completed' && e.status !== 'completed') return false
        if (statusFilter === 'Available' && e.status !== 'available') return false
        return true
    })

    return (
        <div className="w-full min-h-full bg-[#f8f9fd] px-5 md:px-8 py-6 flex flex-col gap-6">

            {/* Hero */}
            <HeroBanner
                visible={visible}
                completed={completedExams.length}
                bestBand={bestBand || '—'}
                avgBand={avgBand || '—'}
            />

            {/* Tips */}
            <ExamTips visible={visible} />

            {/* Error banner */}
            {error && (
                <div
                    className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-[12px]"
                    style={{
                        background: '#fffbeb',
                        border: '1.5px solid #fde68a',
                        color: '#92400e',
                    }}
                >
                    <span>{error}</span>
                    <button
                        onClick={fetchExams}
                        className="flex items-center gap-1 font-semibold hover:opacity-70 transition-opacity"
                    >
                        <RefreshCw size={12} /> Retry
                    </button>
                </div>
            )}

            {/* Section divider */}
            <div
                className="flex items-center gap-3"
                style={{
                    opacity: visible ? 1 : 0,
                    transition: 'opacity 0.5s ease 0.28s',
                }}
            >
                <div
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full shrink-0"
                    style={{
                        background: 'rgba(99,102,241,0.08)',
                        border: '1px solid rgba(99,102,241,0.18)',
                    }}
                >
                    <CheckCircle size={12} style={{ color: C1 }} />
                    <span className="text-[11px] font-semibold" style={{ color: C2 }}>
                        All mock exams
                    </span>
                </div>
                <div className="flex-1 h-px" style={{ background: '#eef1f7' }} />

                {/* Filters */}
                <div
                    className="flex flex-wrap gap-2"
                    style={{
                        opacity: visible ? 1 : 0,
                        transition: 'opacity 0.5s ease 0.32s',
                    }}
                >
                    <div className="flex gap-1">
                        {(['All', 'Academic', 'General'] as TypeFilter[]).map(f => (
                            <FilterPill
                                key={f}
                                label={f}
                                active={typeFilter === f}
                                onClick={() => setTypeFilter(f)}
                            />
                        ))}
                    </div>
                    <div className="flex gap-1">
                        {(['All', 'Available', 'Completed'] as StatusFilter[]).map(f => (
                            <FilterPill
                                key={f}
                                label={f}
                                active={statusFilter === f}
                                onClick={() => setStatusFilter(f)}
                                dark
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
                {loading
                    ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                    : filtered.length > 0
                        ? filtered.map((exam, i) => (
                            <ExamCard key={exam.id} exam={exam} index={i} />
                        ))
                        : (
                            <div className="col-span-3 text-center py-16 text-gray-400 text-sm">
                                No exams found for selected filters.
                            </div>
                        )
                }
            </div>

            {/* Footer */}
            <p
                className="text-center text-[11px] text-gray-400 pb-2"
                style={{
                    opacity: visible ? 1 : 0,
                    transition: 'opacity 0.5s ease 0.6s',
                }}
            >
                All free tests available instantly &nbsp;•&nbsp; Premium unlocks full access
            </p>
        </div>
    )
}