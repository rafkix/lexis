"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/AuthContext"
import {
  Search, ChevronDown, BookOpen, Clock, BarChart2,
  Trophy, CheckCircle2, Circle, RotateCcw, TrendingUp,
  ListFilter, Lock, Zap, ChevronRight,
} from "lucide-react"
import {
  listTests, getMyHistory, getMyProgress, computeProgressStats,
  type ReadingTestListOut, type AttemptHistoryOut, type ProgressOut,
  type SubscriptionTierEnum,
} from "@/lib/api/ielts_reading"
import { billingApi } from "@/lib/api/billing"
import type { Subscription } from "@/lib/types/billing"
import { useRouter, useSearchParams } from "next/navigation"
import { BackButton } from "@/components/common/BackButton"

// ── Types ──────────────────────────────────────────────────────────────────
type StatusFilter = "All" | "Not started" | "Completed"
type SortOption = "newest" | "oldest"

// ── Helpers ────────────────────────────────────────────────────────────────
function getBandColor(score: number) {
  if (score >= 7.5) return "#10b981"
  if (score >= 6) return "#6366f1"
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

// ── Animation variants ─────────────────────────────────────────────────────
const stagger = { show: { transition: { staggerChildren: 0.045 } } }
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] } },
}

// ── ScoreArc ───────────────────────────────────────────────────────────────
function ScoreArc({ score }: { score: number }) {
  const size = 88
  const r = 34
  const circ = 2 * Math.PI * r
  const pct = Math.min(score / 9, 1)
  const color = getBandColor(score)
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth="6" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${circ * pct} ${circ}`}
          style={{ transition: "stroke-dasharray 1.1s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[20px] font-black leading-none" style={{ color }}>
          {score ? score.toFixed(1) : "–"}
        </span>
        <span className="text-[9px] text-slate-400 font-medium mt-0.5">/ 9.0</span>
      </div>
    </div>
  )
}

// ── TestCard ───────────────────────────────────────────────────────────────
function TestCard({ test, lastAttempt, tier }: {
  test: ReadingTestListOut
  lastAttempt?: AttemptHistoryOut
  tier: SubscriptionTierEnum
}) {
  const isLocked = !test.is_free && tier === "FREE"
  const isCompleted = lastAttempt?.is_completed ?? false
  const isInProgress = !!lastAttempt && !lastAttempt.is_completed
  const band = lastAttempt?.band_score
  const href = isLocked ? "/pricing" : `/tests/ielts/reading/${test.id}`

  return (
    <motion.div variants={fadeUp}>
      <Link href={href} className="group block h-full">
        <div className={`
          relative rounded-2xl bg-white border p-5 h-full flex flex-col gap-3
          transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
          ${isInProgress ? "border-indigo-200 ring-1 ring-indigo-100" : "border-slate-200 hover:border-slate-300"}
          ${isLocked ? "opacity-55" : ""}
        `}>

          {/* Title row */}
          <div className="flex items-start justify-between gap-2">
            <p className={`text-[13px] font-semibold leading-snug flex-1 line-clamp-2
              ${isLocked ? "text-slate-400" : "text-slate-800"}`}>
              {test.global_title}
            </p>
            <div className="shrink-0 mt-0.5">
              {isLocked ? (
                <Lock className="w-3.5 h-3.5 text-slate-300" />
              ) : isCompleted ? (
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                </div>
              ) : isInProgress ? (
                <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                </div>
              ) : (
                <Circle className="w-4 h-4 text-slate-200" />
              )}
            </div>
          </div>

          {/* Band pill */}
          {band != null && (
            <span
              className="self-start inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold"
              style={{ backgroundColor: `${getBandColor(band)}18`, color: getBandColor(band) }}
            >
              <Zap className="w-3 h-3" />
              Band {band.toFixed(1)} · {getBandLabel(band)}
            </span>
          )}

          {/* Meta */}
          <div className="flex items-center gap-2 flex-wrap">
            {test.is_free ? (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">FREE</span>
            ) : (
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">PREMIUM</span>
            )}
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />{test.time_limit_min}m
            </span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <BookOpen className="w-3 h-3" />{test.parts_count} parts
            </span>
          </div>

          {/* CTA */}
          <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100">
            <span className={`text-[12px] font-semibold flex items-center gap-1 transition-colors
              ${isLocked ? "text-amber-500"
                : isCompleted ? "text-emerald-600"
                : isInProgress ? "text-indigo-600"
                : "text-slate-400 group-hover:text-indigo-600"
              }`}>
              {isLocked ? "Upgrade to unlock"
                : isCompleted ? "Review answers"
                : isInProgress ? "Continue test"
                : "Start test"}
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// ── Skeleton ───────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-[180px] rounded-2xl bg-slate-100 animate-pulse"
          style={{ animationDelay: `${i * 40}ms` }}
        />
      ))}
    </div>
  )
}

// ── Constants ──────────────────────────────────────────────────────────────
const STATUS_FILTERS: StatusFilter[] = ["All", "Not started", "Completed"]
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
]
const MAX_W = "max-w-[1280px]"

// ── Page ───────────────────────────────────────────────────────────────────
export default function ReadingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryId = searchParams?.get("id")

  useEffect(() => {
    if (queryId) router.replace(`/tests/ielts/reading/${queryId}`)
  }, [queryId, router])

  const [tests, setTests] = useState<ReadingTestListOut[]>([])
  const [history, setHistory] = useState<AttemptHistoryOut[]>([])
  const [progress, setProgress] = useState<ProgressOut | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All")
  const [freeOnly, setFreeOnly] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [displayScore, setDisplayScore] = useState(0)

  const tier = getTierFromSubscription(subscription)
  const { latestBand, bestBand } = computeProgressStats(progress)

  const lastAttemptByTest = useMemo<Record<string, AttemptHistoryOut>>(() => {
    const map: Record<string, AttemptHistoryOut> = {}
    for (const a of history) {
      if (!(a.test_id in map)) map[a.test_id] = a
    }
    return map
  }, [history])

  useEffect(() => {
    const init = async () => {
      try {
        const [testsRes, subRes] = await Promise.all([
          listTests({ limit: 100 }),
          billingApi.getMySubscription(),
        ])
        setTests([...testsRes].sort((a, b) => b.id.localeCompare(a.id)))
        setSubscription(subRes)
        getMyHistory({ limit: 100 }).then((hist) => {
          setHistory(hist)
          const first = hist.find((a) => a.is_completed)
          if (first) getMyProgress(first.test_id).then(setProgress).catch(() => {})
        }).catch(() => {})
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

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

  useEffect(() => {
    if (!showSortMenu) return
    const h = () => setShowSortMenu(false)
    window.addEventListener("click", h)
    return () => window.removeEventListener("click", h)
  }, [showSortMenu])

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
  const clearAllFilters = useCallback(() => { setQuery(""); setStatusFilter("All"); setFreeOnly(false) }, [])
  const progressPct = Math.round((completedCount / (tests.length || 1)) * 100)

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 h-13">
        <div className={`${MAX_W} mx-auto px-6 h-full flex items-center justify-between`}>
          {/* Back goes to IELTS skill select page */}
          <BackButton fallback="/tests/ielts" label="All skills" />
          <span className="text-[13px] font-semibold text-slate-700">IELTS Reading</span>
          <div className="w-24" />
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="bg-white border-b border-slate-200">
        <div className={`${MAX_W} mx-auto px-6 py-8`}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col lg:flex-row gap-8 items-start lg:items-center"
          >
            {/* Left */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-black tracking-[0.16em] text-white bg-indigo-600 px-2.5 py-0.5 rounded-full uppercase">
                  IELTS Academic
                </span>
                <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">Reading</span>
              </div>
              <h1 className="text-[28px] font-bold text-slate-900 leading-tight mb-2 tracking-tight">
                Mock Tests
              </h1>
              <p className="text-[13px] text-slate-500 leading-relaxed max-w-md">
                Cambridge-authentic passages · 60-minute exam conditions · instant band scores and detailed explanations.
              </p>

              {/* Progress */}
              {!loading && tests.length > 0 && (
                <div className="mt-4 max-w-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium text-slate-500">
                      {completedCount} of {tests.length} completed
                    </span>
                    <span className="text-[11px] font-bold text-indigo-600">{progressPct}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-indigo-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right: stats */}
            <div className="flex gap-3 flex-wrap lg:flex-nowrap shrink-0">
              <div className="flex items-center gap-3.5 bg-white rounded-2xl border border-slate-200 px-4 py-3.5 shadow-sm">
                <ScoreArc score={latestBand ? displayScore : 0} />
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Latest band</p>
                  <p className="text-[14px] font-bold text-slate-800">
                    {latestBand ? getBandLabel(latestBand) : "No tests yet"}
                  </p>
                  {bestBand > 0 && (
                    <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-emerald-600">
                      <TrendingUp className="w-3 h-3" />
                      Best: {bestBand.toFixed(1)}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2.5 bg-white rounded-xl border border-slate-200 px-3.5 py-2.5 shadow-sm">
                  <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                    <Trophy className="w-3 h-3 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wide">Completed</p>
                    <p className="text-[15px] font-black text-slate-800 leading-none mt-0.5">{completedCount || "–"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 bg-white rounded-xl border border-slate-200 px-3.5 py-2.5 shadow-sm">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                    <BookOpen className="w-3 h-3 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wide">Total</p>
                    <p className="text-[15px] font-black text-slate-800 leading-none mt-0.5">{tests.length || "–"}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className={`${MAX_W} mx-auto px-6 py-7`}>

        {/* Upgrade banner */}
        {!loading && lockedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 flex items-center justify-between gap-4 rounded-2xl bg-indigo-50 border border-indigo-200 px-4 py-3.5"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <p className="text-[13px] text-indigo-800">
                <span className="font-bold">{lockedCount} tests locked.</span>
                {" "}Upgrade to access all content.
              </p>
            </div>
            <Link
              href="/pricing"
              className="shrink-0 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-bold transition-colors"
            >
              Upgrade
            </Link>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="flex flex-wrap gap-2 items-center mb-5"
        >
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search tests…"
              className="w-full h-9 pl-9 pr-8 bg-white border border-slate-200 rounded-xl text-[13px] outline-none
                focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-300"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as StatusFilter)}
              className="h-9 pl-3 pr-7 bg-white border border-slate-200 rounded-xl text-[13px] outline-none
                focus:border-indigo-400 text-slate-600 appearance-none cursor-pointer"
            >
              {STATUS_FILTERS.map(s => (
                <option key={s} value={s}>{s === "All" ? "All statuses" : s}</option>
              ))}
            </select>
            <ListFilter className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>

          <button
            onClick={() => setFreeOnly(p => !p)}
            className={`h-9 px-3.5 border rounded-xl text-[13px] flex items-center gap-1.5 transition-all font-medium whitespace-nowrap
              ${freeOnly
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white hover:bg-slate-50 text-slate-500"
              }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Free only
          </button>

          <div className="relative">
            <button
              onClick={e => { e.stopPropagation(); setShowSortMenu(p => !p) }}
              className="h-9 px-3 bg-white border border-slate-200 rounded-xl text-[13px] flex items-center gap-1.5
                hover:bg-slate-50 text-slate-500 transition-colors font-medium"
            >
              <BarChart2 className="w-3.5 h-3.5 shrink-0" />
              {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
              <ChevronDown className="w-3 h-3 shrink-0" />
            </button>
            <AnimatePresence>
              {showSortMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.1 }}
                  onClick={e => e.stopPropagation()}
                  className="absolute right-0 top-[calc(100%+5px)] bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 min-w-[155px]"
                >
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setShowSortMenu(false) }}
                      className={`w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 flex items-center justify-between
                        ${sortBy === opt.value ? "text-indigo-600 font-semibold" : "text-slate-700"}`}
                    >
                      {opt.label}
                      {sortBy === opt.value && <CheckCircle2 className="w-3 h-3 text-indigo-500" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {hasFilters && (
            <button
              onClick={clearAllFilters}
              className="h-9 px-3 text-[13px] text-indigo-500 hover:text-indigo-700 font-semibold flex items-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3" /> Clear
            </button>
          )}
        </motion.div>

        <p className="text-[11px] text-slate-400 font-medium mb-3">
          {!loading && `${filtered.length}${filtered.length !== tests.length ? ` of ${tests.length}` : ""} tests`}
        </p>

        {/* Grid */}
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
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <Search className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-slate-600 font-semibold mb-1">No tests found</p>
              <p className="text-slate-400 text-[13px] mb-5">
                {query ? `No results for "${query}"` : "Try adjusting your filters"}
              </p>
              <button onClick={clearAllFilters} className="text-[13px] text-indigo-600 hover:underline font-semibold">
                Clear all filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={`${query}-${statusFilter}-${freeOnly}-${sortBy}`}
              variants={stagger} initial="hidden" animate="show"
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {filtered.map(t => (
                <TestCard key={t.id} test={t} lastAttempt={lastAttemptByTest[t.id]} tier={tier} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}