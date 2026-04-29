'use client'

import { useAuth } from '@/lib/AuthContext'
import { userApi, type User } from '@/lib/api/user'
import {
    getMyProgress,
    getMyHistory,
    type ProgressOut,
    type AttemptHistoryOut,
} from '@/lib/api/ielts_reading'
import {
    BookOpen,
    Target,
    TrendingUp,
    Award,
    ChevronRight,
    Zap,
    BarChart2,
    Flame,
    AlertCircle,
    RefreshCw,
    Headphones,
    PenLine,
    Mic,
    Eye,
    Calendar,
    Timer,
    Activity,
    CheckCircle2,
    Trophy,
    ArrowUpRight,
    Clock3,
    Layers,
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

// ─── TYPES ─────────────────────────────────────────────────────────
type ActivityLevel = 0 | 1 | 2 | 3 | 4

// ─── UTILS ─────────────────────────────────────────────────────────
function getDaysOnPlatform(joinedAt?: string): number {
    if (!joinedAt) return 1
    const joined = new Date(joinedAt)
    const now = new Date()
    return Math.max(1, Math.floor((now.getTime() - joined.getTime()) / 86_400_000))
}

function formatTime(ms: number): string {
    const totalSec = Math.floor(ms / 1000)
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60
    if (h > 0) return `${h}h ${m}m`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
}

// Build a 12-week activity grid from attempt history
function buildActivityGrid(history: AttemptHistoryOut[]): ActivityLevel[][] {
    const now = new Date()
    const grid: ActivityLevel[][] = []
    for (let w = 11; w >= 0; w--) {
        const week: ActivityLevel[] = []
        for (let d = 6; d >= 0; d--) {
            const day = new Date(now)
            day.setDate(day.getDate() - w * 7 - d)
            const dayStr = day.toDateString()
            const count = history.filter(a => {
                const t = a.finished_at || a.started_at
                return t && new Date(t).toDateString() === dayStr
            }).length
            const level: ActivityLevel =
                count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count <= 4 ? 3 : 4
            week.push(level)
        }
        grid.push(week)
    }
    return grid
}

// ─── SKELETON ──────────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
    return (
        <div
            className={`rounded-lg ${className}`}
            style={{
                background: 'linear-gradient(90deg,#e0e7ff 25%,#c7d2fe 50%,#e0e7ff 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
            }}
        />
    )
}

// ─── ERROR BANNER ──────────────────────────────────────────────────
function ErrorBanner({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl p-4">
            <AlertCircle size={15} className="text-red-400 shrink-0" />
            <p className="text-sm text-red-600 flex-1">Failed to load data. Please try again.</p>
            <button
                onClick={onRetry}
                className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
            >
                <RefreshCw size={12} />
                Retry
            </button>
        </div>
    )
}

// ─── ANIMATED NUMBER ───────────────────────────────────────────────
function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
    const [display, setDisplay] = useState(0)
    const raf = useRef<number>()
    useEffect(() => {
        const duration = 900
        const start = performance.now()
        const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1)
            const ease = 1 - Math.pow(1 - p, 3)
            setDisplay(+(value * ease).toFixed(decimals))
            if (p < 1) raf.current = requestAnimationFrame(tick)
        }
        raf.current = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf.current!)
    }, [value, decimals])
    return <>{display.toFixed(decimals)}</>
}

// ─── FADE IN ───────────────────────────────────────────────────────
function FadeIn({
    children,
    delay = 0,
    className = '',
}: {
    children: React.ReactNode
    delay?: number
    className?: string
}) {
    const [visible, setVisible] = useState(false)
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), delay)
        return () => clearTimeout(t)
    }, [delay])
    return (
        <div
            className={`transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                } ${className}`}
        >
            {children}
        </div>
    )
}

// ─── STAT CARD ─────────────────────────────────────────────────────
type StatCardProps = {
    label: string
    value: number | string
    sub?: string
    icon: React.ElementType
    accent: string
    textAccent: string
    borderAccent: string
    delay: number
    loading?: boolean
}

function StatCard({
    label,
    value,
    sub,
    icon: Icon,
    accent,
    textAccent,
    borderAccent,
    delay,
    loading,
}: StatCardProps) {
    const numeric = typeof value === 'number' ? value : parseFloat(value as string) || 0
    const isNumeric =
        typeof value === 'number' ||
        (!isNaN(parseFloat(value as string)) && !String(value).startsWith('+'))
    const decimals = String(value).includes('.') ? 1 : 0

    if (loading) {
        return (
            <div className="bg-white border border-indigo-50 rounded-2xl p-5 space-y-3">
                <div className="w-10 h-10 rounded-xl animate-pulse bg-indigo-50" />
                <div className="h-3 w-20 rounded animate-pulse bg-indigo-50" />
                <div className="h-7 w-16 rounded animate-pulse bg-indigo-100" />
                <div className="h-3 w-14 rounded animate-pulse bg-indigo-50" />
            </div>
        )
    }

    return (
        <FadeIn delay={delay}>
            <div
                className={`group relative bg-white border ${borderAccent} rounded-2xl p-5 overflow-hidden hover:shadow-lg hover:shadow-indigo-100 hover:-translate-y-0.5 transition-all duration-300`}
            >
                <div
                    className={`absolute top-0 left-5 right-5 h-[2px] ${accent} rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />
                <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${accent} ${textAccent}`}
                >
                    <Icon size={17} />
                </div>
                <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
                <p className="text-[26px] font-bold tracking-tight text-gray-900">
                    {isNumeric && numeric > 0 ? (
                        <AnimatedNumber value={numeric} decimals={decimals} />
                    ) : (
                        <span>{value}</span>
                    )}
                </p>
                {sub && <p className="text-[11px] text-gray-400 mt-1 font-medium">{sub}</p>}
            </div>
        </FadeIn>
    )
}

// ─── SKILL BAR ─────────────────────────────────────────────────────
type SkillConfig = {
    label: string
    value?: number
    icon: React.ElementType
    color: string
    bg: string
}

function SkillBar({ skill, delay }: { skill: SkillConfig; delay: number }) {
    const { label, value, icon: Icon, color, bg } = skill
    const score = value ?? 0
    const percent = (score / 9) * 100
    const [width, setWidth] = useState(0)

    useEffect(() => {
        const t = setTimeout(() => setWidth(percent), delay + 100)
        return () => clearTimeout(t)
    }, [percent, delay])

    return (
        <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
                <Icon size={14} className={color} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-medium text-gray-600">{label}</span>
                    <span className={`text-xs font-bold ${value !== undefined ? color : 'text-gray-300'}`}>
                        {value !== undefined ? value : '—'}
                    </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${color.replace('text-', 'bg-')}`}
                        style={{ width: `${width}%` }}
                    />
                </div>
            </div>
        </div>
    )
}

// ─── CEFR TRACK ────────────────────────────────────────────────────
const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const CEFR_COLORS = [
    'bg-rose-400',
    'bg-orange-400',
    'bg-amber-400',
    'bg-lime-500',
    'bg-emerald-500',
    'bg-indigo-500',
]

function CefrTrack({ level }: { level?: string }) {
    const idx = CEFR_LEVELS.indexOf(level || '')
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <p className="text-sm font-semibold text-gray-700">CEFR Level</p>
                {level ? (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-600 text-white">
                        {level}
                    </span>
                ) : (
                    <span className="text-sm text-gray-300 font-bold">—</span>
                )}
            </div>
            <div className="flex gap-1">
                {CEFR_LEVELS.map((l, i) => (
                    <div key={l} className="flex-1 space-y-1">
                        <div
                            className={`h-2 rounded-sm transition-all duration-500 ${i <= idx ? CEFR_COLORS[i] : 'bg-gray-100'
                                }`}
                            style={{ transitionDelay: `${i * 70}ms` }}
                        />
                        <p className="text-center text-[9px] font-medium text-gray-400">{l}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─── ACTIVITY CALENDAR ─────────────────────────────────────────────
const ACTIVITY_COLORS = ['#e0e7ff', '#a5b4fc', '#818cf8', '#6366f1', '#3730a3']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function ActivityCalendar({
    grid,
    loading,
}: {
    grid: ActivityLevel[][]
    loading: boolean
}) {
    if (loading) {
        return (
            <div className="space-y-1">
                {[...Array(7)].map((_, i) => (
                    <div key={i} className="flex gap-1">
                        {[...Array(12)].map((_, j) => (
                            <div key={j} className="w-3 h-3 rounded-sm animate-pulse bg-indigo-50" />
                        ))}
                    </div>
                ))}
            </div>
        )
    }

    const now = new Date()

    return (
        <div>
            {/* Month labels */}
            <div className="flex gap-1 mb-1 pl-5">
                {grid.map((_, wi) => {
                    const d = new Date(now)
                    d.setDate(d.getDate() - (11 - wi) * 7)
                    return wi % 4 === 0 ? (
                        <div
                            key={wi}
                            className="text-[9px] text-gray-400 font-medium"
                            style={{ minWidth: '14px', marginRight: '2px' }}
                        >
                            {MONTH_NAMES[d.getMonth()]}
                        </div>
                    ) : (
                        <div key={wi} style={{ minWidth: '14px', marginRight: '2px' }} />
                    )
                })}
            </div>

            <div className="flex gap-1">
                {/* Day labels */}
                <div className="flex flex-col gap-1 mr-1">
                    {['M', '', 'W', '', 'F', '', ''].map((l, i) => (
                        <div
                            key={i}
                            className="w-3 h-3 flex items-center justify-center text-[8px] text-gray-400 font-medium"
                        >
                            {l}
                        </div>
                    ))}
                </div>
                {/* Grid */}
                {grid.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-1">
                        {week.map((level, di) => (
                            <div
                                key={di}
                                title={`${level} test${level !== 1 ? 's' : ''}`}
                                className="w-3 h-3 rounded-sm transition-all duration-300 cursor-default"
                                style={{ background: ACTIVITY_COLORS[level] }}
                            />
                        ))}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-1.5 mt-3">
                <span className="text-[10px] text-gray-400">Less</span>
                {ACTIVITY_COLORS.map((c, i) => (
                    <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />
                ))}
                <span className="text-[10px] text-gray-400">More</span>
            </div>
        </div>
    )
}

// ─── SESSION TIMER ─────────────────────────────────────────────────
function SessionTimer({ loginTime }: { loginTime: Date }) {
    const [elapsed, setElapsed] = useState(0)
    const GOAL_MS = 30 * 60 * 1000

    useEffect(() => {
        const tick = () => setElapsed(Date.now() - loginTime.getTime())
        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [loginTime])

    const pct = Math.min(elapsed / GOAL_MS, 1)
    const r = 34
    const circ = 2 * Math.PI * r
    const dash = circ * (1 - pct)
    const mins = Math.floor(elapsed / 60000)
    const goalMet = elapsed >= GOAL_MS

    return (
        <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center">
                <svg width="84" height="84" className="-rotate-90">
                    <circle cx="42" cy="42" r={r} fill="none" stroke="#e0e7ff" strokeWidth="6" />
                    <circle
                        cx="42"
                        cy="42"
                        r={r}
                        fill="none"
                        stroke={goalMet ? '#10b981' : '#6366f1'}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circ}
                        strokeDashoffset={dash}
                        style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                </svg>
                <div className="absolute text-center">
                    <p
                        className={`text-base font-bold leading-none ${goalMet ? 'text-emerald-500' : 'text-indigo-600'
                            }`}
                    >
                        {mins}m
                    </p>
                    <p className="text-[9px] text-gray-400">/ 30m</p>
                </div>
            </div>
            <div className="flex-1 space-y-2">
                <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Logged in</span>
                    <span className="font-medium text-gray-700">
                        {loginTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Session</span>
                    <span className="font-medium text-gray-700">{formatTime(elapsed)}</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Daily goal</span>
                    <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${goalMet ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                            }`}
                    >
                        {goalMet ? '✓ Complete' : '30 min'}
                    </span>
                </div>
            </div>
        </div>
    )
}

// ─── SCORE RING ────────────────────────────────────────────────────
function ScoreRing({ current, target }: { current?: number; target?: number }) {
    const r = 38
    const circ = 2 * Math.PI * r
    const pct = current ? Math.min(current / 9, 1) : 0
    const [dash, setDash] = useState(circ)

    useEffect(() => {
        const t = setTimeout(() => setDash(circ * (1 - pct)), 200)
        return () => clearTimeout(t)
    }, [pct, circ])

    return (
        <div className="relative flex items-center justify-center">
            <svg width="100" height="100" className="-rotate-90">
                <circle cx="50" cy="50" r={r} fill="none" stroke="#e0e7ff" strokeWidth="7" />
                <circle
                    cx="50"
                    cy="50"
                    r={r}
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={dash}
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                />
            </svg>
            <div className="absolute text-center">
                <p className="text-xl font-bold text-indigo-600 leading-none">{current ?? '—'}</p>
                <p className="text-[10px] text-gray-400 font-medium">/ 9.0</p>
            </div>
        </div>
    )
}

// ─── STREAK PILL ───────────────────────────────────────────────────
function StreakPill({ days }: { days: number }) {
    return (
        <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 rounded-full px-3 py-1.5">
            <Flame size={13} className="text-orange-500" />
            <span className="text-xs font-bold text-orange-600">{days} day streak</span>
        </div>
    )
}

// ─── QUICK ACTION ──────────────────────────────────────────────────
function QuickAction({
    label,
    desc,
    href,
    icon: Icon,
    delay,
}: {
    label: string
    desc: string
    href: string
    icon: React.ElementType
    delay: number
}) {
    return (
        <FadeIn delay={delay}>
            <Link
                href={href}
                className="group flex items-center gap-3.5 bg-white border border-indigo-50 rounded-2xl p-4 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 hover:-translate-y-0.5 transition-all duration-300"
            >
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 transition-all duration-300">
                    <Icon
                        size={15}
                        className="text-indigo-500 group-hover:text-white transition-colors duration-300"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors">
                        {label}
                    </p>
                    <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{desc}</p>
                </div>
                <ChevronRight
                    size={14}
                    className="text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0"
                />
            </Link>
        </FadeIn>
    )
}

// ─── BAND TREND MINI CHART ─────────────────────────────────────────
function BandTrendChart({
    points,
    loading,
}: {
    points: { band: number; date: string }[]
    loading: boolean
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (loading || points.length < 2 || !canvasRef.current) return
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')!
        const W = canvas.width
        const H = canvas.height
        ctx.clearRect(0, 0, W, H)

        const bands = points.map(p => p.band)
        const min = Math.max(0, Math.min(...bands) - 0.5)
        const max = Math.min(9, Math.max(...bands) + 0.5)
        const xStep = W / (points.length - 1)
        const yScale = (v: number) => H - ((v - min) / (max - min)) * H

        // gradient fill
        const grad = ctx.createLinearGradient(0, 0, 0, H)
        grad.addColorStop(0, 'rgba(99,102,241,0.18)')
        grad.addColorStop(1, 'rgba(99,102,241,0)')
        ctx.beginPath()
        points.forEach((p, i) =>
            i === 0 ? ctx.moveTo(0, yScale(p.band)) : ctx.lineTo(i * xStep, yScale(p.band))
        )
        ctx.lineTo((points.length - 1) * xStep, H)
        ctx.lineTo(0, H)
        ctx.closePath()
        ctx.fillStyle = grad
        ctx.fill()

        // line
        ctx.beginPath()
        points.forEach((p, i) =>
            i === 0 ? ctx.moveTo(0, yScale(p.band)) : ctx.lineTo(i * xStep, yScale(p.band))
        )
        ctx.strokeStyle = '#6366f1'
        ctx.lineWidth = 2
        ctx.lineJoin = 'round'
        ctx.stroke()

        // dots
        points.forEach((p, i) => {
            ctx.beginPath()
            ctx.arc(i * xStep, yScale(p.band), 3, 0, Math.PI * 2)
            ctx.fillStyle = '#4338ca'
            ctx.fill()
        })
    }, [points, loading])

    if (loading) return <div className="h-20 rounded-lg animate-pulse bg-indigo-50" />

    if (points.length < 2) {
        return (
            <div className="h-20 flex items-center justify-center text-xs text-gray-300">
                Complete more tests to see your trend
            </div>
        )
    }

    return <canvas ref={canvasRef} width={280} height={80} className="w-full" />
}

// ─── WEAK SKILLS WIDGET ────────────────────────────────────────────
const TYPE_LABELS: Record<string, string> = {
    MATCHING_INFORMATION: 'Matching Information',
    MATCHING_HEADINGS: 'Matching Headings',
    SUMMARY_COMPLETION: 'Summary Completion',
    SUMMARY_COMPLETION_DRAG_DROP: 'Drag-Drop Summary',
    SENTENCE_COMPLETION: 'Sentence Completion',
    MULTIPLE_CHOICE: 'Multiple Choice',
    TRUE_FALSE_NOT_GIVEN: 'True / False / Not Given',
    YES_NO_NOT_GIVEN: 'Yes / No / Not Given',
}

function WeakSkillsWidget({
    progress,
    loading,
}: {
    progress: ProgressOut | null
    loading: boolean
}) {
    if (loading) {
        return (
            <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 rounded-xl animate-pulse bg-indigo-50" />
                ))}
            </div>
        )
    }

    const weak = progress?.top_weak_types ?? []
    const accuracy = progress?.overall_type_accuracy ?? {}

    if (weak.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
                <Trophy size={20} className="text-amber-400" />
                <p className="text-xs text-gray-400 font-medium">No weak areas detected yet</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {weak.map(type => {
                const acc = accuracy[type] ?? 0
                return (
                    <div key={type} className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-600">
                                {TYPE_LABELS[type] ?? type}
                            </span>
                            <span className="text-xs font-bold text-red-500">{acc.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full bg-red-400 transition-all duration-700"
                                style={{ width: `${acc}%` }}
                            />
                        </div>
                    </div>
                )
            })}
            <p className="text-[10px] text-gray-400 pt-1">Question types with accuracy below 60%</p>
        </div>
    )
}

// ─── TYPE ACCURACY BREAKDOWN ───────────────────────────────────────
function TypeAccuracyBreakdown({
    progress,
    loading,
}: {
    progress: ProgressOut | null
    loading: boolean
}) {
    if (loading) {
        return (
            <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="h-3 w-32 rounded animate-pulse bg-indigo-50" />
                        <div className="h-2 flex-1 rounded animate-pulse bg-indigo-50" />
                        <div className="h-3 w-8 rounded animate-pulse bg-indigo-50" />
                    </div>
                ))}
            </div>
        )
    }

    const acc = progress?.overall_type_accuracy ?? {}
    const entries = Object.entries(acc).sort((a, b) => b[1] - a[1])

    if (entries.length === 0) {
        return (
            <p className="text-xs text-gray-400 text-center py-4">No data yet — take a test first</p>
        )
    }

    return (
        <div className="space-y-2.5">
            {entries.map(([type, pct]) => {
                const color =
                    pct >= 80
                        ? 'bg-emerald-400'
                        : pct >= 60
                            ? 'bg-indigo-400'
                            : 'bg-red-400'
                const textColor =
                    pct >= 80
                        ? 'text-emerald-600'
                        : pct >= 60
                            ? 'text-indigo-600'
                            : 'text-red-500'
                return (
                    <div key={type} className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 w-32 truncate shrink-0">
                            {TYPE_LABELS[type] ?? type}
                        </span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full ${color} transition-all duration-700`}
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                        <span className={`text-[10px] font-bold w-8 text-right ${textColor}`}>
                            {pct.toFixed(0)}%
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

// ─── EXAM COUNTDOWN ────────────────────────────────────────────────
function ExamCountdown({ examDate }: { examDate?: string }) {
    if (!examDate) {
        return (
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-gray-400">Exam date not set</p>
                    <Link
                        href="/profile/settings"
                        className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors"
                    >
                        Set exam date →
                    </Link>
                </div>
                <Calendar size={20} className="text-gray-200" />
            </div>
        )
    }

    const days = Math.max(
        0,
        Math.floor((new Date(examDate).getTime() - Date.now()) / 86_400_000)
    )
    const urgency =
        days <= 7
            ? 'text-red-600 bg-red-50 border-red-100'
            : days <= 30
                ? 'text-amber-600 bg-amber-50 border-amber-100'
                : 'text-emerald-700 bg-emerald-50 border-emerald-100'

    return (
        <div className={`flex items-center justify-between rounded-xl px-4 py-3 border ${urgency}`}>
            <div>
                <p className="text-xs font-semibold opacity-70">Exam in</p>
                <p className="text-2xl font-bold">
                    {days} <span className="text-sm font-medium opacity-70">days</span>
                </p>
                <p className="text-xs opacity-60">
                    {new Date(examDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                    })}
                </p>
            </div>
            <Calendar size={24} className="opacity-40" />
        </div>
    )
}

// ─── RECENT ATTEMPTS TABLE ─────────────────────────────────────────
function RecentAttempts({
    history,
    loading,
}: {
    history: AttemptHistoryOut[]
    loading: boolean
}) {
    const modeColor = (m: string) =>
        m === 'EXAM' ? 'bg-violet-50 text-violet-700' : 'bg-indigo-50 text-indigo-700'
    const statusColor = (completed: boolean) =>
        completed ? 'text-emerald-500' : 'text-amber-500'

    if (loading) {
        return (
            <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="h-4 flex-1 rounded animate-pulse bg-indigo-50" />
                        <div className="h-4 w-12 rounded animate-pulse bg-indigo-50" />
                        <div className="h-4 w-10 rounded animate-pulse bg-indigo-50" />
                    </div>
                ))}
            </div>
        )
    }

    if (history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <BookOpen size={18} className="text-indigo-200" />
                </div>
                <p className="text-sm font-semibold text-gray-400">No attempts yet</p>
                <Link
                    href="/practice"
                    className="text-xs font-semibold bg-indigo-600 text-white px-4 py-1.5 rounded-xl hover:bg-indigo-700 transition-colors"
                >
                    Take your first test
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-1.5">
            {history.slice(0, 5).map(a => (
                <Link
                    key={a.attempt_id}
                    href={`/practice/results/${a.attempt_id}`}
                    className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-indigo-50 transition-colors"
                >
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-100">
                        <BookOpen size={13} className="text-indigo-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-700 truncate">{a.global_title}</p>
                        <p className="text-[10px] text-gray-400">
                            {a.finished_at
                                ? new Date(a.finished_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                })
                                : 'In progress'}
                            {' · '}
                            {a.scope === 'PART' ? `Part ${a.part_id}` : 'Full test'}
                            {' · '}
                            {a.correct_count}/{a.total_questions} correct
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${modeColor(a.mode)}`}
                        >
                            {a.mode}
                        </span>
                        {a.band_score !== null && (
                            <span className="text-xs font-bold text-indigo-700">Band {a.band_score}</span>
                        )}
                    </div>
                    <CheckCircle2
                        size={13}
                        className={`${statusColor(a.is_completed)} shrink-0`}
                    />
                </Link>
            ))}
            {history.length > 5 && (
                <Link
                    href="/practice/history"
                    className="flex items-center justify-center gap-1 text-xs font-semibold text-indigo-500 hover:text-indigo-700 mt-2 py-1.5 transition-colors"
                >
                    View all {history.length} attempts <ArrowUpRight size={11} />
                </Link>
            )}
        </div>
    )
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────
export default function DashboardPage() {
    const { user: authUser } = useAuth()
    const [user, setUser] = useState<User | null>(authUser as User | null)
    const [progress, setProgress] = useState<ProgressOut | null>(null)
    const [history, setHistory] = useState<AttemptHistoryOut[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
    const [loginTime] = useState(() => new Date())

    const fetchAll = useCallback(async () => {
        setLoading(true)
        setError(false)
        try {
            const [freshUser, freshProgress, freshHistory] = await Promise.all([
                userApi.me(),
                getMyProgress(),
                getMyHistory({ limit: 30 }),
            ])
            setUser(freshUser)
            setProgress(freshProgress)
            setHistory(freshHistory)
            setLastUpdated(new Date())
        } catch {
            setError(true)
            if (authUser) setUser(authUser as User)
        } finally {
            setLoading(false)
        }
    }, [authUser])

    useEffect(() => {
        fetchAll()
    }, [fetchAll])

    // ── Derived ──────────────────────────────────────────────────────
    const meta = user?.meta
    const ielts = meta?.ielts as any
    const cefr = meta?.cefr as any

    const firstName =
        user?.full_name?.split(' ')[0] || user?.username || 'there'
    const initials = user?.full_name
        ? user.full_name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
        : user?.username?.[0]?.toUpperCase() || 'U'

    const currentScore = ielts?.current_score
    const targetScore = ielts?.target_score
    const gap =
        currentScore && targetScore ? +(targetScore - currentScore).toFixed(1) : null

    const daysOnPlatform = getDaysOnPlatform(user?.created_at)
    const activityGrid = buildActivityGrid(history)

    const bandTrendPoints = (progress?.band_trend ?? [])
        .filter(p => p.band_score !== null)
        .map(p => ({ band: p.band_score!, date: p.finished_at }))

    const hour = new Date().getHours()
    const greeting =
        hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
    const greetingEmoji = hour < 12 ? '☀️' : hour < 17 ? '👋' : '🌙'

    const skillList = [
        {
            label: 'Listening',
            value: ielts?.listening,
            icon: Headphones,
            color: 'text-indigo-500',
            bg: 'bg-indigo-50',
        },
        {
            label: 'Reading',
            value: ielts?.reading,
            icon: Eye,
            color: 'text-violet-500',
            bg: 'bg-violet-50',
        },
        {
            label: 'Writing',
            value: ielts?.writing,
            icon: PenLine,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
        },
        {
            label: 'Speaking',
            value: ielts?.speaking,
            icon: Mic,
            color: 'text-indigo-400',
            bg: 'bg-indigo-50',
        },
    ]
    const hasScores = skillList.some(s => s.value !== undefined)

    const tips = [
        'Read one academic article daily to significantly boost your reading band.',
        'Daily podcast listening is the fastest way to improve comprehension.',
        'Write one essay per week and seek structured feedback from a tutor.',
        'Imitate native speakers closely to rapidly improve pronunciation.',
        'Focus on your weakest question type first — it has the highest ROI.',
        'Time yourself strictly on each passage — pacing is critical in IELTS.',
        'Learn 5 new academic vocabulary words every day and use them in writing.',
    ]
    const tip = tips[new Date().getDay() % tips.length]

    return (
        <>
            <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

            <div className="max-w-5xl mx-auto space-y-5 pb-10">

                {/* ── ERROR ──────────────────────────────────────── */}
                {error && !loading && <ErrorBanner onRetry={fetchAll} />}

                {/* ── HEADER ─────────────────────────────────────── */}
                <FadeIn delay={0}>
                    <div className="flex items-center justify-between">
                        <div>
                            {loading ? (
                                <>
                                    <div className="h-7 w-52 rounded-lg animate-pulse bg-indigo-100 mb-2" />
                                    <div className="h-3.5 w-64 rounded animate-pulse bg-indigo-50" />
                                </>
                            ) : (
                                <>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {greeting},{' '}
                                        <span className="text-indigo-600">{firstName}</span>{' '}
                                        {greetingEmoji}
                                    </h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-sm text-gray-400">
                                            Here's your progress overview.
                                        </p>
                                        {lastUpdated && (
                                            <span className="text-[11px] text-indigo-300">
                                                ·{' '}
                                                {lastUpdated.toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="hidden sm:flex items-center gap-3">
                            {loading ? (
                                <>
                                    <div className="h-7 w-28 rounded-full animate-pulse bg-orange-50" />
                                    <div className="w-10 h-10 rounded-xl animate-pulse bg-indigo-100" />
                                </>
                            ) : (
                                <>
                                    <StreakPill days={meta?.streak ?? 0} />
                                    <button
                                        onClick={fetchAll}
                                        title="Refresh"
                                        className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                                    >
                                        {initials}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </FadeIn>

                {/* ── PRIMARY STAT CARDS ─────────────────────────── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard
                        loading={loading}
                        label="Current Band"
                        value={currentScore ?? '—'}
                        sub="out of 9.0"
                        icon={TrendingUp}
                        accent="bg-indigo-600"
                        textAccent="text-white"
                        borderAccent="border-indigo-100"
                        delay={80}
                    />
                    <StatCard
                        loading={loading}
                        label="Target Band"
                        value={targetScore ?? '—'}
                        sub="your goal"
                        icon={Target}
                        accent="bg-violet-500"
                        textAccent="text-white"
                        borderAccent="border-violet-100"
                        delay={160}
                    />
                    <StatCard
                        loading={loading}
                        label="Tests Taken"
                        value={progress?.total_attempts ?? meta?.tests_taken ?? 0}
                        sub="total attempts"
                        icon={BookOpen}
                        accent="bg-emerald-500"
                        textAccent="text-white"
                        borderAccent="border-emerald-100"
                        delay={240}
                    />
                    <StatCard
                        loading={loading}
                        label="Days on Platform"
                        value={daysOnPlatform}
                        sub="since you joined"
                        icon={Calendar}
                        accent="bg-amber-400"
                        textAccent="text-white"
                        borderAccent="border-amber-100"
                        delay={320}
                    />
                </div>

                {/* ── BAND SCORE ROW (from API) ──────────────────── */}
                <div className="grid grid-cols-3 gap-3">
                    <StatCard
                        loading={loading}
                        label="Best Band"
                        value={progress?.best_band_score ?? '—'}
                        sub="all time"
                        icon={Trophy}
                        accent="bg-yellow-400"
                        textAccent="text-white"
                        borderAccent="border-yellow-100"
                        delay={360}
                    />
                    <StatCard
                        loading={loading}
                        label="Latest Band"
                        value={progress?.latest_band_score ?? '—'}
                        sub="last attempt"
                        icon={Activity}
                        accent="bg-indigo-500"
                        textAccent="text-white"
                        borderAccent="border-indigo-100"
                        delay={400}
                    />
                    <StatCard
                        loading={loading}
                        label="Average Band"
                        value={
                            progress?.avg_band_score
                                ? +progress.avg_band_score.toFixed(1)
                                : '—'
                        }
                        sub="all attempts"
                        icon={BarChart2}
                        accent="bg-teal-500"
                        textAccent="text-white"
                        borderAccent="border-teal-100"
                        delay={440}
                    />
                </div>

                {/* ── SKILLS + SCORE + CEFR ─────────────────────── */}
                <div className="grid md:grid-cols-5 gap-4">

                    {/* Skills — 3 cols */}
                    <FadeIn delay={280} className="md:col-span-3">
                        <div className="bg-white border border-indigo-50 rounded-2xl p-6 h-full">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                                        <BarChart2 size={13} className="text-indigo-500" />
                                    </div>
                                    <h2 className="font-bold text-gray-800">IELTS Skills</h2>
                                </div>
                                <Link
                                    href="/profile"
                                    className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors"
                                >
                                    Profile →
                                </Link>
                            </div>

                            {loading ? (
                                <div className="space-y-5">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg animate-pulse bg-indigo-50" />
                                            <div className="flex-1 space-y-2">
                                                <div className="flex justify-between">
                                                    <div className="h-3 w-20 rounded animate-pulse bg-indigo-50" />
                                                    <div className="h-3 w-6 rounded animate-pulse bg-indigo-50" />
                                                </div>
                                                <div className="h-1.5 w-full rounded-full animate-pulse bg-indigo-50" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : hasScores ? (
                                <div className="space-y-5">
                                    {skillList.map((s, i) => (
                                        <SkillBar key={s.label} skill={s} delay={380 + i * 90} />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                                        <BarChart2 size={20} className="text-indigo-200" />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-500">
                                        No scores available
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Add your IELTS scores to get started
                                    </p>
                                    <Link
                                        href="/profile/settings"
                                        className="text-xs font-semibold bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
                                    >
                                        Add scores
                                    </Link>
                                </div>
                            )}
                        </div>
                    </FadeIn>

                    {/* Score ring + CEFR — 2 cols */}
                    <FadeIn delay={360} className="md:col-span-2">
                        <div className="bg-white border border-indigo-50 rounded-2xl p-6 h-full flex flex-col gap-5">
                            <div className="flex items-center gap-4">
                                <ScoreRing current={currentScore} target={targetScore} />
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-gray-400 mb-1">Target</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {targetScore ?? '—'}
                                    </p>
                                    {gap && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                            <span className="text-xs text-indigo-500 font-medium">
                                                +{gap} needed
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-gray-50" />

                            {loading ? (
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <div className="h-4 w-28 rounded animate-pulse bg-indigo-50" />
                                        <div className="h-5 w-10 rounded-full animate-pulse bg-indigo-100" />
                                    </div>
                                    <div className="flex gap-1">
                                        {[...Array(6)].map((_, i) => (
                                            <div key={i} className="flex-1">
                                                <div className="h-2 rounded-sm animate-pulse bg-indigo-50 mb-1" />
                                                <div className="h-2 rounded animate-pulse bg-indigo-50" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <CefrTrack level={cefr?.level} />
                            )}

                            {!loading && (
                                <div className="space-y-2.5 mt-auto">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-xs">Target level</span>
                                        <span className="font-bold text-gray-700 text-xs">
                                            {cefr?.target_level || '—'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-xs">Account status</span>
                                        <span
                                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${user?.is_verified
                                                ? 'bg-emerald-50 text-emerald-600'
                                                : 'bg-amber-50 text-amber-600'
                                                }`}
                                        >
                                            {user?.is_verified ? '✓ Verified' : 'Unverified'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-xs">Plan</span>
                                        <span className="text-xs font-semibold text-gray-500">
                                            {user?.status}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <Link
                                href="/profile"
                                className="flex items-center justify-center gap-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl py-2.5 hover:bg-indigo-100 transition-colors"
                            >
                                <Award size={13} />
                                Full profile
                            </Link>
                        </div>
                    </FadeIn>
                </div>

                {/* ── BAND TREND + WEAK AREAS ───────────────────── */}
                <div className="grid md:grid-cols-2 gap-4">

                    <FadeIn delay={480}>
                        <div className="bg-white border border-indigo-50 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                                        <TrendingUp size={13} className="text-indigo-500" />
                                    </div>
                                    <h2 className="font-bold text-gray-800">Band Score Trend</h2>
                                </div>
                                {progress && (
                                    <span className="text-xs text-gray-400">
                                        {progress.total_attempts} attempt
                                        {progress.total_attempts !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>
                            <BandTrendChart points={bandTrendPoints} loading={loading} />
                        </div>
                    </FadeIn>

                    <FadeIn delay={520}>
                        <div className="bg-white border border-indigo-50 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                                        <Zap size={13} className="text-red-400" />
                                    </div>
                                    <h2 className="font-bold text-gray-800">Weak Areas</h2>
                                </div>
                                <Link
                                    href="/practice"
                                    className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors"
                                >
                                    Practice →
                                </Link>
                            </div>
                            <WeakSkillsWidget progress={progress} loading={loading} />
                        </div>
                    </FadeIn>
                </div>

                {/* ── QUESTION TYPE BREAKDOWN ───────────────────── */}
                <FadeIn delay={540}>
                    <div className="bg-white border border-indigo-50 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                                    <BarChart2 size={13} className="text-indigo-500" />
                                </div>
                                <h2 className="font-bold text-gray-800">Accuracy by Question Type</h2>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-gray-400">
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                                    ≥80%
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
                                    60–79%
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                                    &lt;60%
                                </span>
                            </div>
                        </div>
                        <TypeAccuracyBreakdown progress={progress} loading={loading} />
                    </div>
                </FadeIn>

                {/* ── ACTIVITY CALENDAR + SESSION ───────────────── */}
                <div className="grid md:grid-cols-2 gap-4">

                    <FadeIn delay={560}>
                        <div className="bg-white border border-indigo-50 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                                        <Calendar size={13} className="text-indigo-500" />
                                    </div>
                                    <h2 className="font-bold text-gray-800">Activity</h2>
                                </div>
                                <span className="text-xs text-gray-400">Last 12 weeks</span>
                            </div>
                            <ActivityCalendar grid={activityGrid} loading={loading} />
                        </div>
                    </FadeIn>

                    <FadeIn delay={580}>
                        <div className="bg-white border border-indigo-50 rounded-2xl p-6 flex flex-col gap-5">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                                    <Timer size={13} className="text-indigo-500" />
                                </div>
                                <h2 className="font-bold text-gray-800">Today's Session</h2>
                            </div>

                            <SessionTimer loginTime={loginTime} />

                            <div className="border-t border-gray-50" />

                            <div>
                                <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
                                    <Clock3 size={12} className="text-indigo-400" />
                                    Exam Countdown
                                </p>
                                <ExamCountdown examDate={ielts?.exam_date} />
                            </div>

                            {!loading && (
                                <div className="space-y-2 pt-1 border-t border-gray-50">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">Days on platform</span>
                                        <span className="font-medium text-gray-700">
                                            {daysOnPlatform} days
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">Streak</span>
                                        <span className="font-medium text-gray-700">
                                            🔥 {meta?.streak ?? 0} days
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </FadeIn>
                </div>

                {/* ── RECENT ATTEMPTS ───────────────────────────── */}
                <FadeIn delay={600}>
                    <div className="bg-white border border-indigo-50 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                                    <Layers size={13} className="text-indigo-500" />
                                </div>
                                <h2 className="font-bold text-gray-800">Recent Attempts</h2>
                            </div>
                            <Link
                                href="/practice/history"
                                className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors"
                            >
                                View all →
                            </Link>
                        </div>
                        <RecentAttempts history={history} loading={loading} />
                    </div>
                </FadeIn>

                {/* ── QUICK ACTIONS ─────────────────────────────── */}
                <div>
                    <FadeIn delay={640}>
                        <h2 className="font-bold text-gray-800 mb-3 text-sm">Quick Actions</h2>
                    </FadeIn>
                    <div className="grid sm:grid-cols-3 gap-3">
                        <QuickAction
                            href="/practice"
                            icon={BookOpen}
                            label="Take a test"
                            desc="New IELTS reading practice test"
                            delay={660}
                        />
                        <QuickAction
                            href="/practice?scope=PART"
                            icon={Target}
                            label="Skill drill"
                            desc="Practice one passage at a time"
                            delay={700}
                        />
                        <QuickAction
                            href="/profile/settings"
                            icon={Calendar}
                            label="Update goal"
                            desc="Set target band & exam date"
                            delay={740}
                        />
                    </div>
                </div>

                {/* ── TIP BANNER ────────────────────────────────── */}
                <FadeIn delay={760}>
                    <div
                        className="relative rounded-2xl p-5 flex items-center gap-4 overflow-hidden"
                        style={{
                            background:
                                'linear-gradient(135deg,#4338ca 0%,#6366f1 50%,#818cf8 100%)',
                        }}
                    >
                        <div className="absolute -right-4 -top-4 w-28 h-28 rounded-full bg-white/10" />
                        <div className="absolute right-12 -bottom-8 w-20 h-20 rounded-full bg-white/5" />
                        <div className="absolute left-1/2 -top-6 w-16 h-16 rounded-full bg-white/5" />
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0 backdrop-blur-sm">
                            <Zap size={17} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0 relative">
                            <p className="text-[11px] font-semibold text-indigo-200 mb-0.5 uppercase tracking-wider">
                                Daily tip
                            </p>
                            <p className="text-sm text-white leading-snug">{tip}</p>
                        </div>
                        <Link
                            href="/practice"
                            className="shrink-0 relative text-xs bg-white text-indigo-700 font-bold px-4 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg shadow-indigo-900/20"
                        >
                            Start
                        </Link>
                    </div>
                </FadeIn>

            </div>
        </>
    )
}