'use client'

import { ArrowRight, Sparkles } from 'lucide-react'
import React from 'react'

// ─── Shared Page Banner ────────────────────────────────────────────────────────
// Use this component on every page that needs a hero banner.
// It guarantees identical height, padding, gradient, and layout everywhere.
//
// Usage:
//   <PageBanner
//     visible={visible}
//     tag="AI-powered English platform"
//     title={<>Test your English. <span style={{ color: '#c7d2fe' }}>Track your progress.</span></>}
//     subtitle="Choose a format below and get your result in minutes — completely free."
//     ctaLabel="Start for free"
//     onCta={() => router.push('/tests')}
//     stats={[
//       { icon: Zap, value: '50 000+', label: 'Active learners' },
//       ...
//     ]}
//   />

export type BannerStat = {
    icon: React.ElementType
    value: string
    label: string
}

type PageBannerProps = {
    visible: boolean
    tag?: React.ReactNode
    title: React.ReactNode
    subtitle?: React.ReactNode
    ctaLabel?: string
    onCta?: () => void
    stats?: BannerStat[]
}

export function PageBanner({
    visible,
    tag,
    title,
    subtitle,
    ctaLabel,
    onCta,
    stats,
}: PageBannerProps) {
    return (
        <div
            className="relative w-full rounded-2xl overflow-hidden"
            style={{
                // ── Fixed visual size ──────────────────────────────────────────
                // minHeight keeps every banner identical regardless of content amount
                minHeight: 168,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(18px)',
                transition: 'opacity 0.5s ease 0.05s, transform 0.5s ease 0.05s',
                background: 'linear-gradient(135deg, #3730a3 0%, #4f46e5 45%, #6366f1 100%)',
                boxShadow: '0 20px 50px -10px rgba(79,70,229,0.38)',
            }}
        >
            {/* Decorative blobs — identical on all pages */}
            <div
                className="absolute -top-12 -right-12 w-56 h-56 rounded-full pointer-events-none"
                style={{ background: 'rgba(255,255,255,0.06)' }}
            />
            <div
                className="absolute -bottom-14 -left-8 w-44 h-44 rounded-full pointer-events-none"
                style={{ background: 'rgba(255,255,255,0.05)' }}
            />

            {/* Inner layout — always px-7 py-7, flex row on ≥sm */}
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 px-7 py-7">

                {/* Left column */}
                <div className="flex flex-col gap-3 max-w-md">
                    {tag && (
                        <div
                            className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full text-[11px] font-semibold"
                            style={{
                                background: 'rgba(255,255,255,0.15)',
                                color: '#e0e7ff',
                                border: '1px solid rgba(255,255,255,0.22)',
                            }}
                        >
                            <Sparkles size={10} />
                            {tag}
                        </div>
                    )}

                    <h1 className="text-[22px] sm:text-[26px] font-bold text-white leading-tight tracking-tight">
                        {title}
                    </h1>

                    {subtitle && (
                        <p className="text-[13px] text-indigo-200 leading-relaxed max-w-xs">
                            {subtitle}
                        </p>
                    )}

                    {ctaLabel && onCta && (
                        <button
                            onClick={onCta}
                            className="self-start mt-0.5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold"
                            style={{
                                background: 'rgba(255,255,255,0.15)',
                                color: '#fff',
                                border: '1.5px solid rgba(255,255,255,0.28)',
                                backdropFilter: 'blur(6px)',
                                transition: 'background 0.2s ease',
                            }}
                            onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLButtonElement).style.background =
                                'rgba(255,255,255,0.24)')
                            }
                            onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLButtonElement).style.background =
                                'rgba(255,255,255,0.15)')
                            }
                        >
                            {ctaLabel} <ArrowRight size={13} />
                        </button>
                    )}
                </div>

                {/* Right column — stats */}
                {stats && stats.length > 0 && (
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
                                    <p className="text-white font-bold text-[15px] leading-none">
                                        {value}
                                    </p>
                                    <p className="text-indigo-200 text-[11px] mt-0.5">{label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}