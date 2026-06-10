"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/AuthContext"
import {
    Search,
    ChevronDown,
    BookOpen,
    Clock,
    BarChart2,
    ArrowRight,
    Trophy,
    Target,
    CheckCircle2,
    Circle,
    RotateCcw,
    TrendingUp,
    ListFilter,
    Lock,
    Crown,
    Star,
} from "lucide-react"
import {
    listTests,
    getMyHistory,
    getMyProgress,
    computeProgressStats,
    type ReadingTestListOut,
    type AttemptHistoryOut,
    type ProgressOut,
    type SubscriptionTierEnum,
} from "@/lib/api/ielts_reading"
import { billingApi } from "@/lib/api/billing"
import type { Subscription } from "@/lib/types/billing"
import { useRouter, useSearchParams } from "next/navigation"
import { BackButton } from "@/components/common/BackButton"

// ─── Types ────────────────────────────────────────────────────────────

type StatusFilter = "All" | "Not started" | "Completed"
type SortOption = "newest" | "oldest"

// ─── Helpers ──────────────────────────────────────────────────────────

function getBandColor(score: number) {
    if (score >= 7.5) return "text-emerald-600"
    if (score >= 6) return "text-blue-600"
    if (score >= 4.5) return "text-amber-500"
    return "text-rose-500"
}

function getBandBg(score: number) {
    if (score >= 7.5) return "#10b981"
    if (score >= 6) return "#3b82f6"
    if (score >= 4.5) return "#f59e0b"
    return "#ef4444"
}

function getBandLabel(score: number) {
    if (score >= 8.5) return "Expert"
    if (score >= 7.5) return "Very Good"
    if (score >= 6.5) return "Good"
    if (score >= 5.5) return "Competent"
    if (score >= 4.5) return "Modest"
    return "Developing"
}

function getTierFromSubscription(sub: Subscription | null): SubscriptionTierEnum {
    if (!sub || sub.status !== "active") return "FREE"
    const slug = (sub.plan?.slug ?? "").toLowerCase()
    if (slug.includes("pro")) return "PRO"
    if (slug.includes("premium")) return "PREMIUM"
    return "FREE"
}

// ─── Animation variants ───────────────────────────────────────────────

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.04 } },
}

const cardItem = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: "easeOut" } },
}

const MAX_W = "max-w-[1280px]"

// ─── Skeleton ─────────────────────────────────────────────────────────

function Skeleton() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={i}
                    className="h-[152px] rounded-xl bg-gray-100 animate-pulse"
                    style={{ animationDelay: `${i * 60}ms` }}
                />
            ))}
        </div>
    )
}

// ─── ScoreRing ────────────────────────────────────────────────────────

function ScoreRing({ score, size = 72 }: { score: number; size?: number }) {
    const r = size / 2 - 7
    const circ = 2 * Math.PI * r
    const dash = circ * Math.min(score / 9, 1)
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
            <circle
                cx={size / 2} cy={size / 2} r={r}
                fill="none"
                stroke={getBandBg(score)}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circ}`}
                className="transition-all duration-1000 ease-out"
            />
        </svg>
    )
}

// ─── TierBadge ────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: SubscriptionTierEnum }) {
    if (tier === "FREE") return null
    const styles: Record<string, string> = {
        PREMIUM: "bg-blue-50 text-blue-700 border-blue-200",
        PRO: "bg-amber-50 text-amber-700 border-amber-200",
    }
    const icons: Record<string, React.ReactNode> = {
        PREMIUM: <Star className="w-3 h-3" />,
        PRO: <Crown className="w-3 h-3" />,
    }
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${styles[tier]}`}>
            {icons[tier]}
            {tier}
        </span>
    )
}

// ─── TestCard ─────────────────────────────────────────────────────────

function TestCard({
    test, lastAttempt, tier,
}: {
    test: ReadingTestListOut
    lastAttempt?: AttemptHistoryOut
    tier: SubscriptionTierEnum
}) {
    const isLocked = !test.is_free && tier === "FREE"
    const isCompleted = lastAttempt?.is_completed ?? false
    const isInProgress = !!lastAttempt && !lastAttempt.is_completed

    const actionLabel = isLocked ? "Upgrade" : isCompleted ? "Review" : isInProgress ? "Continue" : "Start"
    const actionColor = isLocked ? "text-amber-600" : isCompleted ? "text-emerald-600" : "text-indigo-600"
    const href = isLocked ? "/pricing" : `/tests/ielts/reading?id=${test.id}`

    return (
        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.985 }}>
            <Link
                href={href}
                className={`
                    group relative flex flex-col justify-between
                    h-[152px] rounded-xl border bg-white px-4 py-4
                    transition-all duration-200
                    ${isLocked
                        ? "border-gray-200 opacity-70 hover:opacity-100"
                        : isInProgress
                            ? "border-indigo-300 ring-1 ring-indigo-100 hover:border-indigo-400 hover:shadow-md"
                            : "border-gray-200 hover:border-indigo-300 hover:shadow-md"
                    }
                `}
            >
                {isLocked && (
                    <div className="absolute top-3.5 right-3.5">
                        <Lock className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                )}

                {/* Title + status */}
                <div className="flex items-start justify-between gap-2">
                    <p className={`text-[13px] font-semibold line-clamp-2 leading-snug flex-1 ${isLocked ? "text-gray-500" : "text-gray-800"}`}>
                        {test.global_title}
                    </p>
                    {!isLocked && (
                        isCompleted
                            ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            : isInProgress
                                ? (
                                    <span className="shrink-0 mt-1 w-3.5 h-3.5 rounded-full bg-indigo-100 border border-indigo-300 flex items-center justify-center">
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    </span>
                                )
                                : <Circle className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                    )}
                </div>

                {/* Tags */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    {test.is_free
                        ? <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">FREE</span>
                        : <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">PREMIUM</span>
                    }
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                        {test.parts_count} parts
                    </span>
                    {lastAttempt?.band_score != null && (
                        <span className={`text-[10px] font-semibold ml-auto ${getBandColor(lastAttempt.band_score)}`}>
                            Band {lastAttempt.band_score.toFixed(1)}
                        </span>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-[11px] text-gray-400">
                        <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {test.parts_count} parts
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {test.time_limit_min} min
                        </span>
                    </div>
                    <span className={`flex items-center gap-1 text-[11px] font-semibold group-hover:opacity-70 transition-opacity ${actionColor}`}>
                        {actionLabel}
                        <ArrowRight className="w-3 h-3" />
                    </span>
                </div>
            </Link>
        </motion.div>
    )
}

// ─── StatCard ─────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, color }: {
    icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string
}) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 h-[88px]">
            <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[11px] text-gray-400 font-medium truncate">{label}</p>
                <p className="text-[22px] font-bold text-gray-900 leading-tight">{value}</p>
                {sub && <p className="text-[10px] text-gray-400 truncate">{sub}</p>}
            </div>
        </div>
    )
}

// ─── UpgradeBanner ────────────────────────────────────────────────────

function UpgradeBanner({ lockedCount }: { lockedCount: number }) {
    if (lockedCount === 0) return null
    return (
        <div className="mb-5 flex items-center justify-between gap-4 rounded-xl bg-indigo-50 border border-indigo-200 px-5 py-3.5">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4 text-indigo-600" />
                </div>
                <p className="text-sm text-indigo-800">
                    <span className="font-semibold">{lockedCount} tests locked.</span>
                    {" "}Upgrade to unlock all tests, Part mode &amp; full EXAM conditions.
                </p>
            </div>
            <Link
                href="/pricing"
                className="shrink-0 px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >
                Upgrade
            </Link>
        </div>
    )
}

// ─── Constants ────────────────────────────────────────────────────────

const STATUS_FILTERS: StatusFilter[] = ["All", "Not started", "Completed"]
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: "newest", label: "Newest first" },
    { value: "oldest", label: "Oldest first" },
]

// ─── Page ─────────────────────────────────────────────────────────────

export default function ReadingPage() {
    const { user } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams();
    const queryId = searchParams?.get('id');
    // If URL contains ?id=..., redirect to the dynamic test page
    useEffect(() => {
        if (queryId) {
            router.replace(`/tests/ielts/reading/${queryId}`);
        }
    }, [queryId, router]);

    // ── Data ──
    const [tests, setTests] = useState<ReadingTestListOut[]>([])
    const [history, setHistory] = useState<AttemptHistoryOut[]>([])
    const [progress, setProgress] = useState<ProgressOut | null>(null)
    const [subscription, setSubscription] = useState<Subscription | null>(null)
    const [loading, setLoading] = useState(true)

    // ── Filters ──
    const [query, setQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("All")
    const [freeOnly, setFreeOnly] = useState(false)
    const [sortBy, setSortBy] = useState<SortOption>("newest")
    const [showSortMenu, setShowSortMenu] = useState(false)

    // ── Animated score ──
    const [displayScore, setDisplayScore] = useState(0)

    // ── Derived ──
    const tier = getTierFromSubscription(subscription)

    // FIX: compute from attempts array, not non-existent root fields
    const { latestBand, bestBand } = computeProgressStats(progress)

    const lastAttemptByTest = useMemo<Record<string, AttemptHistoryOut>>(() => {
        const map: Record<string, AttemptHistoryOut> = {}
        for (const a of history) {
            if (!(a.test_id in map)) map[a.test_id] = a
        }
        return map
    }, [history])

    // ── Fetch ──
    useEffect(() => {
        const init = async () => {
            try {
                const [testsRes, subRes] = await Promise.all([
                    listTests({ limit: 100 }),
                    billingApi.getMySubscription(),
                ])
                const sorted = [...testsRes].sort((a, b) => b.id.localeCompare(a.id))
                setTests(sorted)
                setSubscription(subRes)

                // FIX: getMyHistory is fine; getMyProgress requires a test_id.
                // Load history first, then load progress for the first completed test.
                getMyHistory({ limit: 100 })
                    .then((hist) => {
                        setHistory(hist)
                        // find the most recent completed attempt's test_id for progress
                        const firstCompleted = hist.find((a) => a.is_completed)
                        if (firstCompleted) {
                            getMyProgress(firstCompleted.test_id)
                                .then(setProgress)
                                .catch(() => { })
                        }
                    })
                    .catch(() => { })
            } finally {
                setLoading(false)
            }
        }
        init()
    }, [])

    // ── Animate band score ──
    useEffect(() => {
        if (!latestBand) return
        const step = latestBand / (700 / 16)
        let cur = 0
        const iv = setInterval(() => {
            cur += step
            if (cur >= latestBand) { setDisplayScore(latestBand); clearInterval(iv) }
            else setDisplayScore(Number(cur.toFixed(1)))
        }, 16)
        return () => clearInterval(iv)
    }, [latestBand])

    // ── Close sort dropdown ──
    useEffect(() => {
        if (!showSortMenu) return
        const h = () => setShowSortMenu(false)
        window.addEventListener("click", h)
        return () => window.removeEventListener("click", h)
    }, [showSortMenu])

    // ── Filtered list ──
    const filtered = useMemo(() => {
        let r = [...tests]
        if (query) r = r.filter(t => t.global_title.toLowerCase().includes(query.toLowerCase()))
        if (freeOnly) r = r.filter(t => t.is_free)
        if (statusFilter === "Completed") r = r.filter(t => lastAttemptByTest[t.id]?.is_completed)
        else if (statusFilter === "Not started") r = r.filter(t => !lastAttemptByTest[t.id])
        if (sortBy === "oldest") r = [...r].reverse()
        return r
    }, [tests, query, freeOnly, statusFilter, sortBy, lastAttemptByTest])

    const lockedCount = tests.filter(t => !t.is_free && tier === "FREE").length
    const completedCount = Object.values(lastAttemptByTest).filter(a => a.is_completed).length
    const hasFilters = query !== "" || statusFilter !== "All" || freeOnly

    const clearAllFilters = useCallback(() => {
        setQuery(""); setStatusFilter("All"); setFreeOnly(false)
    }, [])

    // ─── Render ────────────────────────────────────────────────────────
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50">

            {/* ══ HEADER ══════════════════════════════════════════════ */}
            <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-[56px]">
                <div className={`${MAX_W} mx-auto px-6 h-full flex items-center`}>
                    <BackButton fallback="/dashboard" />
                    <span className="absolute left-1/2 -translate-x-1/2 text-sm font-semibold text-gray-800 pointer-events-none select-none">
                        Reading
                    </span>
                </div>
            </header>

            {/* ══ HERO ════════════════════════════════════════════════ */}
            <section className="bg-white border-b border-gray-200">
                <div className={`${MAX_W} mx-auto px-6 py-8`}>
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">

                        {/* Left */}
                        <div className="shrink-0">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="bg-indigo-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded tracking-wide">IELTS</span>
                                <span className="text-[11px] text-gray-400 font-medium tracking-widest uppercase">Academic Reading</span>
                                {tier !== "FREE" && <TierBadge tier={tier} />}
                            </div>
                            <h1 className="text-[26px] font-bold text-gray-900 leading-tight mb-3">
                                Reading Mock Tests
                            </h1>
                            <ul className="space-y-1.5 text-sm text-gray-500">
                                {[
                                    "Full 60-minute exam experience",
                                    "Cambridge IELTS authentic materials",
                                    "Instant band score & detailed feedback",
                                ].map(t => (
                                    <li key={t} className="flex items-center gap-2">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                        {t}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Right: stat grid */}
                        <div className="w-full lg:max-w-[660px] grid grid-cols-2 lg:grid-cols-4 gap-3">

                            {/* Score ring */}
                            <div className="col-span-2 h-[88px] flex items-center gap-5 rounded-xl border border-gray-200 bg-white px-5">
                                <div className="relative w-[72px] h-[72px] shrink-0">
                                    <ScoreRing score={latestBand} size={72} />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className={`text-[20px] font-bold leading-none ${latestBand ? getBandColor(latestBand) : "text-gray-300"}`}>
                                            {latestBand ? displayScore.toFixed(1) : "–"}
                                        </span>
                                        <span className="text-[10px] text-gray-400 mt-0.5">/ 9.0</span>
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[13px] font-semibold text-gray-800 truncate">
                                        {latestBand ? getBandLabel(latestBand) : "No attempts yet"}
                                    </p>
                                    <p className="text-[11px] text-gray-400 mt-0.5">Latest band score</p>
                                    {bestBand > 0 && (
                                        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                                            <TrendingUp className="w-3 h-3" />
                                            Best: {bestBand.toFixed(1)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <StatCard
                                icon={<Trophy className="w-4 h-4 text-amber-600" />}
                                color="bg-amber-50"
                                label="Completed"
                                value={completedCount || "–"}
                                sub={`of ${tests.length} tests`}
                            />
                            <StatCard
                                icon={<Target className="w-4 h-4 text-indigo-600" />}
                                color="bg-indigo-50"
                                label="Progress"
                                value={`${Math.round((completedCount / (tests.length || 1)) * 100)}%`}
                                sub="Completion rate"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ CONTENT ══════════════════════════════════════════════ */}
            <div className={`${MAX_W} mx-auto px-6 py-6`}>
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

                    {/* Tab bar */}
                    <div className="flex items-center h-[52px] px-6 border-b border-gray-200">
                        <button className="flex items-center gap-2 h-full px-1 mr-6 border-b-2 border-indigo-600 text-indigo-600 text-sm font-semibold whitespace-nowrap">
                            <BookOpen className="w-4 h-4" />
                            Reading
                        </button>
                    </div>

                    {/* Filter bar */}
                    <div className="flex flex-wrap gap-2.5 items-center px-6 py-3.5 border-b border-gray-100">

                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Search tests…"
                                className="w-full h-10 pl-9 pr-9 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition bg-gray-50"
                            />
                            {query && (
                                <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Status */}
                        <div className="relative w-[152px]">
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value as StatusFilter)}
                                className="w-full h-10 pl-3 pr-8 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 bg-white text-gray-600 appearance-none cursor-pointer hover:bg-gray-50 transition"
                            >
                                {STATUS_FILTERS.map(s => (
                                    <option key={s} value={s}>{s === "All" ? "All statuses" : s}</option>
                                ))}
                            </select>
                            <ListFilter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        </div>

                        {/* Free only */}
                        <button
                            onClick={() => setFreeOnly(p => !p)}
                            className={`h-10 px-4 border rounded-xl text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${freeOnly ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-gray-200 hover:bg-gray-50 text-gray-600"}`}
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Free only
                        </button>

                        {/* Sort */}
                        <div className="relative w-[152px]">
                            <button
                                onClick={e => { e.stopPropagation(); setShowSortMenu(p => !p) }}
                                className="w-full h-10 px-3 border border-gray-200 rounded-xl text-sm flex items-center gap-2 hover:bg-gray-50 text-gray-600 transition-colors"
                            >
                                <BarChart2 className="w-4 h-4 shrink-0" />
                                <span className="flex-1 text-left truncate">
                                    {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                                </span>
                                <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                            </button>
                            <AnimatePresence>
                                {showSortMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.12 }}
                                        onClick={e => e.stopPropagation()}
                                        className="absolute right-0 top-[calc(100%+6px)] bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-[152px] py-1 overflow-hidden"
                                    >
                                        {SORT_OPTIONS.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => { setSortBy(opt.value); setShowSortMenu(false) }}
                                                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center justify-between ${sortBy === opt.value ? "text-indigo-600 font-medium" : "text-gray-700"}`}
                                            >
                                                {opt.label}
                                                {sortBy === opt.value && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* List area */}
                    <div className="px-6 py-6">
                        {!loading && <UpgradeBanner lockedCount={lockedCount} />}

                        <div className="flex items-center justify-between mb-4 h-7">
                            <div className="flex items-center gap-2">
                                <h2 className="text-sm font-semibold text-gray-700">Reading Question Sets</h2>
                                {!loading && (
                                    <span className="text-xs text-gray-400">
                                        ({filtered.length}{filtered.length !== tests.length && ` of ${tests.length}`})
                                    </span>
                                )}
                            </div>
                            {hasFilters && (
                                <button onClick={clearAllFilters} className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-600 font-medium">
                                    <RotateCcw className="w-3 h-3" />
                                    Clear filters
                                </button>
                            )}
                        </div>

                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <Skeleton />
                                </motion.div>
                            ) : filtered.length === 0 ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center justify-center py-20 text-center"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                                        <Search className="w-6 h-6 text-gray-300" />
                                    </div>
                                    <p className="text-gray-600 font-medium text-sm mb-1">No tests found</p>
                                    <p className="text-gray-400 text-xs mb-4">
                                        {query ? `No results for "${query}"` : "Try adjusting your filters"}
                                    </p>
                                    <button onClick={clearAllFilters} className="text-xs text-indigo-600 hover:underline font-medium">
                                        Clear all filters
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={`${query}-${statusFilter}-${freeOnly}-${sortBy}`}
                                    variants={container} initial="hidden" animate="show"
                                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                                >
                                    {filtered.map(t => (
                                        <TestCard
                                            key={t.id}
                                            test={t}
                                            lastAttempt={lastAttemptByTest[t.id]}
                                            tier={tier}
                                        />
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}