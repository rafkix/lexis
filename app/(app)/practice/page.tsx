'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
    BookOpen, Target, Clock, BarChart2, CheckCircle,
    GraduationCap, BookMarked, Repeat2, Sparkles, ArrowRight, Zap,
} from 'lucide-react'

const C1 = '#6366f1'
const C2 = '#4f46e5'

type Status = 'active' | 'coming_soon' | 'locked'

type TestType = {
    id: string
    title: string
    subtitle: string
    description: string
    icon: React.ElementType
    href: string
    badge?: string
    duration: string
    level: string
    sections: string[]
    status: Status
}

const TESTS: TestType[] = [
    {
        id: 'ielts',
        title: 'IELTS',
        subtitle: 'International English Language Testing System',
        description: 'Full practice tests in Reading, Listening, and Writing — formatted exactly like the real IELTS exam.',
        icon: BookOpen,
        href: '/tests/ielts',
        badge: 'Most popular',
        duration: '2 hrs 45 min',
        level: 'Band 1–9',
        sections: ['Reading', 'Listening', 'Writing'],
        status: 'active',
    },
    {
        id: 'cefr',
        title: 'CEFR',
        subtitle: 'Common European Framework of Reference',
        description: 'Quickly assess your English level from A1 to C2 with adaptive CEFR-aligned questions.',
        icon: Target,
        href: '/tests/cefr',
        duration: '45–60 min',
        level: 'A1 – C2',
        sections: ['Grammar', 'Vocabulary', 'Reading'],
        status: 'locked',
    },
    {
        id: 'toefl',
        title: 'TOEFL',
        subtitle: 'Test of English as a Foreign Language',
        description: 'Prepare for university admissions with academic reading, listening, speaking and writing tasks.',
        icon: GraduationCap,
        href: '/tests/toefl',
        duration: '3 hrs',
        level: '0–120 pts',
        sections: ['Reading', 'Listening', 'Speaking', 'Writing'],
        status: 'locked',
    },
    {
        id: 'vocabulary',
        title: 'Vocabulary',
        subtitle: 'Word Bank & Retention Training',
        description: 'Build a powerful vocabulary with spaced-repetition flashcards, contextual exercises, and level-based word lists.',
        icon: BookMarked,
        href: '/tests/vocab',
        badge: 'New',
        duration: '10–20 min',
        level: 'A1 – C2',
        sections: ['Flashcards', 'Fill-in', 'Word Forms'],
        status: 'locked',
    },
    {
        id: 'shadowing',
        title: 'Shadowing',
        subtitle: 'Accent & Fluency Mirroring',
        description: 'Repeat native-speaker audio in real time to improve rhythm, intonation, and natural pronunciation.',
        icon: Repeat2,
        href: '/tests/shadowing',
        duration: '15–25 min',
        level: 'A2 – C1',
        sections: ['Intonation', 'Rhythm', 'Pronunciation'],
        status: 'coming_soon',
    },
]

// ─── Stat item ────────────────────────────────────────────────────────────────

function StatItem({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
    return (
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Icon size={12} className="shrink-0" />
            <span>{label}</span>
        </div>
    )
}

// ─── Test card ────────────────────────────────────────────────────────────────

function TestCard({ test, index }: { test: TestType; index: number }) {
    const router = useRouter()
    const [hovered, setHovered] = useState(false)
    const [visible, setVisible] = useState(false)

    const isActive = test.status === 'active'
    const isComingSoon = test.status === 'coming_soon'

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 80 + index * 120)
        return () => clearTimeout(t)
    }, [index])

    const Icon = test.icon

    return (
        <div
            onClick={() => isActive && router.push(test.href)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={isActive ? 'cursor-pointer' : 'cursor-default'}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0px)' : 'translateY(24px)',
                transition: 'opacity 0.45s ease, transform 0.45s ease',
            }}
        >
            <div className="relative h-full">
                {/* Card */}
                <div
                    className="relative rounded-2xl bg-white p-5 flex flex-col gap-4 h-full"
                    style={{
                        border: isActive && hovered ? `2px solid ${C2}` : '1.5px solid #eef1f7',
                        boxShadow: isActive && hovered
                            ? '0 16px 40px -8px rgba(99,102,241,0.18)'
                            : '0 1px 4px rgba(0,0,0,0.04)',
                        transform: isActive && hovered ? 'translateY(-4px)' : 'translateY(0)',
                        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.2s ease',
                        filter: isComingSoon ? 'blur(2.5px)' : 'none',
                        userSelect: isComingSoon ? 'none' : 'auto',
                        pointerEvents: isComingSoon ? 'none' : 'auto',
                    }}
                >
                    {test.badge && isActive && (
                        <span
                            className="absolute -top-3 left-5 text-xs font-medium px-3 py-1 rounded-full text-white"
                            style={{ background: C2 }}
                        >
                            {test.badge}
                        </span>
                    )}

                    <div className="flex items-start gap-3">
                        <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                            style={{
                                background: 'rgba(99,102,241,0.10)',
                                transform: isActive && hovered ? 'scale(1.1) rotate(-3deg)' : 'scale(1)',
                                transition: 'transform 0.3s ease',
                            }}
                        >
                            <Icon size={20} style={{ color: C1 }} />
                        </div>
                        <div>
                            <h2 className="text-[17px] font-semibold text-gray-900 leading-tight">{test.title}</h2>
                            <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{test.subtitle}</p>
                        </div>
                    </div>

                    <p className="text-[13px] text-gray-500 leading-relaxed">{test.description}</p>

                    <div className="flex flex-wrap gap-3">
                        <StatItem icon={Clock} label={test.duration} />
                        <StatItem icon={BarChart2} label={test.level} />
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {test.sections.map((s) => (
                            <span
                                key={s}
                                className="text-[11px] px-2.5 py-1 rounded-lg font-medium"
                                style={{ background: 'rgba(99,102,241,0.08)', color: C2 }}
                            >
                                {s}
                            </span>
                        ))}
                    </div>

                    <button
                        className="mt-auto w-full py-2.5 rounded-xl text-[13px] font-semibold text-white"
                        style={{
                            background: isActive && hovered
                                ? `linear-gradient(135deg, ${C1} 0%, ${C2} 100%)`
                                : C2,
                            transform: isActive && hovered ? 'scale(1.02)' : 'scale(1)',
                            transition: 'background 0.3s ease, transform 0.2s ease',
                            boxShadow: isActive && hovered ? '0 6px 18px rgba(79,70,229,0.32)' : 'none',
                        }}
                    >
                        Start {test.title} →
                    </button>
                </div>

                {/* Coming Soon overlay */}
                {isComingSoon && (
                    <div
                        className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-2.5"
                        style={{
                            background: 'rgba(255,255,255,0.55)',
                            backdropFilter: 'blur(1px)',
                        }}
                    >
                        <div
                            className="px-4 py-2 rounded-2xl flex items-center gap-2"
                            style={{
                                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
                            }}
                        >
                            <Clock size={13} className="text-white opacity-90" />
                            <span className="text-[13px] font-semibold text-white tracking-wide">Coming Soon</span>
                        </div>
                        <p className="text-[11px] text-gray-400 font-medium">We're working on it</p>
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Hero Banner ──────────────────────────────────────────────────────────────

function HeroBanner({ visible }: { visible: boolean }) {
    const stats = [
        { icon: Zap, value: '50 000+', label: 'Active learners' },
        { icon: CheckCircle, value: '98%', label: 'Satisfaction rate' },
        { icon: BookOpen, value: '5 tests', label: 'Test formats' },
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
            <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full pointer-events-none"
                style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="absolute -bottom-14 -left-8 w-44 h-44 rounded-full pointer-events-none"
                style={{ background: 'rgba(255,255,255,0.05)' }} />

            {/* Content — padding matches topbar's px-5 md:px-8, so visual left edge aligns */}
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
                        AI-powered English platform
                    </div>

                    <h1 className="text-[22px] sm:text-[26px] font-bold text-white leading-tight tracking-tight">
                        Test your English.{' '}
                        <span style={{ color: '#c7d2fe' }}>Track your progress.</span>
                    </h1>

                    <p className="text-[13px] text-indigo-200 leading-relaxed max-w-xs">
                        Choose a format below and get your result in minutes — completely free.
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
                                <p className="text-white font-bold text-[15px] leading-none">{value}</p>
                                <p className="text-indigo-200 text-[11px] mt-0.5">{label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
//
// Layout chain:
//   DashboardLayout → <main className="flex-1 overflow-y-auto">
//     → TestSelectionPage (this file)
//
// Padding mirrors the Topbar (px-5 md:px-8) so all left/right edges align.
// No max-width wrapper — content fills the available content column naturally.

export default function TestSelectionPage() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 40)
        return () => clearTimeout(t)
    }, [])

    const visibleTests = TESTS.filter((t) => t.status !== 'locked')

    return (
        <div className="w-full min-h-full bg-[#f8f9fd] px-5 md:px-8 py-6 flex flex-col gap-6">

            {/* Banner */}
            <HeroBanner visible={visible} />

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
                        Available tests
                    </span>
                </div>
                <div className="flex-1 h-px" style={{ background: '#eef1f7' }} />
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
                {visibleTests.map((test, i) => (
                    <TestCard key={test.id} test={test} index={i} />
                ))}
            </div>

            {/* Footer */}
            <p
                className="text-center text-[11px] text-gray-400 pb-2"
                style={{
                    opacity: visible ? 1 : 0,
                    transition: 'opacity 0.5s ease 0.6s',
                }}
            >
                All tests are free &nbsp;•&nbsp; Results shown instantly
            </p>
        </div>
    )
}