'use client'

import { ArrowRight } from 'lucide-react'
import type { Mode } from './useModeTransition'

const ACCENT = '#6366f1'

const NODES = {
  ielts: [
    { cx: 38,  cy: 220, label: 'Mock',     tx: 60,  ty: 225 },
    { cx: 244, cy: 98,  label: 'Review',   tx: 266, ty: 103 },
    { cx: 452, cy: 198, label: 'Practice', tx: 474, ty: 203 },
    { cx: 392, cy: 74,  label: 'Band 8.0', tx: 414, ty: 79  },
  ],
  cefr: [
    { cx: 38,  cy: 220, label: 'Test',     tx: 60,  ty: 225 },
    { cx: 244, cy: 98,  label: 'Map',      tx: 266, ty: 103 },
    { cx: 452, cy: 198, label: 'Practice', tx: 474, ty: 203 },
    { cx: 392, cy: 74,  label: 'Level C1', tx: 414, ty: 79  },
  ],
}

const CONTENT = {
  ielts: {
    headline: 'Take one mock. See what costs band points.',
    sub: 'No guesswork. Just a clear route from your first baseline to your target band.',
    cta: 'Start preparation',
  },
  cefr: {
    headline: 'Take one test. See what blocks your next level.',
    sub: 'No guesswork. Just a structured path from your current level to the one above.',
    cta: 'Start preparation',
  },
}

interface Props { mode: Mode }

export default function PlanSection({ mode }: Props) {
  const c = CONTENT[mode] ?? CONTENT['ielts']
  const nodes = NODES[mode] ?? NODES['ielts']

  return (
    <section
      id="plan"
      className="px-5 py-16 sm:px-8 sm:py-24 lg:py-32"
      style={{ fontFamily: 'Manrope, Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
    >
      <div
        className="ielts-reveal mx-auto max-w-7xl overflow-hidden rounded-[1.7rem] p-7 text-white sm:p-10 lg:p-14"
        style={{ background: 'rgb(18, 12, 35)' }}
      >
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">

          {/* Left: text */}
          <div>
            <h2
              className="max-w-2xl leading-[1] tracking-[-0.06em]"
              style={{ fontSize: 'clamp(2.25rem,5.2vw,5.3rem)', fontWeight: 600 }}
            >
              {c.headline}
            </h2>
            <p
              className="mt-5 max-w-xl text-[1.05rem] leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.62)' }}
            >
              {c.sub}
            </p>
            <a
              className="mt-8 inline-flex h-14 items-center justify-center gap-2 rounded-[0.95rem] px-7 text-[1rem] font-semibold text-white"
              href="/onboarding"
              style={{ background: ACCENT }}
            >
              {c.cta}
              <ArrowRight className="size-5" strokeWidth={2.5} />
            </a>
          </div>

          {/* Right: route path SVG */}
          <div className="relative min-h-[19rem]">
            <svg viewBox="0 0 560 280" aria-hidden="true" className="absolute inset-0 size-full">
              <path
                d="M38 220 C152 216 128 88 244 98 C348 107 305 226 452 198 C505 188 508 96 392 74"
                fill="none"
                stroke="rgba(99,102,241,0.18)"
                strokeWidth="34"
                strokeLinecap="round"
              />
              <path
                d="M38 220 C152 216 128 88 244 98 C348 107 305 226 452 198 C505 188 508 96 392 74"
                fill="none"
                stroke={ACCENT}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="12 14"
              />
              {nodes.map(({ cx, cy, label, tx, ty }) => (
                <g key={label}>
                  <circle cx={cx} cy={cy} r={13} fill="rgb(18,12,35)" stroke={ACCENT} strokeWidth={5} />
                  <text x={tx} y={ty} fill="white" fillOpacity={0.85} fontSize={16} fontWeight={700} fontFamily="Manrope, sans-serif">
                    {label}
                  </text>
                </g>
              ))}
            </svg>
          </div>

        </div>
      </div>
    </section>
  )
}
