'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

const FLOATING_WORDS = [
    { text: 'ERROR', top: '8%', left: '4%', delay: 0, size: 11 },
    { text: '500', top: '18%', right: '6%', delay: 0.6, size: 11 },
    { text: 'FAILED', top: '52%', left: '2%', delay: 1.1, size: 11 },
    { text: 'RETRY', top: '68%', right: '5%', delay: 0.4, size: 11 },
    { text: 'EXCEPTION', top: '32%', left: '1%', delay: 1.7, size: 10 },
    { text: 'CRASHED', top: '78%', left: '28%', delay: 0.8, size: 10 },
    { text: 'OOPS', top: '22%', right: '2%', delay: 2.0, size: 10 },
    { text: 'TIMEOUT', top: '88%', right: '12%', delay: 1.4, size: 10 },
]

export default function GlobalError({
    error,
    reset,
}: {
    error: Error
    reset: () => void
}) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        console.error(error)
        const t = setTimeout(() => setVisible(true), 40)
        return () => clearTimeout(t)
    }, [error])

    const anim = (delay: number) => ({
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `all 0.6s ease ${delay}s`,
    })

    return (
        <html>
            <body>
                <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white px-6">

                    {/* GRID */}
                    <div className="absolute inset-0 pointer-events-none z-0"
                        style={{
                            backgroundImage: `
                linear-gradient(to right, rgba(239,68,68,0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(239,68,68,0.05) 1px, transparent 1px)
              `,
                            backgroundSize: '36px 36px',
                        }}
                    />

                    {/* FLOATING WORDS */}
                    {FLOATING_WORDS.map((w, i) => (
                        <span
                            key={i}
                            className="absolute font-medium tracking-widest pointer-events-none select-none"
                            style={{
                                top: w.top,
                                left: 'left' in w ? (w as any).left : undefined,
                                right: 'right' in w ? (w as any).right : undefined,
                                fontSize: w.size,
                                color: '#ef4444',
                                opacity: 0.12,
                                animation: `drift 4s ease-in-out ${w.delay}s infinite`,
                            }}
                        >
                            {w.text}
                        </span>
                    ))}

                    {/* DECORATIVE SHAPES */}
                    <svg className="absolute pointer-events-none" style={{ top: '10%', left: '7%', opacity: 0.07, animation: 'spin 18s linear infinite' }} width="60" height="60">
                        <circle cx="30" cy="30" r="26" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="8 4" />
                    </svg>
                    <svg className="absolute pointer-events-none" style={{ bottom: '18%', right: '8%', opacity: 0.07, animation: 'spin 13s linear infinite reverse' }} width="44" height="44">
                        <circle cx="22" cy="22" r="18" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="6 3" />
                    </svg>
                    <svg className="absolute pointer-events-none" style={{ bottom: '8%', left: '4%', opacity: 0.05, animation: 'float 7s ease-in-out infinite' }} width="76" height="76">
                        <polygon points="38,4 72,68 4,68" fill="none" stroke="#ef4444" strokeWidth="1.5" />
                    </svg>

                    {/* CONTENT */}
                    <div className="relative z-10 text-center max-w-[440px] w-full">

                        {/* BIG 500 */}
                        <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease' }}>
                            <div className="relative inline-block">
                                <span style={{
                                    fontSize: 'clamp(96px, 22vw, 148px)',
                                    fontWeight: 700, lineHeight: 1, letterSpacing: '-4px', color: '#fee2e2',
                                }}>500</span>
                                <span className="absolute inset-0" style={{
                                    fontSize: 'clamp(96px, 22vw, 148px)',
                                    fontWeight: 700, lineHeight: 1, letterSpacing: '-4px',
                                    background: 'linear-gradient(135deg, #f87171, #dc2626, #991b1b)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    animation: 'float 5s ease-in-out infinite',
                                }}>500</span>
                            </div>
                        </div>

                        {/* BADGE */}
                        <div style={anim(0.1)} className="mb-5">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-red-50 border border-red-200 text-red-700">
                                <AlertTriangle size={12} />
                                Something went wrong
                            </span>
                        </div>

                        <h1 style={anim(0.2)} className="text-2xl font-semibold text-gray-900 mb-3">
                            An unexpected error occurred
                        </h1>

                        <p style={anim(0.35)} className="text-sm text-gray-500 mb-6 leading-relaxed">
                            Something broke on our end. Please try again — if the problem persists, come back a little later.
                        </p>

                        {/* MINI BADGES */}
                        <div style={anim(0.4)} className="flex justify-center gap-2 flex-wrap mb-8">
                            <span className="text-xs px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
                                Don&apos;t panic
                            </span>
                            <span className="text-xs px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                                Your progress is saved
                            </span>
                        </div>

                        {/* BUTTONS */}
                        <div style={anim(0.5)} className="flex flex-col items-center gap-3">
                            <button
                                onClick={reset}
                                className="inline-flex items-center justify-center gap-2 w-full max-w-[280px] py-3 px-6 rounded-xl text-white text-sm font-medium bg-red-600 hover:bg-red-700 transition hover:-translate-y-0.5"
                                style={{ boxShadow: '0 8px 24px -6px rgba(220,38,38,0.4)' }}
                            >
                                <RotateCcw size={15} />
                                Try again
                            </button>
                            <a href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition py-2">
                                <Home size={14} />
                                Go home
                            </a>
                        </div>

                    </div>
                </div>

                <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          @keyframes drift {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            33% { transform: translateY(-5px) rotate(2deg); }
            66% { transform: translateY(3px) rotate(-2deg); }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
            </body>
        </html>
    )
}