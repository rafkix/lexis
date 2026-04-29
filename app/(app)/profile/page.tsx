'use client'

import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

const CEFR_META: Record<string, { from: string; to: string; soft: string; label: string }> = {
    A1: { from: '#94a3b8', to: '#64748b', soft: 'rgba(148,163,184,0.12)', label: 'Beginner' },
    A2: { from: '#fb923c', to: '#ea580c', soft: 'rgba(251,146,60,0.12)', label: 'Elementary' },
    B1: { from: '#fbbf24', to: '#d97706', soft: 'rgba(251,191,36,0.12)', label: 'Intermediate' },
    B2: { from: '#60a5fa', to: '#2563eb', soft: 'rgba(96,165,250,0.12)', label: 'Upper-Inter.' },
    C1: { from: '#a78bfa', to: '#7c3aed', soft: 'rgba(167,139,250,0.12)', label: 'Advanced' },
    C2: { from: '#34d399', to: '#059669', soft: 'rgba(52,211,153,0.12)', label: 'Mastery' },
}

const SKILLS = [
    {
        key: 'listening', label: 'Listening', color: '#818cf8', icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 6a6 6 0 1 1 12 0v3a3 3 0 0 1-3 3H8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M2 9a3 3 0 0 0 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <circle cx="4" cy="9" r="1.5" fill="currentColor" />
                <circle cx="12" cy="9" r="1.5" fill="currentColor" />
            </svg>
        )
    },
    {
        key: 'reading', label: 'Reading', color: '#a78bfa', icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="5.5" height="12" rx="1" stroke="currentColor" strokeWidth="1.4" />
                <rect x="8.5" y="2" width="5.5" height="12" rx="1" stroke="currentColor" strokeWidth="1.4" />
                <path d="M3.5 5h2.5M3.5 7.5h2.5M10 5h2.5M10 7.5h2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
        )
    },
    {
        key: 'writing', label: 'Writing', color: '#fbbf24', icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M9.5 3.5 12.5 6.5 6 13 2 14l1-4 6.5-6.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                <path d="M8 5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
        )
    },
    {
        key: 'speaking', label: 'Speaking', color: '#34d399', icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="5" y="1" width="6" height="8" rx="3" stroke="currentColor" strokeWidth="1.4" />
                <path d="M3 8a5 5 0 0 0 10 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M8 13v2M6 15h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
        )
    },
]

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ?? 'http://localhost:8000'

function resolveAvatar(src?: string | null) {
    if (!src) return null
    if (src.startsWith('http://') || src.startsWith('https://')) return src
    if (src.startsWith('/static/')) return `${BASE_URL}${src}`
    return src
}

/* ─────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────── */
function AnimatedNumber({ value, duration = 1200 }: { value?: number | string; duration?: number }) {
    const [display, setDisplay] = useState<number | string>(0)
    const raf = useRef<number>()

    useEffect(() => {
        const target = typeof value === 'number' ? value : parseFloat(value as string)
        if (isNaN(target)) { setDisplay(value ?? '–'); return }
        const start = performance.now()
        const from = 0
        const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1)
            const ease = 1 - Math.pow(1 - p, 3)
            const cur = from + (target - from) * ease
            setDisplay(Number.isInteger(target) ? Math.round(cur) : parseFloat(cur.toFixed(1)))
            if (p < 1) raf.current = requestAnimationFrame(tick)
        }
        raf.current = requestAnimationFrame(tick)
        return () => { if (raf.current) cancelAnimationFrame(raf.current) }
    }, [value, duration])

    return <>{display}</>
}

/* ─────────────────────────────────────────
   AVATAR
───────────────────────────────────────── */
function Avatar({ src, name, size = 92 }: { src?: string | null; name?: string | null; size?: number }) {
    const [error, setError] = useState(false)
    const finalSrc = resolveAvatar(src)
    const initial = name?.[0]?.toUpperCase() || 'U'

    return (
        <div className="relative shrink-0" style={{ width: size, height: size }}>
            {/* animated ring */}
            <div className="absolute inset-0 rounded-[24px] animate-spin-slow"
                style={{
                    background: 'conic-gradient(from 0deg, #6366f1, #8b5cf6, #a78bfa, #6366f1)',
                    padding: 2,
                    borderRadius: 24,
                }}>
                <div className="w-full h-full rounded-[22px] bg-[#0d0b1e]" />
            </div>
            {/* glow */}
            <div className="absolute inset-0 rounded-[24px] blur-lg opacity-40"
                style={{ background: 'linear-gradient(135deg,#6366f1,#a78bfa)' }} />
            {/* image / initials */}
            {finalSrc && !error ? (
                <img
                    src={finalSrc} alt={name || 'User'}
                    onError={() => setError(true)}
                    referrerPolicy="no-referrer"
                    className="absolute inset-[3px] object-cover rounded-[21px]"
                />
            ) : (
                <div
                    className="absolute inset-[3px] rounded-[21px] bg-gradient-to-br from-indigo-500 to-violet-600
                                text-white flex items-center justify-center font-black select-none"
                    style={{ fontSize: size * 0.36 }}
                >
                    {initial}
                </div>
            )}
            {/* online */}
            <span className="absolute bottom-[4px] right-[4px] w-3.5 h-3.5 bg-emerald-400 rounded-full
                             border-2 border-[#0d0b1e] z-10 animate-pulse-slow" />
        </div>
    )
}

/* ─────────────────────────────────────────
   RADIAL SCORE
───────────────────────────────────────── */
function RadialScore({ value, color, label, icon }: {
    value?: number; color: string; label: string; icon: React.ReactNode
}) {
    const r = 22
    const circ = 2 * Math.PI * r
    const pct = value ? value / 9 : 0

    return (
        <div className="flex flex-col items-center gap-2 group">
            <div className="relative w-14 h-14">
                {/* glow on hover */}
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-md"
                    style={{ background: color }} />
                <svg width={56} height={56} style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx={28} cy={28} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
                    <circle cx={28} cy={28} r={r} fill="none" stroke={`${color}30`} strokeWidth={5}
                        strokeDasharray={`${circ} ${circ}`} />
                    <circle cx={28} cy={28} r={r} fill="none" stroke={color} strokeWidth={5}
                        strokeLinecap="round"
                        strokeDasharray={`${pct * circ} ${circ}`}
                        style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(.34,1.56,.64,1)' }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[13px] font-black" style={{ color }}>
                        {value ?? '–'}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-1" style={{ color }}>
                {icon}
                <span className="text-[11px] font-semibold opacity-70">{label}</span>
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────
   HERO PATTERN — SVG noise/dot grid
───────────────────────────────────────── */
function HeroPattern() {
    return (
        <svg className="absolute inset-0 w-full h-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                    <circle cx="1.5" cy="1.5" r="1.5" fill="white" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
    )
}

/* ─────────────────────────────────────────
   GLOWING STAT
───────────────────────────────────────── */
function GlowStat({ label, value, color }: { label: string; value?: number | string; color: string }) {
    return (
        <div className="relative group cursor-default">
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                style={{ background: color + '30' }} />
            <div className="relative space-y-0.5">
                <p className="text-[10px] text-white/25 uppercase tracking-widest font-semibold">{label}</p>
                <p className="text-[24px] font-black tracking-tight leading-none"
                    style={{ color: value ? color : '#1e293b' }}>
                    {typeof value === 'number'
                        ? <AnimatedNumber value={value} />
                        : (value ?? '–')}
                </p>
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────
   SKILL BAR
───────────────────────────────────────── */
function SkillBar({ label, value, color, icon }: {
    label: string; value?: number; color: string; icon: React.ReactNode
}) {
    const pct = value ? (value / 9) * 100 : 0
    return (
        <div className="flex items-center gap-3 group">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200"
                style={{ color, background: color + '18' }}>
                {icon}
            </div>
            <span className="text-[12px] text-gray-400 w-16 shrink-0">{label}</span>
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-1.5 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)` }}
                />
            </div>
            <span className="text-[12px] font-black w-5 text-right tabular-nums"
                style={{ color: value ? color : '#e2e8f0' }}>
                {value ?? '–'}
            </span>
        </div>
    )
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function ProfilePage() {
    const { user } = useAuth()
    const router = useRouter()
    const [mounted, setMounted] = useState(false)
    useEffect(() => { setMounted(true) }, [])

    if (!user) return null

    const meta = user.meta
    const ielts = meta?.ielts
    const cefr = meta?.cefr
    const cm = CEFR_META[cefr?.level ?? '']
    const curIdx = CEFR_LEVELS.indexOf(cefr?.level ?? '')

    return (
        <>
            {/* global keyframes */}
            <style>{`
                @keyframes spin-slow { to { transform: rotate(360deg) } }
                @keyframes pulse-slow { 0%,100%{opacity:1} 50%{opacity:.4} }
                @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
                @keyframes fade-up {
                    from { opacity:0; transform:translateY(16px) }
                    to   { opacity:1; transform:translateY(0) }
                }
                @keyframes shimmer {
                    0%   { background-position: -200% center }
                    100% { background-position: 200% center }
                }
                .animate-spin-slow  { animation: spin-slow 8s linear infinite }
                .animate-pulse-slow { animation: pulse-slow 2.5s ease-in-out infinite }
                .animate-float      { animation: float 4s ease-in-out infinite }
                .fade-up-1  { animation: fade-up .5s ease both }
                .fade-up-2  { animation: fade-up .5s .1s ease both }
                .fade-up-3  { animation: fade-up .5s .2s ease both }
                .fade-up-4  { animation: fade-up .5s .3s ease both }
                .fade-up-5  { animation: fade-up .5s .4s ease both }
                .shimmer-text {
                    background: linear-gradient(90deg,#fff 20%,#a78bfa 50%,#fff 80%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: shimmer 4s linear infinite;
                }
            `}</style>

            <div className="max-w-4xl mx-auto space-y-4">

                {/* ══════════════ HERO ══════════════ */}
                <div className="relative rounded-3xl overflow-hidden fade-up-1">
                    {/* layered bg */}
                    <div className="absolute inset-0 bg-[#080614]" />
                    <div className="absolute inset-0"
                        style={{ background: 'radial-gradient(ellipse 100% 80% at 70% -20%, rgba(95, 26, 255, 0.22), transparent 60%)' }} />
                    <div className="absolute inset-0"
                        style={{ background: 'radial-gradient(ellipse 60% 40% at 0% 100%, rgba(14, 18, 221, 0.1), transparent 50%)' }} />
                    <HeroPattern />

                    {/* floating orbs */}
                    <div className="absolute top-6 right-24 w-32 h-32 rounded-full opacity-[0.06] animate-float"
                        style={{ background: 'radial-gradient(circle,#a78bfa,transparent)', animationDelay: '0s' }} />
                    <div className="absolute bottom-4 right-8 w-20 h-20 rounded-full opacity-[0.08] animate-float"
                        style={{ background: 'radial-gradient(circle,#6366f1,transparent)', animationDelay: '1.5s' }} />

                    <div className="relative px-7 pt-8 pb-7">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            <Avatar src={user.avatar} name={user.full_name} size={92} />

                            <div className="flex-1 min-w-0">
                                <h1 className={`text-[30px] font-black tracking-tight leading-none ${mounted ? 'shimmer-text' : 'text-white'}`}>
                                    {user.full_name || 'No name'}
                                </h1>
                                <p className="text-white text-[13px] mt-1.5 tracking-wide font-medium">
                                    @{user.username} · {user.email}
                                </p>

                                {/* badges */}
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {user.is_verified && (
                                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold
                                                         bg-emerald-500/10 text-emerald-400 border border-emerald-500/20
                                                         px-3 py-1 rounded-full">
                                            <svg width="10" height="10" viewBox="0 0 10 10">
                                                <circle cx="5" cy="5" r="5" fill="#10b981" />
                                                <path d="M2.5 5l1.8 1.8L7.5 3.2" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            Verified
                                        </span>
                                    )}
                                    {cefr?.level && cm && (
                                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold
                                                         border px-3 py-1 rounded-full"
                                            style={{ background: cm.soft, color: cm.from, borderColor: cm.from + '35' }}>
                                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                                <path d="M5 1l1.2 2.5 2.8.4-2 2 .5 2.8L5 7.4 2.5 8.7l.5-2.8-2-2 2.8-.4L5 1Z"
                                                    stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity=".3" />
                                            </svg>
                                            CEFR {cefr.level} · {cm.label}
                                        </span>
                                    )}
                                    {ielts?.current_score != null && (
                                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold
                                                         bg-blue-500/10 text-blue-300 border border-blue-500/20 px-3 py-1 rounded-full">
                                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                                <path d="M1 7l3-3 2 2 3-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            IELTS {ielts.current_score}
                                        </span>
                                    )}
                                </div>

                                {meta?.bio && (
                                    <p className="text-sm text-indigo-200/35 leading-relaxed mt-2.5 max-w-md line-clamp-2">
                                        {meta.bio}
                                    </p>
                                )}
                            </div>

                            {/* edit btn */}
                            <button
                                onClick={() => router.push('/profile/settings')}
                                className="group flex items-center gap-2 text-[13px] font-bold
                                           border border-white/10 px-5 py-2.5 rounded-xl
                                           text-white/70 hover:text-white transition-all duration-200
                                           hover:border-white/20 active:scale-95 self-start sm:self-center shrink-0"
                                style={{ background: 'rgba(255,255,255,0.05)' }}
                            >
                                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"
                                    className="group-hover:rotate-12 transition-transform duration-200">
                                    <path d="M7.5 2.5 10.5 5.5 4 12 0.5 12.5 1 9 7.5 2.5Z"
                                        stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                                    <path d="M6 4l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                                </svg>
                                Edit Profile
                            </button>
                        </div>

                        {/* stat strip */}
                        <div className="mt-7 pt-6 border-t border-white/[0.06] grid grid-cols-4 gap-4">
                            <GlowStat label="Current IELTS" value={ielts?.current_score} color="#818cf8" />
                            <GlowStat label="Target IELTS" value={ielts?.target_score} color="#a78bfa" />
                            <GlowStat label="CEFR Level" value={cefr?.level} color={cm?.from ?? '#64748b'} />
                            <GlowStat label="CEFR Target" value={cefr?.target_level} color="#475569" />
                        </div>
                    </div>
                </div>

                {/* ══════════════ GRID ══════════════ */}
                <div className="grid md:grid-cols-5 gap-4">

                    {/* ── IELTS (3 cols) ── */}
                    <div className="md:col-span-3 bg-white rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden fade-up-2">

                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg,#6366f1,#a78bfa)' }}>
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path d="M7 1.5 8.5 5h3.5L9 7.5l1.5 4L7 9.5l-3.5 2L5 7.5 2 5h3.5L7 1.5Z"
                                            fill="white" />
                                    </svg>
                                </div>
                                <h2 className="text-[14px] font-bold text-gray-900">IELTS Breakdown</h2>
                            </div>
                            {ielts?.current_score != null && ielts?.target_score != null && (
                                <span className="text-[11px] font-bold bg-indigo-50 text-indigo-600
                                                 border border-indigo-100 px-2.5 py-1 rounded-full">
                                    +{(ielts.target_score - ielts.current_score).toFixed(1)} to goal
                                </span>
                            )}
                        </div>

                        {/* 4 radial cells */}
                        <div className="grid grid-cols-4 divide-x divide-gray-50 border-b border-gray-50">
                            {SKILLS.map(({ key, label, color, icon }) => {
                                const val = ielts?.[key as keyof typeof ielts] as number | undefined
                                return (
                                    <div key={key} className="py-5 flex flex-col items-center">
                                        <RadialScore value={val} color={color} label={label} icon={icon} />
                                    </div>
                                )
                            })}
                        </div>

                        {/* overall bar */}
                        <div className="px-6 py-4 border-b border-gray-50">
                            <div className="flex items-center justify-between mb-2.5">
                                <span className="text-[12px] text-gray-500 font-medium">Overall Band Score</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-black text-gray-900">
                                        {ielts?.current_score ?? '–'}
                                    </span>
                                    <span className="text-xs text-gray-400">/ 9</span>
                                </div>
                            </div>
                            <div className="relative h-2.5 bg-gray-100 rounded-full overflow-visible">
                                <div
                                    className="h-2.5 rounded-full"
                                    style={{
                                        width: ielts?.current_score ? `${(ielts.current_score / 9) * 100}%` : '0%',
                                        background: 'linear-gradient(90deg,#6366f1,#8b5cf6,#a78bfa)',
                                        transition: 'width 1.2s cubic-bezier(.34,1.56,.64,1)',
                                        boxShadow: '0 0 8px rgba(139,92,246,0.5)',
                                    }}
                                />
                                {ielts?.target_score != null && (
                                    <>
                                        <div className="absolute top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gray-700 rounded-full"
                                            style={{ left: `${(ielts.target_score / 9) * 100}%` }} />
                                        <span className="absolute -top-5 text-[10px] font-bold text-gray-400 -translate-x-1/2"
                                            style={{ left: `${(ielts.target_score / 9) * 100}%` }}>
                                            {ielts.target_score}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* skill bars */}
                        <div className="px-6 py-4 space-y-3.5">
                            {SKILLS.map(({ key, label, color, icon }) => {
                                const val = ielts?.[key as keyof typeof ielts] as number | undefined
                                return <SkillBar key={key} label={label} value={val} color={color} icon={icon} />
                            })}
                        </div>
                    </div>

                    {/* ── RIGHT (2 cols) ── */}
                    <div className="md:col-span-2 space-y-4">

                        {/* CEFR */}
                        <div className="rounded-2xl overflow-hidden shadow-sm fade-up-3">
                            <div className="relative p-5 overflow-hidden"
                                style={cm
                                    ? { background: `linear-gradient(135deg,${cm.from},${cm.to})` }
                                    : { background: '#f1f5f9' }
                                }>
                                {/* naqish */}
                                <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <pattern id="cefr-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
                                        </pattern>
                                    </defs>
                                    <rect width="100%" height="100%" fill="url(#cefr-grid)" />
                                </svg>

                                <div className="absolute top-3 right-4 opacity-10 animate-float">
                                    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                                        <path d="M28 4 34 20h17L38 30l5 17-15-10-15 10 5-17L5 20h17L28 4Z" fill="white" />
                                    </svg>
                                </div>

                                <p className="relative text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">
                                    CEFR Level
                                </p>
                                <div className="relative flex items-end justify-between">
                                    <div>
                                        <span className="text-[56px] font-black text-white leading-none tracking-tight drop-shadow-lg">
                                            {cefr?.level || '–'}
                                        </span>
                                        {cm && (
                                            <p className="text-white/60 text-sm mt-1 font-semibold">{cm.label}</p>
                                        )}
                                    </div>
                                    {cefr?.target_level && (
                                        <div className="text-right pb-1">
                                            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Target</p>
                                            <p className="text-2xl font-black text-white/70">{cefr.target_level}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white border-x border-b border-gray-100 rounded-b-2xl p-4">
                                <div className="flex gap-1.5">
                                    {CEFR_LEVELS.map((l, i) => {
                                        const isCur = l === cefr?.level
                                        const isDone = i < curIdx
                                        const isTgt = l === cefr?.target_level
                                        const m = CEFR_META[l]
                                        return (
                                            <div
                                                key={l}
                                                className="flex-1 h-7 flex items-center justify-center text-[11px] font-black rounded-lg transition-all duration-200 hover:scale-105 cursor-default"
                                                style={
                                                    isCur ? { background: `linear-gradient(135deg,${m.from},${m.to})`, color: '#fff', boxShadow: `0 2px 10px ${m.from}60` }
                                                        : isDone ? { background: m.from + '20', color: m.from }
                                                            : isTgt ? { background: '#f1f5f9', color: '#0f172a', outline: `2px solid #0f172a` }
                                                                : { background: '#f8fafc', color: '#cbd5e1' }
                                                }
                                            >
                                                {l}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Account */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 fade-up-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <circle cx="7" cy="4.5" r="2.5" stroke="#6366f1" strokeWidth="1.3" />
                                        <path d="M2 12c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="#6366f1" strokeWidth="1.3" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <h2 className="text-[14px] font-bold text-gray-900">Account</h2>
                            </div>

                            <div className="space-y-1">
                                {[
                                    {
                                        icon: (
                                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                                <rect x="1" y="2.5" width="11" height="8" rx="1.5" stroke="#818cf8" strokeWidth="1.2" />
                                                <path d="M1 4.5l5.5 3.5 5.5-3.5" stroke="#818cf8" strokeWidth="1.2" strokeLinecap="round" />
                                            </svg>
                                        ),
                                        label: 'Email', value: user.email,
                                    },
                                    {
                                        icon: (
                                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                                <path d="M4 1.5c-.3 0-.6.1-.8.3L2 3c-.5.5-.5 1.3 0 1.8l6.2 6.2c.5.5 1.3.5 1.8 0l1.2-1.2c.4-.4.4-1 0-1.5l-1.5-1.5c-.4-.4-1-.4-1.4 0l-.4.4L5.1 4.5l.4-.4c.4-.4.4-1 0-1.4L4 1.7c-.2-.2-.5-.2-.8-.2H4Z"
                                                    stroke="#34d399" strokeWidth="1.2" strokeLinejoin="round" />
                                            </svg>
                                        ),
                                        label: 'Phone', value: user.phone,
                                    },
                                    {
                                        icon: (
                                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                                <path d="M6.5 1L8 4.5h3.5L8.8 6.7l1 3.3-3.3-2.1L3.2 10l1-3.3L1.5 4.5H5L6.5 1Z"
                                                    stroke="#fbbf24" strokeWidth="1.2" strokeLinejoin="round" />
                                            </svg>
                                        ),
                                        label: 'Status',
                                        value: user.status ? user.status[0].toUpperCase() + user.status.slice(1) : null,
                                    },
                                ].map(({ icon, label, value }) => (
                                    <div key={label}
                                        className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0 group hover:bg-gray-50/80 rounded-lg px-1 -mx-1 transition-colors duration-150">
                                        <div className="w-6 h-6 rounded-lg bg-gray-50 group-hover:scale-110 transition-transform duration-150
                                                        flex items-center justify-center shrink-0">
                                            {icon}
                                        </div>
                                        <span className="text-[11px] text-gray-400 w-10 shrink-0">{label}</span>
                                        <span className="text-[13px] font-semibold text-gray-700 truncate flex-1 text-right">
                                            {value || '–'}
                                        </span>
                                    </div>
                                ))}

                                {/* verified */}
                                <div className="flex items-center gap-3 pt-2.5 group hover:bg-gray-50/80 rounded-lg px-1 -mx-1 transition-colors duration-150">
                                    <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-150">
                                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                            <path d="M6.5 1l1.3 1.7 2.1-.4.2 2.1 1.8 1.1-1 1.9.7 2-2 .5-.9 1.9-1.9-.9-1.9.9-.9-1.9-2-.5.7-2-1-1.9 1.8-1.1.2-2.1 2.1.4L6.5 1Z"
                                                stroke="#6366f1" strokeWidth="1.2" strokeLinejoin="round" />
                                            {user.is_verified && (
                                                <path d="M4.5 6.5l1.5 1.5 2.5-2.5" stroke="#6366f1" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                                            )}
                                        </svg>
                                    </div>
                                    <span className="text-[11px] text-gray-400 w-10 shrink-0">Verified</span>
                                    <span className={`ml-auto text-[11px] font-bold px-2.5 py-1 rounded-full border ${user.is_verified
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : 'bg-gray-100 text-gray-500 border-gray-200'
                                        }`}>
                                        {user.is_verified ? 'Yes' : 'No'}
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}