'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, BookOpen, Target, Clock, BarChart2, CheckCircle } from 'lucide-react'
import { BackButton } from '@/components/ui/BackButton'

const C1 = '#6366f1'
const C2 = '#4f46e5'

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
}

const TESTS: TestType[] = [
    {
        id: 'ielts',
        title: 'IELTS',
        subtitle: 'International English Language Testing System',
        description:
            'Full practice tests in Reading, Listening, and Writing — formatted exactly like the real IELTS exam.',
        icon: BookOpen,
        href: '/tests/ielts',
        badge: 'Most popular',
        duration: '2 hrs 45 min',
        level: 'Band 1–9',
        sections: ['Reading', 'Listening', 'Writing'],
    },
    {
        id: 'cefr',
        title: 'CEFR',
        subtitle: 'Common European Framework of Reference',
        description:
            'Quickly assess your English level from A1 to C2 with adaptive CEFR-aligned questions.',
        icon: Target,
        href: '/tests/cefr',
        duration: '45–60 min',
        level: 'A1 – C2',
        sections: ['Grammar', 'Vocabulary', 'Reading'],
    },
]

function StatItem({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
    return (
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Icon size={12} className="shrink-0" />
            <span>{label}</span>
        </div>
    )
}

function TestCard({ test, index }: { test: TestType; index: number }) {
    const router = useRouter()
    const [hovered, setHovered] = useState(false)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 100 + index * 140)
        return () => clearTimeout(t)
    }, [index])

    const Icon = test.icon

    return (
        <div
            onClick={() => router.push(test.href)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="cursor-pointer"
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0px)' : 'translateY(28px)',
                transition: 'opacity 0.5s ease, transform 0.5s ease',
            }}
        >

            <div
                className="relative rounded-2xl bg-white p-6 flex flex-col gap-5 h-full"
                style={{
                    border: hovered ? `2px solid ${C2}` : '1.5px solid #e5e7eb',
                    boxShadow: hovered
                        ? `0 16px 40px -8px rgba(99,102,241,0.2)`
                        : '0 1px 4px rgba(0,0,0,0.05)',
                    transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.2s ease',
                }}
            >
                {test.badge && (
                    <span
                        className="absolute -top-3 left-5 text-xs font-medium px-3 py-1 rounded-full text-white"
                        style={{
                            background: C2,
                            opacity: visible ? 1 : 0,
                            transition: 'opacity 0.4s ease 0.45s',
                        }}
                    >
                        {test.badge}
                    </span>
                )}

                <div className="flex items-start gap-4">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                            background: 'rgba(99,102,241,0.10)',
                            transform: hovered ? 'scale(1.12) rotate(-3deg)' : 'scale(1) rotate(0deg)',
                            transition: 'transform 0.3s ease',
                        }}
                    >
                        <Icon size={22} style={{ color: C1 }} />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">{test.title}</h2>
                        <p className="text-xs text-gray-400 mt-0.5 leading-snug">{test.subtitle}</p>
                    </div>
                </div>

                <p className="text-sm text-gray-500 leading-relaxed">{test.description}</p>

                <div className="flex flex-wrap gap-3">
                    <StatItem icon={Clock} label={test.duration} />
                    <StatItem icon={BarChart2} label={test.level} />
                </div>

                <div className="flex flex-wrap gap-2">
                    {test.sections.map((s) => (
                        <span
                            key={s}
                            className="text-xs px-2.5 py-1 rounded-lg font-medium"
                            style={{ background: 'rgba(99,102,241,0.08)', color: C2 }}
                        >
                            {s}
                        </span>
                    ))}
                </div>

                {/* mt-auto — button har doim pastda turadi */}
                <button
                    className="mt-auto w-full py-2.5 rounded-xl text-sm font-medium text-white"
                    style={{
                        background: hovered
                            ? `linear-gradient(135deg, ${C1} 0%, ${C2} 100%)`
                            : C2,
                        transform: hovered ? 'scale(1.02)' : 'scale(1)',
                        transition: 'background 0.3s ease, transform 0.2s ease',
                        boxShadow: hovered ? `0 6px 20px rgba(79,70,229,0.35)` : 'none',
                    }}
                >
                    Start {test.title} →
                </button>
            </div>
        </div>
    )
}

export default function TestSelectionPage() {
    const router = useRouter()
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 40)
        return () => clearTimeout(t)
    }, [])

    return (
        // ⬇ min-h-screen + flex-col — header/footer bo'lmasa ham to'liq ekran
        // ⬇ bg-gray-50 — sahifa orqa foni
        <div className="min-h-screen w-full bg-gray-50 flex flex-col">


            {/* Scroll bo'lishi uchun flex-1, content markazda */}
            <div className="flex-1 flex flex-col px-4 py-8 w-full max-w-3xl mx-auto">

                {/* Back */}
                <BackButton fallback="/" />

                {/* Header */}
                <div
                    className="mt-20 mb-10 text-center"
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'translateY(0)' : 'translateY(18px)',
                        transition: 'opacity 0.5s ease 0.06s, transform 0.5s ease 0.06s',
                    }}
                >
                    <div
                        className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full"
                        style={{
                            background: 'rgba(99,102,241,0.08)',
                            border: `1px solid rgba(99,102,241,0.2)`,
                        }}
                    >
                        <CheckCircle size={13} style={{ color: C1 }} />
                        <span className="text-xs font-medium" style={{ color: C2 }}>
                            Practice Tests
                        </span>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Choose a test type
                    </h1>
                    <p className="mt-2 text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
                        Pick the test that fits your goal and find out your English level
                    </p>
                </div>

                {/* Cards */}
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    {TESTS.map((test, i) => (
                        <TestCard key={test.id} test={test} index={i} />
                    ))}
                </div>

                {/* Footer note — flex-1 tufayli pastga itariladi */}
                <p
                    className="mt-auto pt-10 text-center text-xs text-gray-400"
                    style={{
                        opacity: visible ? 1 : 0,
                        transition: 'opacity 0.6s ease 0.65s',
                    }}
                >
                    All tests are free &nbsp;•&nbsp; Results shown instantly
                </p>
            </div>
        </div>
    )
}