'use client'

/**
 * LEXIS — Dashboard Page
 * app/dashboard/page.tsx
 *
 * Stack: Next.js App Router · TypeScript · TailwindCSS · Recharts · lucide-react
 * API: userApi, getMyProgress, getMyHistory, billingApi
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts'
import {
    Flame,
    BookOpen,
    Clock,
    Target,
    ArrowRight,
    Brain,
    Trophy,
    Star,
    CheckCircle,
    Circle,
    TrendingUp,
    AlignLeft,
    SquarePen,
    BookMarked,
    ArrowUpRight,
    Sparkles,
    Loader2,
    AlertCircle,
} from 'lucide-react'

// ─── API imports ──────────────────────────────────────────────────
import { userApi, type User } from '@/lib/api/user'
import {
    getMyProgress,
    getMyHistory,
    type ProgressOut,
    type AttemptHistoryOut,
    type QuestionTypeEnum,
} from '@/lib/api/ielts_reading'
import { billingApi } from '@/lib/api/billing'
import { Subscription } from '@/lib/types/billing'

// ─── Design tokens ────────────────────────────────────────────────
const C = {
    indigo: '#6366f1',
    indigoDark: '#4338ca',
    indigoDeep: '#1e1b4b',
    indigoMid: '#818cf8',
    indigoLight: '#eef2ff',
    violet: '#7c3aed',
    emerald: '#059669',
    amber: '#d97706',
    rose: '#e11d48',
    teal: '#0d9488',
    orange: '#ea580c',
}

// ─── Types ────────────────────────────────────────────────────────
interface PracticeCard {
    label: string
    desc: string
    href: string
    icon: React.ElementType
    color: string
}
interface Achievement {
    label: string
    sub: string
    icon: React.ElementType
    color: string
    bg: string
}
interface PlanTask {
    label: string
    time: string
    done: boolean
}
interface DashboardData {
    user: User | null
    progress: ProgressOut | null
    history: AttemptHistoryOut[]
    subscription: Subscription | null
}

// ─── Static data ──────────────────────────────────────────────────
const PRACTICE_CARDS: PracticeCard[] = [
    { label: 'Full Mock IELTS', desc: 'Simulate real exam conditions', href: '/exams', icon: BookMarked, color: C.indigo },
    { label: 'Vocabulary Builder', desc: 'Expand your word power', href: '/practice', icon: AlignLeft, color: C.violet },
    { label: 'Grammar Practice', desc: 'Sharpen your grammar skills', href: '/practice', icon: SquarePen, color: C.teal },
    { label: 'CEFR Adaptive Test', desc: 'Find your CEFR level', href: '/tests/cefr', icon: Target, color: C.amber },
]

const ACHIEVEMENTS: Achievement[] = [
    { label: '7 Day Streak', sub: 'Keep it up!', icon: Flame, color: '#ea580c', bg: '#fff7ed' },
    { label: 'First Mock Completed', sub: 'Great start!', icon: Trophy, color: '#ca8a04', bg: '#fefce8' },
    { label: 'Vocabulary Master', sub: 'Learn 500 words', icon: Star, color: C.violet, bg: '#f5f3ff' },
    { label: 'Top 10% Performer', sub: 'Keep it up!', icon: TrendingUp, color: C.emerald, bg: '#f0fdf4' },
]

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const TODAY_DATE = new Date().getDate()

// ─── Question type labels ─────────────────────────────────────────
const QT_LABELS: Record<string, string> = {
    MATCHING_INFORMATION: 'Matching Information',
    MATCHING_HEADINGS: 'Matching Headings',
    SUMMARY_COMPLETION: 'Summary Completion',
    SUMMARY_COMPLETION_DRAG_DROP: 'Summary (Drag & Drop)',
    SENTENCE_COMPLETION: 'Sentence Completion',
    MULTIPLE_CHOICE: 'Multiple Choice',
    TRUE_FALSE_NOT_GIVEN: 'True/False/Not Given',
    YES_NO_NOT_GIVEN: 'Yes/No/Not Given',
}

// ─── Helpers ──────────────────────────────────────────────────────
function getGreeting(): [string, string] {
    const h = new Date().getHours()
    if (h < 12) return ['Good morning', '☀️']
    if (h < 17) return ['Good afternoon', '👋']
    return ['Good evening', '🌙']
}

function firstName(fullName: string | null | undefined, username: string | null | undefined): string {
    if (fullName) return fullName.split(' ')[0]
    if (username) return username
    return 'there'
}

/** Derive band goal: current + 1 band, clamped to max 9 */
function getBandGoal(current: number | null): number {
    if (!current) return 7.0
    return Math.min(Math.round((current + 1) * 2) / 2, 9)
}

/** Convert band_trend ProgressPointOut array → chart-friendly ScorePoint[] */
function buildChartData(progress: ProgressOut | null) {
    if (!progress?.band_trend?.length) return []
    return progress.band_trend
        .slice(-8)
        .map((p) => ({
            date: new Date(p.finished_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            score: p.band_score,
        }))
}

/** Derive today's plan tasks from most-recent history attempt */
function buildTodayTasks(history: AttemptHistoryOut[]): PlanTask[] {
    const recent = history[0]
    return [
        {
            label: 'Complete 1 Mock Test',
            time: recent ? '1/1' : '0/1',
            done: !!recent,
        },
        {
            label: 'Study Vocabulary (20 mins)',
            time: '0/20m',
            done: false,
        },
        {
            label: 'Review Wrong Answers',
            time: recent ? '0/15m' : '0/15m',
            done: false,
        },
    ]
}

/** Compute progress percentage toward band goal */
function bandProgress(current: number | null, goal: number): number {
    if (!current) return 0
    const start = Math.max(current - 2, 1)
    return Math.round(((current - start) / (goal - start)) * 100)
}

// ─── Animated counter ─────────────────────────────────────────────
function Counter({ to, decimals = 0, suffix = '' }: { to: number; decimals?: number; suffix?: string }) {
    const [val, setVal] = useState(0)
    const raf = useRef<number>()
    useEffect(() => {
        const start = performance.now()
        const tick = (now: number) => {
            const p = Math.min((now - start) / 1000, 1)
            const ease = 1 - Math.pow(1 - p, 3)
            setVal(+(to * ease).toFixed(decimals))
            if (p < 1) raf.current = requestAnimationFrame(tick)
        }
        raf.current = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf.current!)
    }, [to, decimals])
    return <>{val.toFixed(decimals)}{suffix}</>
}

// ─── Fade-in wrapper ──────────────────────────────────────────────
function Fade({ children, delay = 0, className = '' }: {
    children: React.ReactNode; delay?: number; className?: string
}) {
    const [show, setShow] = useState(false)
    useEffect(() => {
        const t = setTimeout(() => setShow(true), delay)
        return () => clearTimeout(t)
    }, [delay])
    return (
        <div className={`transition-all duration-500 ease-out ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${className}`}>
            {children}
        </div>
    )
}

// ─── Card shell ───────────────────────────────────────────────────
function Card({ children, className = '', style }: {
    children: React.ReactNode; className?: string; style?: React.CSSProperties
}) {
    return (
        <div
            className={`bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 ${className}`}
            style={style}
        >
            {children}
        </div>
    )
}

// ─── Skeleton loader ──────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
    )
}

// ─── Error banner ─────────────────────────────────────────────────
function ErrorBanner({ message }: { message: string }) {
    return (
        <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm">
            <AlertCircle size={16} className="shrink-0" />
            <span>{message}</span>
        </div>
    )
}

// ─── Circular progress SVG ────────────────────────────────────────
function CircleProgress({ current, size = 160 }: { current: number; size?: number }) {
    const r = (size / 2) - 12
    const circ = 2 * Math.PI * r
    const pct = Math.min(current / 9, 1)
    const [dash, setDash] = useState(circ)
    useEffect(() => {
        const t = setTimeout(() => setDash(circ * (1 - pct)), 300)
        return () => clearTimeout(t)
    }, [pct, circ])

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90" style={{ position: 'absolute' }}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={10} />
                <circle
                    cx={size / 2} cy={size / 2} r={r}
                    fill="none" stroke="white" strokeWidth={10}
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={dash}
                    style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
                />
            </svg>
            <div className="relative text-center z-10">
                <p className="text-[10px] font-semibold text-white/60 uppercase tracking-widest mb-0.5">Current Score</p>
                <p className="text-5xl font-black text-white leading-none">
                    {current > 0 ? current.toFixed(1) : '–'}
                </p>
                <p className="text-[11px] text-white/50 font-medium mt-1">IELTS</p>
            </div>
        </div>
    )
}

// ─── Custom Recharts tooltip ──────────────────────────────────────
interface TooltipProps {
    active?: boolean
    payload?: Array<{ value?: number }>
    label?: string
}

function ChartTooltip({ active, payload, label }: TooltipProps) {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2">
            <p className="text-[11px] text-gray-400 mb-0.5">{label}</p>
            <p className="text-[15px] font-bold" style={{ color: C.indigo }}>
                Band {payload[0].value?.toFixed(1)}
            </p>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════
export default function DashboardPage() {
    const [greeting, emoji] = getGreeting()
    const [tasks, setTasks] = useState<PlanTask[]>([
        { label: 'Complete 1 Mock Test', time: '0/1', done: false },
        { label: 'Study Vocabulary (20 mins)', time: '0/20m', done: false },
        { label: 'Review Wrong Answers', time: '0/15m', done: false },
    ])

    // ── Data state ───────────────────────────────────────────────────
    const [data, setData] = useState<DashboardData>({
        user: null,
        progress: null,
        history: [],
        subscription: null,
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // ── Fetch all dashboard data in parallel ─────────────────────────
    useEffect(() => {
        let cancelled = false
        async function fetchAll() {
            try {
                setLoading(true)
                setError(null)

                const [user, progress, history, subscription] = await Promise.allSettled([
                    userApi.me(),
                    getMyProgress(),
                    getMyHistory({ limit: 10 }),
                    billingApi.getMySubscription(),
                ])

                if (cancelled) return

                const resolved: DashboardData = {
                    user: user.status === 'fulfilled' ? user.value : null,
                    progress: progress.status === 'fulfilled' ? progress.value : null,
                    history: history.status === 'fulfilled' ? history.value : [],
                    subscription: subscription.status === 'fulfilled' ? subscription.value : null,
                }

                setData(resolved)

                // Build today's tasks based on history
                if (history.status === 'fulfilled') {
                    setTasks(buildTodayTasks(history.value))
                }

                // If all four failed, show a general error
                const allFailed = [user, progress, history, subscription]
                    .every(r => r.status === 'rejected')
                if (allFailed) {
                    setError('Failed to load dashboard data. Please try again.')
                }
            } catch (err: unknown) {
                if (!cancelled) setError(err instanceof Error ? err.message : 'Something went wrong.')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        fetchAll()
        return () => { cancelled = true }
    }, [])

    const toggleTask = useCallback((i: number) => {
        setTasks(prev => prev.map((t, idx) => idx === i ? { ...t, done: !t.done } : t))
    }, [])

    // ── Derived values ───────────────────────────────────────────────
    const { user, progress, history, subscription } = data

    const currentBand = progress?.latest_band_score ?? 0
    const bestBand = progress?.best_band_score ?? 0
    const avgBand = progress?.avg_band_score ?? 0
    const bandGoal = getBandGoal(currentBand)
    const progressPct = bandProgress(currentBand, bandGoal)
    const chartData = buildChartData(progress)
    const improvement = chartData.length >= 2
        ? +(chartData[chartData.length - 1].score - chartData[0].score).toFixed(1)
        : 0

    const weakTypes = (progress?.top_weak_types ?? []).slice(0, 4)
    const totalAttempts = progress?.total_attempts ?? 0

    // Streak: count consecutive days with completed attempts (simple heuristic)
    const streak = (() => {
        if (!history.length) return 0
        let count = 0
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const seen = new Set<string>()
        for (const attempt of history) {
            if (!attempt.finished_at) continue
            const d = new Date(attempt.finished_at)
            d.setHours(0, 0, 0, 0)
            const key = d.toISOString()
            if (!seen.has(key)) {
                seen.add(key)
                count++
                if (count === 1 && d.getTime() < today.getTime() - 86_400_000) break
            }
        }
        return count
    })()

    // Most recent in-progress attempt for "Continue Learning" card
    const lastAttempt = history.find(a => !a.is_completed) ?? history[0] ?? null

    // ── Overall type accuracy for stats ──────────────────────────────
    const overallAccuracy = progress?.overall_type_accuracy
        ? Math.round(
            Object.values(progress.overall_type_accuracy).reduce((s, v) => s + v, 0) /
            Object.values(progress.overall_type_accuracy).length
        )
        : 0

    // ── Subscription tier badge ───────────────────────────────────────
    const tierLabel = subscription?.plan?.name ?? 'Free'

    // ── Week calendar: highlight days with attempts this week ─────────
    const attemptsThisWeek = new Set(
        history
            .filter(a => a.finished_at)
            .map(a => new Date(a.finished_at!).getDay()) // 0=Sun
    )

    // ── Loading skeleton ─────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] p-4 md:p-6 lg:p-8 space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                    <Skeleton className="xl:col-span-2 h-64 rounded-3xl" />
                    <Skeleton className="h-64 rounded-3xl" />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-3xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-72 rounded-3xl" />)}
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-400 text-sm pt-4">
                    <Loader2 size={16} className="animate-spin" />
                    Loading your dashboard…
                </div>
            </div>
        )
    }

    // ═══════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════
    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-6 lg:p-8 space-y-6">

            {error && <ErrorBanner message={error} />}

            {/* ── ROW 1: Hero + Today's Plan ─────────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

                {/* Hero card */}
                <Fade delay={0} className="xl:col-span-2">
                    <div
                        className="relative overflow-hidden rounded-3xl p-7 md:p-9 flex flex-col md:flex-row
                       items-start md:items-center gap-8"
                        style={{
                            background: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 40%, #6366f1 100%)',
                            boxShadow: '0 12px 40px rgba(30,27,75,0.3)',
                        }}
                    >
                        {/* Decorative glows */}
                        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
                            style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.25) 0%, transparent 70%)' }} />
                        <div className="absolute bottom-0 left-24 w-48 h-48 rounded-full pointer-events-none"
                            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', transform: 'translateY(40%)' }} />

                        {/* Subscription tier badge */}
                        <div className="absolute top-5 right-6">
                            <span
                                className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                                style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(199,210,254,0.8)' }}
                            >
                                {tierLabel}
                            </span>
                        </div>

                        {/* Left text */}
                        <div className="relative flex-1 space-y-4">
                            <div>
                                <p className="text-indigo-300/60 text-xs font-semibold uppercase tracking-[0.15em] mb-2">
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </p>
                                <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
                                    {greeting}, {firstName(user?.full_name, user?.username)} {emoji}
                                </h1>
                            </div>

                            <div
                                className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5"
                                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                            >
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                                <p className="text-[13.5px] text-indigo-100/80 font-medium leading-snug">
                                    {currentBand > 0
                                        ? <>You are <span className="text-white font-bold">{progressPct}% closer</span> to achieving your goal of{' '}
                                            <span className="text-white font-bold">IELTS Band {bandGoal.toFixed(1)}</span></>
                                        : <>Complete your first mock test to start tracking progress</>
                                    }
                                </p>
                            </div>

                            {/* Progress bar */}
                            {currentBand > 0 && (
                                <div className="space-y-1.5">
                                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                        <div
                                            className="h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #818cf8, #a5b4fc)' }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10.5px] font-semibold" style={{ color: 'rgba(199,210,254,0.5)' }}>
                                        <span>Current: {currentBand.toFixed(1)}</span>
                                        <span>Goal: {bandGoal.toFixed(1)}</span>
                                    </div>
                                </div>
                            )}

                            <Link
                                href="/practice"
                                className="inline-flex items-center gap-2 text-[13px] font-bold px-5 py-2.5 rounded-2xl
                           transition-all duration-200 hover:gap-3 active:scale-[0.97]"
                                style={{ background: 'white', color: C.indigoDark }}
                            >
                                Continue Practice
                                <ArrowRight size={14} />
                            </Link>
                        </div>

                        {/* Right: circular progress */}
                        <div className="relative shrink-0 flex flex-col items-center gap-3">
                            <CircleProgress current={currentBand} size={168} />
                            <div
                                className="flex flex-col items-center px-5 py-2.5 rounded-2xl"
                                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                            >
                                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(199,210,254,0.5)' }}>Target Score</p>
                                <p className="text-2xl font-black text-white">{bandGoal.toFixed(1)}</p>
                                <p className="text-[10px]" style={{ color: 'rgba(199,210,254,0.5)' }}>IELTS Band</p>
                            </div>
                        </div>
                    </div>
                </Fade>

                {/* Today's Plan */}
                <Fade delay={80}>
                    <Card className="p-6 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-[15px] font-bold text-gray-800">Today's Plan</h2>
                            <Link href="/daily-plan"
                                className="text-[11.5px] font-semibold transition-colors hover:text-indigo-600"
                                style={{ color: C.indigo }}>
                                View All
                            </Link>
                        </div>

                        {/* Week calendar */}
                        <div className="grid grid-cols-7 gap-1 mb-5">
                            {WEEK_DAYS.map((d, i) => {
                                // Mon=0→1, Tue=0→2 … Sun=6→0 (getDay)
                                const jsDay = (i + 1) % 7
                                const hasDone = attemptsThisWeek.has(jsDay)
                                const date = (() => {
                                    const now = new Date()
                                    const dow = now.getDay() // 0=Sun
                                    const diff = (i + 1) % 7 - dow
                                    const d2 = new Date(now)
                                    d2.setDate(now.getDate() + diff)
                                    return d2.getDate()
                                })()
                                const isToday = date === TODAY_DATE
                                return (
                                    <div key={d} className="flex flex-col items-center gap-1.5">
                                        <span className="text-[9.5px] font-semibold text-gray-400 uppercase">{d}</span>
                                        <div
                                            className={`w-8 h-8 rounded-xl flex items-center justify-center text-[12.5px] font-bold
                                  transition-all duration-200 relative
                                  ${isToday ? 'shadow-md' : 'hover:bg-gray-50 cursor-pointer'}`}
                                            style={isToday
                                                ? { background: C.indigo, color: 'white', boxShadow: `0 4px 12px ${C.indigo}40` }
                                                : { color: hasDone ? C.emerald : '#9ca3af' }
                                            }
                                        >
                                            {date}
                                            {hasDone && !isToday && (
                                                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400" />
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="h-px bg-gray-50 mb-4" />

                        {/* Tasks */}
                        <div className="space-y-3 flex-1">
                            {tasks.map((task, i) => (
                                <button
                                    key={i}
                                    onClick={() => toggleTask(i)}
                                    className="w-full flex items-center gap-3 group"
                                >
                                    <div className={`shrink-0 transition-all duration-200 ${task.done ? 'scale-110' : 'group-hover:scale-105'}`}>
                                        {task.done
                                            ? <CheckCircle size={20} style={{ color: C.emerald }} />
                                            : <Circle size={20} className="text-gray-300 group-hover:text-indigo-400 transition-colors" />
                                        }
                                    </div>
                                    <span className={`flex-1 text-left text-[13px] font-medium transition-colors
                    ${task.done ? 'line-through text-gray-300' : 'text-gray-700 group-hover:text-gray-900'}`}>
                                        {task.label}
                                    </span>
                                    <span className={`text-[11px] font-bold tabular-nums shrink-0
                    ${task.done ? 'text-emerald-500' : 'text-gray-400'}`}>
                                        {task.time}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </Card>
                </Fade>
            </div>

            {/* ── ROW 2: 4 Stat Cards ──────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        label: 'Day Streak',
                        value: streak,
                        suffix: '',
                        decimals: 0,
                        sub: streak > 0 ? 'Keep it up!' : 'Start today!',
                        icon: Flame,
                        color: C.orange,
                        bg: '#fff7ed',
                    },
                    {
                        label: 'Total Attempts',
                        value: totalAttempts,
                        suffix: '',
                        decimals: 0,
                        sub: 'All time',
                        icon: BookOpen,
                        color: C.indigo,
                        bg: C.indigoLight,
                    },
                    {
                        label: 'Best Band',
                        value: bestBand,
                        suffix: '',
                        decimals: 1,
                        sub: bestBand > 0 ? `Avg: ${avgBand.toFixed(1)}` : 'No attempts yet',
                        icon: Clock,
                        color: C.teal,
                        bg: '#f0fdfa',
                    },
                    {
                        label: 'Avg Accuracy',
                        value: overallAccuracy,
                        suffix: '%',
                        decimals: 0,
                        sub: 'All question types',
                        icon: Target,
                        color: C.violet,
                        bg: '#f5f3ff',
                    },
                ].map((s, i) => {
                    const Icon = s.icon
                    return (
                        <Fade key={s.label} delay={120 + i * 60}>
                            <Card className="p-5 group cursor-default relative overflow-hidden">
                                <div className="flex items-start justify-between mb-4">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center
                               transition-transform duration-200 group-hover:scale-110"
                                        style={{ background: s.bg }}
                                    >
                                        <Icon size={18} style={{ color: s.color }} />
                                    </div>
                                    <ArrowUpRight size={14} className="text-gray-200 group-hover:text-gray-400 transition-colors" />
                                </div>
                                <p className="text-[10.5px] text-gray-400 font-semibold uppercase tracking-wider mb-1">{s.label}</p>
                                <p className="text-[28px] font-black tracking-tight leading-none mb-1" style={{ color: s.color }}>
                                    <Counter to={s.value} decimals={s.decimals} suffix={s.suffix} />
                                </p>
                                <p className="text-[11px] text-gray-400">{s.sub}</p>
                                <div className="absolute inset-x-5 top-0 h-[2px] rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{ background: s.color }} />
                            </Card>
                        </Fade>
                    )
                })}
            </div>

            {/* ── ROW 3: Continue Learning + AI Weakness + Score Chart ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Continue Learning */}
                <Fade delay={240} className="lg:col-span-1">
                    <Card className="p-0 overflow-hidden flex flex-col h-full">
                        <div
                            className="relative h-36 flex items-center justify-center shrink-0"
                            style={{ background: 'linear-gradient(135deg, #312e81 0%, #4f46e5 100%)' }}
                        >
                            <div className="absolute inset-0 opacity-20"
                                style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                            <div className="relative text-center px-4">
                                {lastAttempt ? (
                                    <>
                                        <p className="text-[10px] font-bold text-indigo-300/70 uppercase tracking-widest mb-1">IELTS Reading</p>
                                        <p className="text-lg font-black text-white line-clamp-1">{lastAttempt.global_title}</p>
                                        <span className="mt-1.5 inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full"
                                            style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>
                                            {lastAttempt.mode === 'EXAM' ? 'Exam Mode' : 'Practice Mode'}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-[10px] font-bold text-indigo-300/70 uppercase tracking-widest mb-1">IELTS</p>
                                        <p className="text-lg font-black text-white">Start Your First Test</p>
                                        <span className="mt-1.5 inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full"
                                            style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>
                                            Free Practice
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="p-5 flex flex-col gap-4 flex-1">
                            {lastAttempt ? (
                                <>
                                    <div>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-[12px] font-semibold text-gray-600">Score</span>
                                            <span className="text-[12px] font-bold" style={{ color: C.indigo }}>
                                                {lastAttempt.band_score ? `Band ${lastAttempt.band_score.toFixed(1)}` : `${lastAttempt.score_percent.toFixed(0)}%`}
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full overflow-hidden" style={{ background: C.indigoLight }}>
                                            <div className="h-full rounded-full transition-all duration-1000"
                                                style={{
                                                    width: `${lastAttempt.band_score ? (lastAttempt.band_score / 9) * 100 : lastAttempt.score_percent}%`,
                                                    background: `linear-gradient(90deg, ${C.indigo}, ${C.indigoDark})`
                                                }} />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-[11.5px] text-gray-500">
                                        <span className="flex items-center gap-1.5">
                                            <BookOpen size={12} className="text-gray-400" />
                                            {lastAttempt.correct_count}/{lastAttempt.total_questions} Correct
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={12} className="text-gray-400" />
                                            {lastAttempt.is_completed ? 'Completed' : 'In Progress'}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <p className="text-[12.5px] text-gray-500 flex-1">
                                    Take your first IELTS Reading test to start tracking your progress and band score.
                                </p>
                            )}

                            <Link
                                href={lastAttempt && !lastAttempt.is_completed
                                    ? `/exams/${lastAttempt.test_id}`
                                    : '/exams'
                                }
                                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl
                           text-[13px] font-bold transition-all duration-200
                           hover:gap-3 active:scale-[0.97]"
                                style={{ background: C.indigoLight, color: C.indigoDark }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#c7d2fe' }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.indigoLight }}
                            >
                                {lastAttempt && !lastAttempt.is_completed ? 'Continue' : 'Start Test'}
                                <ArrowRight size={14} />
                            </Link>
                        </div>
                    </Card>
                </Fade>

                {/* AI Weakness Analysis */}
                <Fade delay={300} className="lg:col-span-1">
                    <Card className="p-6 flex flex-col h-full">
                        <div className="flex items-start gap-3 mb-1">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: '#fef3c7' }}>
                                <Brain size={15} style={{ color: '#d97706' }} />
                            </div>
                            <div>
                                <h2 className="text-[14.5px] font-bold text-gray-800">AI Weakness Analysis</h2>
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                    {weakTypes.length > 0 ? 'Based on your recent tests' : 'Complete tests to see analysis'}
                                </p>
                            </div>
                        </div>

                        <div className="h-px bg-gray-50 my-4" />

                        <div className="space-y-2.5 flex-1">
                            {weakTypes.length > 0 ? weakTypes.map((qt) => {
                                const accuracy = progress?.overall_type_accuracy?.[qt] ?? 0
                                const isHigh = accuracy < 50
                                return (
                                    <div
                                        key={qt}
                                        className="flex items-center justify-between p-3 rounded-2xl transition-colors hover:bg-gray-50"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-2 h-2 rounded-full shrink-0"
                                                style={{ background: isHigh ? C.rose : C.amber }} />
                                            <span className="text-[12.5px] font-medium text-gray-700">
                                                {QT_LABELS[qt] ?? qt.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                        <span
                                            className="text-[10.5px] font-bold px-2.5 py-1 rounded-full"
                                            style={isHigh
                                                ? { background: '#fff1f2', color: '#be123c' }
                                                : { background: '#fffbeb', color: '#92400e' }
                                            }
                                        >
                                            {accuracy.toFixed(0)}%
                                        </span>
                                    </div>
                                )
                            }) : (
                                // Placeholder when no data yet
                                <div className="flex-1 flex flex-col items-center justify-center py-6 text-center gap-2">
                                    <Brain size={32} className="text-gray-200" />
                                    <p className="text-[12px] text-gray-400">
                                        Complete at least one test to unlock your weakness analysis.
                                    </p>
                                </div>
                            )}
                        </div>

                        <button
                            className="mt-4 w-full flex items-center justify-center gap-2
                         py-3 rounded-2xl text-[13px] font-bold transition-all duration-200
                         hover:shadow-md active:scale-[0.97]"
                            style={{
                                background: 'linear-gradient(135deg, #1e1b4b, #4f46e5)',
                                color: 'white',
                                boxShadow: `0 4px 14px ${C.indigo}30`,
                            }}
                        >
                            <Sparkles size={14} />
                            Generate Study Plan
                        </button>
                    </Card>
                </Fade>

                {/* Score Progress Chart */}
                <Fade delay={360} className="lg:col-span-1">
                    <Card className="p-6 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-1">
                            <h2 className="text-[14.5px] font-bold text-gray-800">Score Progress</h2>
                            <div
                                className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg cursor-pointer"
                                style={{ background: C.indigoLight, color: C.indigoDark }}
                            >
                                IELTS ▾
                            </div>
                        </div>
                        <p className="text-[11px] text-gray-400 mb-4">
                            {chartData.length > 0 ? `Last ${chartData.length} sessions` : 'No data yet'}
                        </p>

                        <div className="flex-1 min-h-0">
                            {chartData.length > 1 ? (
                                <ResponsiveContainer width="100%" height={180}>
                                    <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={C.indigo} stopOpacity={0.18} />
                                                <stop offset="100%" stopColor={C.indigo} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }}
                                            axisLine={false} tickLine={false} interval={1}
                                        />
                                        <YAxis
                                            domain={[Math.max(0, Math.floor(Math.min(...chartData.map(d => d.score)) - 0.5)), 9]}
                                            tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }}
                                            axisLine={false} tickLine={false}
                                        />
                                        <Tooltip content={<ChartTooltip />} cursor={{ stroke: C.indigo, strokeWidth: 1, strokeDasharray: '4 2' }} />
                                        <Area
                                            type="monotone" dataKey="score"
                                            stroke={C.indigo} strokeWidth={2.5} fill="url(#scoreGrad)"
                                            dot={{ r: 3.5, fill: 'white', stroke: C.indigoDark, strokeWidth: 2 }}
                                            activeDot={{ r: 5, fill: C.indigo, stroke: 'white', strokeWidth: 2 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[180px] flex items-center justify-center">
                                    <div className="text-center">
                                        <TrendingUp size={32} className="text-gray-200 mx-auto mb-2" />
                                        <p className="text-[12px] text-gray-400">Complete tests to see your chart</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-px bg-gray-50 mt-2 mb-3" />

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] text-gray-400 font-medium">Overall Improvement</p>
                                <p className="text-[11px] text-gray-400">
                                    {chartData.length > 1 ? `Last ${chartData.length} sessions` : 'No data yet'}
                                </p>
                            </div>
                            <span
                                className="text-[18px] font-black"
                                style={{ color: improvement >= 0 ? C.emerald : C.rose }}
                            >
                                {improvement >= 0 ? '+' : ''}{improvement.toFixed(1)}
                            </span>
                        </div>
                    </Card>
                </Fade>
            </div>

            {/* ── ROW 4: Quick Practice + Achievements ──────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                {/* Quick Practice */}
                <Fade delay={440} className="lg:col-span-3">
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-[14.5px] font-bold text-gray-800">Quick Practice</h2>
                            <Link href="/practice"
                                className="text-[11.5px] font-semibold hover:text-indigo-600 transition-colors"
                                style={{ color: C.indigo }}>
                                View all
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {PRACTICE_CARDS.map((p, i) => {
                                const Icon = p.icon
                                return (
                                    <Fade key={p.label} delay={480 + i * 50}>
                                        <Link
                                            href={p.href}
                                            className="group flex flex-col gap-3 p-4 rounded-2xl border border-gray-100
                                 hover:border-transparent hover:shadow-md
                                 transition-all duration-250 hover:-translate-y-0.5"
                                            onMouseEnter={e => {
                                                const el = e.currentTarget as HTMLElement
                                                el.style.borderColor = p.color + '30'
                                                el.style.background = p.color + '06'
                                            }}
                                            onMouseLeave={e => {
                                                const el = e.currentTarget as HTMLElement
                                                el.style.borderColor = ''
                                                el.style.background = ''
                                            }}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div
                                                    className="w-9 h-9 rounded-xl flex items-center justify-center
                                     transition-transform duration-200 group-hover:scale-110"
                                                    style={{ background: p.color + '12' }}
                                                >
                                                    <Icon size={16} style={{ color: p.color }} />
                                                </div>
                                                <ArrowRight
                                                    size={13}
                                                    className="text-gray-300 group-hover:translate-x-0.5 transition-all duration-200"
                                                    style={{ color: p.color + '60' }}
                                                />
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-bold text-gray-800 group-hover:text-gray-900 leading-tight">
                                                    {p.label}
                                                </p>
                                                <p className="text-[11px] text-gray-400 mt-0.5">{p.desc}</p>
                                            </div>
                                        </Link>
                                    </Fade>
                                )
                            })}
                        </div>
                    </Card>
                </Fade>

                {/* Achievements */}
                <Fade delay={480} className="lg:col-span-2">
                    <Card className="p-6 h-full">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-[14.5px] font-bold text-gray-800">Achievements</h2>
                            <Link href="/profile"
                                className="text-[11.5px] font-semibold hover:text-indigo-600 transition-colors"
                                style={{ color: C.indigo }}>
                                View All
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {ACHIEVEMENTS.map((a, i) => {
                                const Icon = a.icon
                                // Dynamically unlock based on real data
                                const unlocked =
                                    (a.label === '7 Day Streak' && streak >= 7) ||
                                    (a.label === 'First Mock Completed' && totalAttempts >= 1) ||
                                    (a.label === 'Top 10% Performer' && overallAccuracy >= 90) ||
                                    (a.label === 'Vocabulary Master') // static for now
                                return (
                                    <Fade key={a.label} delay={520 + i * 50}>
                                        <div
                                            className="flex flex-col items-center text-center gap-2.5 p-4 rounded-2xl
                                 border border-gray-50 hover:border-transparent hover:shadow-sm
                                 transition-all duration-200 cursor-default group relative overflow-hidden"
                                            style={{ background: unlocked ? a.bg : '#f9fafb' }}
                                        >
                                            {!unlocked && (
                                                <div className="absolute inset-0 bg-white/60 rounded-2xl z-10 flex items-center justify-center">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Locked</span>
                                                </div>
                                            )}
                                            <div
                                                className="w-12 h-12 rounded-2xl flex items-center justify-center
                                   transition-transform duration-200 group-hover:scale-110"
                                                style={{ background: 'white', boxShadow: `0 4px 12px ${a.color}20` }}
                                            >
                                                <Icon size={22} style={{ color: unlocked ? a.color : '#d1d5db' }} />
                                            </div>
                                            <div>
                                                <p className="text-[11.5px] font-bold text-gray-800 leading-tight">{a.label}</p>
                                                <p className="text-[10px] text-gray-400 mt-0.5">{a.sub}</p>
                                            </div>
                                        </div>
                                    </Fade>
                                )
                            })}
                        </div>
                    </Card>
                </Fade>
            </div>

        </div>
    )
}