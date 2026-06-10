'use client'

import { Target, BookOpen, PenLine, Sparkles, History, ArrowRight } from 'lucide-react'
import type { Mode } from './useModeTransition'

const ACCENT = '#6366f1'

const CONTENT = {
  ielts: {
    eyebrow: 'Everything stays connected',
    headline: 'One mock.\nA full study route.',
    sub: 'Your mock results feed directly into the question bank, writing AI, vocabulary drills, and progress tracker — so nothing you practice is disconnected from the band you are chasing.',
    features: [
      { href: '/mock', Icon: Target, tag: 'Full mocks', title: 'Feel ready before you walk in', desc: 'Timed Listening, Reading, Writing, and Speaking in one session — with a structured review path after every attempt.' },
      { href: '/reading', Icon: BookOpen, tag: '10,000+ items', title: 'Drill the questions that cost you marks', desc: 'Filter by skill, question type, difficulty level, and the exact patterns you keep getting wrong.' },
      { href: '/writing', Icon: PenLine, tag: 'Writing AI', title: 'Band-rubric feedback in minutes', desc: 'Task Response, Coherence and Cohesion, Lexical Resource, and Grammatical Range — all scored against the official rubric.' },
      { href: '/vocabulary', Icon: Sparkles, tag: 'Vocab', title: 'Stop forgetting the same words', desc: 'Words you miss in tests come back on a spaced schedule and stay in rotation until they no longer slow your reading score.' },
      { href: '/dashboard', Icon: History, tag: 'Progress', title: 'Watch your band score move', desc: 'Every mock, practice session, and writing score sits in one timeline so you can see what is working and what is not.' },
    ],
  },
  cefr: {
    eyebrow: 'Everything stays connected',
    headline: 'One test.\nA full learning path.',
    sub: 'Your placement results feed directly into the question bank, writing AI, vocabulary drills, and progress tracker — so every practice session moves you toward the next level.',
    features: [
      { href: '/mock', Icon: Target, tag: 'Level tests', title: 'Know exactly where you stand', desc: 'Timed Reading, Listening, Writing, and Speaking — followed by a clear CEFR level result and a review path.' },
      { href: '/reading', Icon: BookOpen, tag: '10,000+ items', title: 'Practice what is blocking your level', desc: 'Filter by CEFR level, skill type, question format, and the specific gaps that keep appearing in your results.' },
      { href: '/writing', Icon: PenLine, tag: 'Writing AI', title: 'CEFR descriptor feedback, not just a grade', desc: 'Range, accuracy, fluency, and coherence scored against official CEFR can-do statements — with specific suggestions.' },
      { href: '/vocabulary', Icon: Sparkles, tag: 'Vocab', title: 'Stop forgetting the same words', desc: 'Words you miss come back on a spaced schedule and stay in rotation until they stop appearing in your errors.' },
      { href: '/dashboard', Icon: History, tag: 'Progress', title: 'Watch your level climb', desc: 'Every test, practice session, and feedback score sits in one timeline so your progress across all skills stays visible.' },
    ],
  },
}

interface Props { mode: Mode }

export default function ConnectedSection({ mode }: Props) {
  const c = CONTENT[mode] ?? CONTENT['ielts']

  return (
    <section
      className="px-5 py-20 sm:px-8 sm:py-28 lg:py-36"
      style={{
        fontFamily: 'Manrope, Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background: 'rgb(248,247,255)',
      }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.6fr] lg:items-start lg:gap-24">

          {/* Left — sticky copy */}
          <div className="lg:sticky lg:top-28">
            <p
              className="text-[0.65rem] font-bold uppercase tracking-[0.24em]"
              style={{ color: 'rgb(160,152,180)' }}
            >
              {c.eyebrow}
            </p>
            <h2
              className="mt-4 whitespace-pre-line leading-[1.04] tracking-[-0.055em]"
              style={{ fontSize: 'clamp(1.7rem, 3vw, 2.9rem)', fontWeight: 600, color: 'rgb(26,19,40)' }}
            >
              {c.headline}
            </h2>
            <div
              className="mt-5 h-px w-8"
              style={{ background: 'rgba(99,102,241,0.35)' }}
            />
            <p
              className="mt-5 leading-[1.75]"
              style={{ fontSize: '0.92rem', color: 'rgb(120,112,150)', maxWidth: '28rem' }}
            >
              {c.sub}
            </p>
          </div>

          {/* Right — feature rows */}
          <div>
            {c.features.map(({ href, Icon, tag, title, desc }, i) => (
              <a
                key={tag}
                href={href}
                className="group flex items-start gap-5 border-b py-7 last:border-b-0 sm:gap-6"
                style={{ borderColor: 'rgb(234,232,248)' }}
              >
                {/* Icon */}
                <div
                  className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-[0.75rem] transition-colors duration-200 group-hover:bg-[rgba(99,102,241,0.12)]"
                  style={{ background: 'rgba(99,102,241,0.07)' }}
                >
                  <Icon className="size-[18px]" style={{ color: ACCENT }} strokeWidth={2} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3
                      className="leading-snug tracking-[-0.028em]"
                      style={{ fontSize: '1.02rem', fontWeight: 600, color: 'rgb(26,19,40)' }}
                    >
                      {title}
                    </h3>
                    <span
                      className="rounded-[0.38rem] px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.1em]"
                      style={{ background: 'rgba(99,102,241,0.08)', color: ACCENT }}
                    >
                      {tag}
                    </span>
                  </div>
                  <p
                    className="mt-2 leading-[1.65]"
                    style={{ fontSize: '0.875rem', color: 'rgb(120,112,150)' }}
                  >
                    {desc}
                  </p>
                </div>

                {/* Arrow */}
                <ArrowRight
                  className="mt-1 hidden size-4 shrink-0 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-60 sm:block"
                  style={{ color: 'rgb(99,102,241)' }}
                  strokeWidth={2}
                />
              </a>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}