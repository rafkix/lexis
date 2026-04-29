'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
    ArrowLeft,
    BookOpen,
    Headphones,
    PenLine,
    Mic,
    Clock,
    BarChart2,
    ChevronRight,
    Lock,
    TrendingUp,
} from 'lucide-react'

const C1 = '#6366f1'
const C2 = '#4f46e5'

type Skill = {
    id: string
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
        id: 'reading',
        title: 'Reading',
        description:
            'Understand academic passages and answer comprehension questions under timed conditions.',
        icon: BookOpen,
        href: '/tests/ielts/reading',
        duration: '60 min',
        questions: '40 questions',
        color: '#6366f1',
        light: 'rgba(99,102,241,0.08)',
        badge: 'Most practised',
        available: true,
    },
    {
        id: 'listening',
        title: 'Listening',
        description:
            'Listen to recordings of conversations and monologues, then answer a variety of question types.',
        icon: Headphones,
        href: '/tests/ielts/listening',
        duration: '30 min',
        questions: '40 questions',
        color: '#0ea5e9',
        light: 'rgba(14,165,233,0.08)',
        available: false,
    },
    {
        id: 'writing',
        title: 'Writing',
        description:
            'Complete two tasks — a graph summary and an argumentative essay — within the time limit.',
        icon: PenLine,
        href: '/tests/ielts/writing',
        duration: '60 min',
        questions: '2 tasks',
        color: '#10b981',
        light: 'rgba(16,185,129,0.08)',
        available: false,
    },
    {
        id: 'speaking',
        title: 'Speaking',
        description:
            'Practise the three-part speaking test: introduction, long turn, and two-way discussion.',
        icon: Mic,
        href: '/tests/ielts/speaking',
        duration: '11–14 min',
        questions: '3 parts',
        color: '#f59e0b',
        light: 'rgba(245,158,11,0.08)',
        available: false,
    },
]

/* ─── Skill Card ─────────────────────────────────────────────────── */
function SkillCard({ skill, index }: { skill: Skill; index: number }) {
    const router = useRouter()
    const [hovered, setHovered] = useState(false)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 80 + index * 90)
        return () => clearTimeout(t)
    }, [index])

    const Icon = skill.icon

    const handleClick = () => {
        if (!skill.available) return
        router.push(skill.href)
    }

    return (
        <div
            onClick={handleClick}
            onMouseEnter={() => skill.available && setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={skill.available ? 'cursor-pointer' : 'cursor-default'}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.42s ease, transform 0.42s ease',
            }}
        >
            <div
                className="relative rounded-2xl bg-white p-6 flex flex-col gap-4"
                style={{
                    border: hovered ? `2px solid ${skill.color}` : '1.5px solid #e5e7eb',
                    boxShadow: hovered
                        ? `0 12px 32px -8px ${skill.color}28`
                        : '0 1px 4px rgba(0,0,0,0.05)',
                    transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
                    transition:
                        'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.18s ease',
                    opacity: skill.available ? 1 : 0.6,
                    minHeight: 180,
                }}
            >
                {/* Badge */}
                {skill.badge && skill.available && (
                    <span
                        className="absolute -top-3 left-5 text-xs font-medium px-3 py-1 rounded-full text-white"
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

                {/* Top row: icon + arrow/lock */}
                <div className="flex items-start justify-between">
                    <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                            background: skill.available ? skill.light : 'rgba(0,0,0,0.04)',
                            transform: hovered
                                ? 'scale(1.1) rotate(-4deg)'
                                : 'scale(1) rotate(0deg)',
                            transition: 'transform 0.28s ease',
                        }}
                    >
                        <Icon
                            size={20}
                            style={{ color: skill.available ? skill.color : '#9ca3af' }}
                        />
                    </div>

                    {skill.available ? (
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

                {/* Title + description */}
                <div className="flex-1">
                    <h2 className="text-base font-semibold text-gray-900 mb-1">{skill.title}</h2>
                    <p className="text-sm text-gray-500 leading-snug line-clamp-3">
                        {skill.description}
                    </p>
                </div>

                {/* Meta footer */}
                <div
                    className="flex items-center gap-4 pt-3"
                    style={{ borderTop: '1px solid #f3f4f6' }}
                >
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Clock size={11} />
                        <span>{skill.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <BarChart2 size={11} />
                        <span>{skill.questions}</span>
                    </div>

                    {skill.available && (
                        <span
                            className="ml-auto text-xs font-medium"
                            style={{
                                color: hovered ? skill.color : '#d1d5db',
                                transition: 'color 0.18s',
                            }}
                        >
                            Start →
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function IeltsSkillSelectPage() {
    const router = useRouter()
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 30)
        return () => clearTimeout(t)
    }, [])

    return (
        <div className="min-h-screen bg-gray-50 px-6 py-10">
            <div className="max-w-5xl mx-auto">

                {/* Back */}
                <div
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'translateX(0)' : 'translateX(-12px)',
                        transition: 'opacity 0.4s ease, transform 0.4s ease',
                    }}
                >
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors group"
                    >
                        <ArrowLeft
                            size={15}
                            className="transition-transform duration-200 group-hover:-translate-x-1"
                        />
                        Back
                    </button>
                </div>

                {/* Header row */}
                <div
                    className="mt-10 mb-8 flex items-end justify-between"
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'translateY(0)' : 'translateY(16px)',
                        transition: 'opacity 0.5s ease 0.05s, transform 0.5s ease 0.05s',
                    }}
                >
                    {/* Left: title */}
                    <div>
                        <div
                            className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full"
                            style={{
                                background: 'rgba(99,102,241,0.08)',
                                border: '1px solid rgba(99,102,241,0.2)',
                            }}
                        >
                            <BookOpen size={13} style={{ color: C1 }} />
                            <span className="text-xs font-medium" style={{ color: C2 }}>
                                IELTS Practice
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                            Choose a skill
                        </h1>
                        <p className="mt-2 text-sm text-gray-500 leading-relaxed max-w-md">
                            Select the section you want to practise. Each skill opens a focused
                            test session.
                        </p>
                    </div>

                    {/* Right: stat pills */}
                    <div className="flex gap-3 shrink-0">
                        <div className="flex flex-col items-center justify-center px-5 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm">
                            <span className="text-xl font-bold text-gray-900">4</span>
                            <span className="text-xs text-gray-400 mt-0.5">Skills</span>
                        </div>
                        <div className="flex flex-col items-center justify-center px-5 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm">
                            <span className="text-xl font-bold text-gray-900">40+</span>
                            <span className="text-xs text-gray-400 mt-0.5">Questions</span>
                        </div>
                        <div className="flex flex-col items-center justify-center px-5 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm">
                            <TrendingUp size={16} className="text-indigo-500 mb-0.5" />
                            <span className="text-xs text-gray-400">Free</span>
                        </div>
                    </div>
                </div>

                {/* Cards grid — 2 columns on desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {SKILLS.map((skill, i) => (
                        <SkillCard key={skill.id} skill={skill} index={i} />
                    ))}
                </div>

                {/* Footer */}
                <p
                    className="mt-10 text-center text-xs text-gray-400"
                    style={{
                        opacity: visible ? 1 : 0,
                        transition: 'opacity 0.6s ease 0.6s',
                    }}
                >
                    Reading is free&nbsp;•&nbsp;More skills coming soon
                </p>
            </div>
        </div>
    )
}