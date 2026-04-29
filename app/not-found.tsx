'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, Home, Layers } from 'lucide-react'

const FLOATING_WORDS = [
    { text: 'READING', top: '8%', left: '3%', delay: 0, size: 11 },
    { text: 'LISTENING', top: '15%', right: '5%', delay: 0.7, size: 11 },
    { text: 'SPEAKING', top: '55%', left: '2%', delay: 1.2, size: 11 },
    { text: 'WRITING', top: '70%', right: '4%', delay: 0.3, size: 11 },
    { text: 'BAND 9.0', top: '35%', left: '1%', delay: 1.8, size: 10 },
    { text: 'CEFR C2', top: '80%', left: '30%', delay: 0.9, size: 10 },
    { text: 'IELTS', top: '25%', right: '2%', delay: 2.1, size: 10 },
    { text: 'ACADEMIC', top: '90%', right: '15%', delay: 1.5, size: 10 },
]

export default function NotFoundPage() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 40)
        return () => clearTimeout(t)
    }, [])

    const anim = (delay: number) => ({
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `all 0.6s ease ${delay}s`,
    })

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white px-6">

            {/* GRID PATTERN */}
            <div className="absolute inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage: `
            linear-gradient(to right, rgba(99,102,241,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99,102,241,0.06) 1px, transparent 1px)
          `,
                    backgroundSize: '36px 36px',
                }}
            />

            {/* FLOATING IELTS WORDS */}
            {FLOATING_WORDS.map((w, i) => (
                <span
                    key={i}
                    className="absolute font-medium tracking-widest pointer-events-none select-none"
                    style={{
                        top: w.top,
                        left: 'left' in w ? (w as any).left : undefined,
                        right: 'right' in w ? (w as any).right : undefined,
                        fontSize: w.size,
                        color: '#6366f1',
                        opacity: 0.15,
                        animation: `drift 4s ease-in-out ${w.delay}s infinite`,
                    }}
                >
                    {w.text}
                </span>
            ))}

            {/* DECORATIVE SHAPES */}
            <svg className="absolute pointer-events-none" style={{ top: '10%', left: '7%', opacity: 0.07, animation: 'spin 20s linear infinite' }} width="60" height="60">
                <circle cx="30" cy="30" r="26" fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="8 4" />
            </svg>
            <svg className="absolute pointer-events-none" style={{ bottom: '18%', right: '8%', opacity: 0.07, animation: 'spin 15s linear infinite reverse' }} width="44" height="44">
                <circle cx="22" cy="22" r="18" fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="6 3" />
            </svg>
            <svg className="absolute pointer-events-none" style={{ bottom: '8%', left: '4%', opacity: 0.05, animation: 'float 6s ease-in-out infinite' }} width="80" height="80">
                <polygon points="40,5 75,65 5,65" fill="none" stroke="#6366f1" strokeWidth="1.5" />
            </svg>

            {/* CONTENT */}
            <div className="relative z-10 text-center max-w-[440px] w-full">

                {/* BIG 404 */}
                <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease' }}>
                    <div className="relative inline-block">
                        <span style={{
                            fontSize: 'clamp(96px, 22vw, 150px)',
                            fontWeight: 700,
                            lineHeight: 1,
                            letterSpacing: '-4px',
                            color: '#e0e7ff',
                        }}>404</span>
                        <span className="absolute inset-0" style={{
                            fontSize: 'clamp(96px, 22vw, 150px)',
                            fontWeight: 700,
                            lineHeight: 1,
                            letterSpacing: '-4px',
                            background: 'linear-gradient(135deg, #6366f1, #4f46e5, #7c3aed)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            animation: 'float 5s ease-in-out infinite',
                        }}>404</span>
                    </div>
                </div>

                {/* BADGE */}
                <div style={anim(0.1)} className="mb-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-50 border border-indigo-200 text-indigo-700">
                        <Layers size={12} />
                        Page not found
                    </span>
                </div>

                {/* TITLE */}
                <h1 style={anim(0.2)} className="text-2xl font-semibold text-gray-900 mb-3">
                    Looks like this page took the wrong exam hall
                </h1>

                <p style={anim(0.35)} className="text-sm text-gray-500 mb-6 leading-relaxed">
                    The page you&apos;re looking for doesn&apos;t exist — but don&apos;t worry,
                    your IELTS practice is still waiting for you.
                </p>

                {/* MINI BADGES */}
                <div style={anim(0.4)} className="flex justify-center gap-2 flex-wrap mb-8">
                    <span className="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Band 9.0 is still possible
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                        Keep practicing
                    </span>
                </div>

                {/* BUTTONS */}
                <div style={anim(0.5)} className="flex flex-col items-center gap-3">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 w-full max-w-[280px] py-3 px-6 rounded-xl text-white text-sm font-medium bg-indigo-600 hover:bg-indigo-700 transition hover:-translate-y-0.5"
                        style={{ boxShadow: '0 8px 24px -6px rgba(99,102,241,0.45)' }}
                    >
                        <Home size={15} />
                        Back to Lexis
                    </Link>
                    <button
                        onClick={() => history.back()}
                        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition py-2"
                    >
                        <ArrowLeft size={14} />
                        Go back
                    </button>
                </div>
            </div>

            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes drift {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-6px) rotate(3deg); }
          66% { transform: translateY(4px) rotate(-2deg); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    )
}