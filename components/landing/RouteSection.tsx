'use client'

import { Headphones, BookOpen, PenLine, Mic, Target } from 'lucide-react'
import type { Mode } from './useModeTransition'

const ACCENT = '#6366f1'

const CONTENT = {
  ielts: {
    eyebrow: 'Your route',
    headline: 'Know what to practice.',
    sub: 'IELTStation turns mock results, missed questions, and vocab gaps into focused practice across all four skills.',
    steps: [
      { num: '01', title: 'Take a full mock',  desc: 'Set a clean baseline across all four skills.' },
      { num: '02', title: 'Open the map',      desc: 'See which skill and which sub-skill cost the most band points.' },
      { num: '03', title: 'Practice the gaps', desc: 'Train on the exact question types you missed — not random sets.' },
      { num: '04', title: 'Replay weak vocab', desc: 'Keep slow words in rotation until reading speed catches up.' },
    ],
    cards: [
      { Icon: Headphones, label: 'Listening', cls: 'left-[4%] top-[14%] w-[7rem] rotate-[-7deg] sm:w-[9rem] lg:w-[11rem]',        anim: 'ielts-landing-float' },
      { Icon: BookOpen,   label: 'Reading',   cls: 'right-[6%] top-[8%] w-[7rem] rotate-[6deg] sm:w-[9rem] lg:w-[10.5rem]',       anim: 'ielts-landing-drift' },
      { Icon: PenLine,    label: 'Writing',   cls: 'left-[26%] bottom-[12%] w-[6.5rem] rotate-[-4deg] sm:w-[8.5rem] lg:w-[10rem]', anim: 'ielts-landing-drift' },
      { Icon: Mic,        label: 'Speaking',  cls: 'right-[22%] bottom-[16%] w-[6.5rem] rotate-[5deg] sm:w-[8.5rem] lg:w-[10rem]', anim: 'ielts-landing-float' },
      { Icon: Target,     label: 'Band 8.0',  cls: 'left-[44%] top-[40%] w-[6rem] rotate-[3deg] sm:w-[7.5rem] lg:w-[8.5rem]',     anim: 'ielts-landing-float' },
    ],
  },
  cefr: {
    eyebrow: 'Your path',
    headline: 'Know where you stand.',
    sub: 'Your placement results, missed descriptors, and vocab gaps map directly into focused practice at your current CEFR level.',
    steps: [
      { num: '01', title: 'Take a placement test', desc: 'Get an accurate A1–C2 baseline across all four skills.' },
      { num: '02', title: 'Read your skill map',   desc: 'See which CEFR descriptors you have not yet reached and why.' },
      { num: '03', title: 'Practice the gaps',     desc: 'Train on the exact tasks blocking your level — not random sets.' },
      { num: '04', title: 'Build active vocab',    desc: 'Target the words holding back your reading and writing scores.' },
    ],
    cards: [
      { Icon: Headphones, label: 'Listening', cls: 'left-[4%] top-[14%] w-[7rem] rotate-[-7deg] sm:w-[9rem] lg:w-[11rem]',        anim: 'ielts-landing-float' },
      { Icon: BookOpen,   label: 'Reading',   cls: 'right-[6%] top-[8%] w-[7rem] rotate-[6deg] sm:w-[9rem] lg:w-[10.5rem]',       anim: 'ielts-landing-drift' },
      { Icon: PenLine,    label: 'Writing',   cls: 'left-[26%] bottom-[12%] w-[6.5rem] rotate-[-4deg] sm:w-[8.5rem] lg:w-[10rem]', anim: 'ielts-landing-drift' },
      { Icon: Mic,        label: 'Speaking',  cls: 'right-[22%] bottom-[16%] w-[6.5rem] rotate-[5deg] sm:w-[8.5rem] lg:w-[10rem]', anim: 'ielts-landing-float' },
      { Icon: Target,     label: 'Level C1',  cls: 'left-[44%] top-[40%] w-[6rem] rotate-[3deg] sm:w-[7.5rem] lg:w-[8.5rem]',     anim: 'ielts-landing-float' },
    ],
  },
}

interface Props { mode: Mode }

export default function RouteSection({ mode }: Props) {
  const c = CONTENT[mode] ?? CONTENT['ielts']

  return (
    <section
      id="route"
      className="relative overflow-hidden px-5 py-16 sm:px-8 sm:py-24 lg:py-32"
      style={{ fontFamily: 'Manrope, Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
    >
      <div
        className="absolute inset-0 -z-10"
        style={{ background: 'linear-gradient(rgb(250,249,255) 0%, rgb(248,247,255) 100%)' }}
      />

      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">

        {/* Left: floating skill cards */}
        <div className="ielts-reveal relative min-h-[29rem] overflow-visible">
          <div
            className="absolute inset-x-[6%] top-[24%] h-[58%] rounded-[50%] blur-2xl"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18), rgba(99,102,241,0.09) 58%, transparent 73%)' }}
          />
          <svg
            viewBox="0 0 640 420"
            aria-hidden="true"
            className="absolute inset-x-[7%] top-[12%] hidden h-[78%] w-[86%] opacity-80 sm:block"
          >
            <path
              d="M72 250 C138 112 274 94 328 178 C386 268 488 242 566 104"
              fill="none"
              stroke={ACCENT}
              strokeOpacity="0.35"
              strokeWidth="3"
              strokeDasharray="12 16"
              strokeLinecap="round"
            />
          </svg>

          {c.cards.map(({ Icon, label, cls, anim }) => (
            <div key={label} className={`${anim} pointer-events-none absolute z-20 ${cls}`}>
              <div
                className="flex flex-col items-center gap-2 rounded-[1rem] border px-3 py-3 shadow-[0_16px_24px_rgba(17,24,39,0.08)]"
                style={{ background: 'rgb(248,247,255)', borderColor: 'rgb(224,222,255)' }}
              >
                <div className="flex size-9 items-center justify-center rounded-full" style={{ background: ACCENT }}>
                  <Icon className="size-5 text-white" strokeWidth={2.2} />
                </div>
                <span className="text-[0.78rem] font-semibold" style={{ color: 'rgb(26,19,40)', fontFamily: 'Geist, Manrope, sans-serif' }}>
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: steps */}
        <div className="ielts-reveal">
          <p className="text-[0.78rem] font-bold uppercase tracking-[0.18em]" style={{ color: ACCENT, fontFamily: 'Geist, Manrope, sans-serif' }}>
            {c.eyebrow}
          </p>
          <h2
            className="mt-3 max-w-2xl leading-[1] tracking-[-0.055em]"
            style={{ fontSize: 'clamp(2rem,9vw,4.9rem)', fontWeight: 600, color: 'rgb(26,19,40)' }}
          >
            {c.headline}
          </h2>
          <p
            className="mt-4 max-w-xl font-medium leading-relaxed sm:mt-5 sm:text-[1.08rem]"
            style={{ fontSize: '1rem', color: 'rgb(99,91,120)' }}
          >
            {c.sub}
          </p>

          <div className="mt-8 divide-y border-y sm:mt-10" style={{ borderColor: 'rgb(224,222,255)' }}>
            {c.steps.map(({ num, title, desc }) => (
              <div key={num} className="grid gap-4 py-6 sm:grid-cols-[3.4rem_1fr]" style={{ borderColor: 'rgb(224,222,255)' }}>
                <span className="pt-1 text-[0.78rem] font-bold tracking-[0.18em]" style={{ color: ACCENT, fontFamily: 'Geist, Manrope, sans-serif' }}>
                  {num}
                </span>
                <div>
                  <h3 className="tracking-[-0.03em]" style={{ fontSize: '1.22rem', fontWeight: 600, color: 'rgb(26,19,40)' }}>
                    {title}
                  </h3>
                  <p className="mt-1.5 max-w-2xl text-[0.98rem] leading-relaxed" style={{ color: 'rgb(99,91,120)' }}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
