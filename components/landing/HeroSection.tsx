'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Mode } from './useModeTransition'

const ACCENT = '#6366f1'

const MODES = {
  ielts: {
    tagline: 'From your first practice test to Band 9.0.',
    headline: <>Achieve the IELTS<br />Band Score You Need.</>,
    sub: 'AI-powered writing feedback, full mock tests, and targeted vocab drills — the fastest path to your dream band score.',
  },
  cefr: {
    tagline: 'From A1 beginner to C2 master.',
    headline: <>Go from Beginner<br />to Fluent, Level by Level.</>,
    sub: 'Practice tests, AI writing feedback, and speaking drills — fully mapped to every CEFR level so you always know what to work on next.',
  },
}

const IELTS_LEVELS = ['6.5', '7.0', '7.5', '8.0', '8.5', '9.0']
const CEFR_LEVELS = ['A2', 'B1', 'B2', 'C1', 'C2', 'CEFR']

type UniCard = {
  id: string
  alt: string
  cls: string
  anim: 'float' | 'drift'
  opacity?: number
  rotate: string
}

const IELTS_UNIS: UniCard[] = [
  { id: 'mit',      alt: 'MIT',      cls: 'left-[4%]   top-[4%]   w-[4.5rem] sm:left-[23%]  sm:top-[7%]           sm:w-[9.2rem]  lg:w-[10.5rem]', anim: 'float', opacity: 0.80, rotate: '-5deg' },
  { id: 'columbia', alt: 'Columbia', cls: 'right-[4%]  top-[4%]   w-[5rem]   sm:right-[21%] sm:top-[10%]          sm:w-[11rem]   lg:w-[12.8rem]', anim: 'drift', opacity: 0.85, rotate: '3deg'  },
  { id: 'harvard',  alt: 'Harvard',  cls: 'left-[2%]   top-[38%]  w-[5rem]   sm:left-[14%]  sm:top-[36%]          sm:w-[11.6rem] lg:w-[13.4rem]', anim: 'drift',               rotate: '2deg'  },
  { id: 'stanford', alt: 'Stanford', cls: 'right-[2%]  top-[38%]  w-[5rem]   sm:right-[14%] sm:top-[36%]          sm:w-[11.2rem] lg:w-[13rem]',   anim: 'float',               rotate: '-3deg' },
  { id: 'yale',     alt: 'Yale',     cls: 'left-[8%]   top-[68%]  w-[5rem]   sm:left-[20%]  sm:top-auto sm:bottom-[17%] sm:w-[8.8rem]  lg:left-[21%] lg:w-[10.8rem]', anim: 'float', opacity: 0.95, rotate: '4deg'  },
  { id: 'princeton',alt: 'Princeton',cls: 'right-[8%]  top-[68%]  w-[5.2rem] sm:right-[17%] sm:top-auto sm:bottom-[17%] sm:w-[9.2rem]  lg:right-[19%] lg:w-[11.2rem]', anim: 'drift', opacity: 0.95, rotate: '3deg'  },
]

const CEFR_UNIS: UniCard[] = [
  { id: 'new-uu', alt: 'New UU', cls: 'left-[4%]   top-[4%]   w-[4.5rem] sm:left-[23%]  sm:top-[7%]           sm:w-[9.2rem]  lg:w-[10.5rem]', anim: 'float', opacity: 0.80, rotate: '-5deg' },
  { id: 'wiut',   alt: 'WIUT',   cls: 'right-[4%]  top-[4%]   w-[5rem]   sm:right-[21%] sm:top-[10%]          sm:w-[11rem]   lg:w-[12.8rem]', anim: 'drift', opacity: 0.85, rotate: '3deg'  },
  { id: 'ozmu',   alt: 'OzMU',   cls: 'left-[2%]   top-[38%]  w-[5rem]   sm:left-[14%]  sm:top-[36%]          sm:w-[11.6rem] lg:w-[13.4rem]', anim: 'drift',               rotate: '2deg'  },
  { id: 'tdiu',   alt: 'TDIU',   cls: 'right-[2%]  top-[38%]  w-[5rem]   sm:right-[14%] sm:top-[36%]          sm:w-[11.2rem] lg:w-[13rem]',   anim: 'float',               rotate: '-3deg' },
  { id: 'tatu',   alt: 'TATU',   cls: 'left-[8%]   top-[68%]  w-[5rem]   sm:left-[20%]  sm:top-auto sm:bottom-[17%] sm:w-[8.8rem]  lg:left-[21%] lg:w-[10.8rem]', anim: 'float', opacity: 0.95, rotate: '4deg'  },
  { id: 'odjtu',  alt: 'ODJTU',  cls: 'right-[8%]  top-[68%]  w-[5.2rem] sm:right-[17%] sm:top-auto sm:bottom-[17%] sm:w-[9.2rem]  lg:right-[19%] lg:w-[11.2rem]', anim: 'drift', opacity: 0.95, rotate: '3deg'  },
]

interface Props {
  mode: Mode
  switchMode: (m: Mode) => void
}

export default function HeroSection({ mode, switchMode }: Props) {
  const isIelts = mode === 'ielts'

  return (
    <section
      className="relative flex flex-col min-h-[100dvh] overflow-hidden px-5 pb-6 pt-24 sm:px-8 sm:pb-8 sm:pt-24 lg:px-10"
      style={{
        fontFamily: 'Manrope, Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background: '#faf9ff',
      }}
    >
      <style jsx global>{`
        @keyframes progressBar { from{width:0%} to{width:100%} }

        .btn-lift { transition: transform 0.18s ease, opacity 0.18s ease; }
        .btn-lift:hover  { transform: translateY(-2px); }
        .btn-lift:active { transform: translateY(1px) scale(0.98); }

        @media (prefers-reduced-motion: reduce) {
          * { transition-duration: 0ms !important; }
        }
      `}</style>

      {/* Background glow */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 72% 48% at 50% 0%, rgba(99,102,241,0.10) 0%, transparent 68%), #faf9ff' }}
      />

      <div className="mx-auto flex max-w-7xl flex-col items-center text-center flex-1 w-full">

        {/* TOP ROW */}
        <div className="w-full max-w-[720px] flex items-center justify-center sm:justify-between gap-3 relative z-10">

          {/* Level badge strip */}
          <div className="relative h-[34px] flex items-center justify-center sm:justify-start flex-1">
            {([
              { key: 'ielts' as Mode, levels: IELTS_LEVELS, show: isIelts },
              { key: 'cefr' as Mode,  levels: CEFR_LEVELS,  show: !isIelts },
            ]).map(({ key, levels, show }) => (
              <div
                key={key}
                className="absolute flex items-center gap-1.5"
                style={{
                  opacity: show ? 1 : 0,
                  transition: 'opacity 0.35s ease',
                  pointerEvents: show ? 'auto' : 'none',
                }}
              >
                {levels.map((lvl, i) => (
                  <span
                    key={lvl}
                    className="px-2.5 py-1 rounded-[8px] text-[12px] font-bold whitespace-nowrap"
                    style={{
                      background: i === levels.length - 1 ? ACCENT : 'rgba(99,102,241,0.07)',
                      color: i === levels.length - 1 ? '#fff' : '#8a82b0',
                    }}
                  >
                    {lvl}
                  </span>
                ))}
              </div>
            ))}
          </div>

          {/* IELTS / CEFR toggle */}
          <div
            className="hidden sm:flex gap-1 rounded-[14px] border p-1 shrink-0"
            style={{ background: 'rgba(252,251,255,0.95)', borderColor: '#e3e0ff' }}
          >
            {([
              { key: 'ielts' as Mode, title: 'IELTS', sub: '4.0 – 9.0' },
              { key: 'cefr'  as Mode, title: 'CEFR',  sub: 'A1 – C2'   },
            ]).map(({ key, title, sub }) => {
              const active = mode === key
              return (
                <button
                  key={key}
                  onClick={() => switchMode(key)}
                  className="relative overflow-hidden flex flex-col items-center px-5 py-[6px] rounded-[10px] transition-all duration-300"
                  style={{
                    background: active ? ACCENT : 'transparent',
                    boxShadow: active ? '0 4px 12px rgba(99,102,241,0.22)' : 'none',
                  }}
                >
                  <span className="text-[13px] font-bold leading-tight" style={{ color: active ? '#fff' : '#1a1328' }}>{title}</span>
                  <span className="text-[10px] font-semibold mt-[1px]" style={{ color: active ? 'rgba(255,255,255,0.78)' : '#9b94c0' }}>{sub}</span>
                  {active && (
                    <span
                      key={key + '-bar-' + mode}
                      className="absolute bottom-0 left-0 h-[2px] rounded-full"
                      style={{ background: 'rgba(255,255,255,0.42)', animation: 'progressBar 5s linear forwards' }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* SCORE VISUAL */}
        <div className="relative mx-auto mt-2 h-[14rem] w-full max-w-[68rem] sm:mt-4 sm:h-[20rem] lg:h-[23rem]">

          <div
            className="absolute inset-x-[20%] bottom-7 hidden h-16 rounded-full blur-3xl sm:block"
            style={{ background: 'rgba(8,17,31,0.06)' }}
          />
          <div
            className="absolute inset-x-[12%] top-[14%] h-[62%] rounded-[50%] blur-2xl"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.16), rgba(99,102,241,0.08) 58%, transparent 74%)' }}
          />

          <svg
            viewBox="0 0 1040 420"
            aria-hidden="true"
            className="absolute inset-x-[6%] top-[18%] hidden h-[60%] w-[88%] opacity-70 sm:block"
          >
            <path
              d="M96 232 C230 92 385 88 520 130 C655 88 810 92 944 232"
              fill="none" stroke={ACCENT} strokeOpacity="0.32"
              strokeWidth="2" strokeDasharray="10 14" strokeLinecap="round"
            />
          </svg>

          {/* Score number — simple fade transition */}
          <div
            aria-label={isIelts ? 'Band 9.0' : 'C2'}
            className="absolute inset-x-0 top-[20%] flex select-none justify-center leading-[0.72] tracking-[-0.085em] tabular-nums sm:top-[28%]"
            style={{
              fontSize: 'clamp(5rem, 22vw, 15rem)',
              fontWeight: 600,
              color: '#1a1328',
              textShadow: 'rgba(7,16,31,0.05) 0px 10px 28px',
            }}
          >
            <span
              className="absolute inset-0 flex items-center justify-center"
              style={{ opacity: isIelts ? 1 : 0, transition: 'opacity 0.4s ease' }}
            >
              9.0
            </span>
            <span
              className="absolute inset-0 flex items-center justify-center"
              style={{ opacity: !isIelts ? 1 : 0, transition: 'opacity 0.4s ease' }}
            >
              C2
            </span>
            <span aria-hidden style={{ opacity: 0 }}>9.0</span>
          </div>

          {/* University stickers — simple fade */}
          {(isIelts ? IELTS_UNIS : CEFR_UNIS).map(({ id, alt, cls, opacity, rotate }, i) => (
            <img
              key={id}
              src={`/images/${id}.png`}
              alt={alt}
              draggable={false}
              className={`pointer-events-none absolute max-w-none select-none object-contain ${cls}`}
              style={{
                opacity: opacity ?? 1,
                rotate,
                filter: 'drop-shadow(0 12px 18px rgba(17,24,39,0.10))',
              }}
            />
          ))}
        </div>

        {/* COPY */}
        <div className="w-full max-w-5xl text-center relative z-10">
          <div className="grid [grid-template-areas:'stack'] [&>*]:[grid-area:stack]">
            {(['ielts', 'cefr'] as const).map((m) => {
              const active = mode === m
              return (
                <div
                  key={m + '-copy'}
                  style={{
                    opacity: active ? 1 : 0,
                    transition: 'opacity 0.4s ease',
                    pointerEvents: active ? 'auto' : 'none',
                  }}
                >
                  <p
                    className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.2em]"
                    style={{ color: '#9b8db8' }}
                  >
                    {MODES[m].tagline}
                  </p>
                  <h1
                    className="leading-[1] tracking-[-0.055em]"
                    style={{ fontSize: 'clamp(1.75rem, 8vw, 4rem)', fontWeight: 600, color: '#1a1328' }}
                  >
                    {MODES[m].headline}
                  </h1>
                  <p
                    className="mt-2 font-medium leading-[1.55] mx-auto sm:mt-3"
                    style={{ fontSize: 'clamp(0.95rem, 1.6vw, 1.1rem)', color: '#635b78', maxWidth: '52rem' }}
                  >
                    {MODES[m].sub}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA BUTTONS */}
        <div className="mt-5 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/onboarding"
            className="btn-lift inline-flex h-14 items-center justify-center gap-2 rounded-[0.95rem] px-7 text-[1rem] font-semibold text-white"
            style={{ background: ACCENT, boxShadow: '0 3px 0 #4547b8, 0 6px 22px rgba(99,102,241,0.24)' }}
          >
            Start preparation
            <ArrowRight size={18} strokeWidth={2.5} />
          </Link>

          <Link
            href="#platform"
            className="btn-lift inline-flex h-14 items-center justify-center rounded-[0.95rem] border px-7 text-[1rem] font-semibold backdrop-blur"
            style={{ background: 'rgba(250,249,255,0.86)', borderColor: 'rgba(99,102,241,0.28)', color: '#1a1328' }}
          >
            See the platform
          </Link>
        </div>

        {/* Social proof */}
        <p className="mt-3 text-[11.5px] sm:text-[12px] font-medium" style={{ color: 'rgb(160,152,180)' }}>
          Trusted by 40,000+ learners · No credit card required
        </p>

      </div>
    </section>
  )
}