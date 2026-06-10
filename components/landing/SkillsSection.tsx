'use client'

import { Headphones, BookOpen, PenLine, Mic, CheckCircle2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Mode } from './useModeTransition'

const ACCENT = '#6366f1'

const CONTENT = {
  ielts: {
    eyebrow: 'Four skills. One score.',
    headline: 'Every skill tested.\nEvery gap addressed.',
    sub: 'IELTS scores every skill separately. Identify exactly which one is pulling your band down — and fix only that.',
    skills: [
      {
        Icon: Headphones,
        label: 'Listening',
        score: '8.5',
        id: 'skill-ielts-listening',
        href: '/practice/ielts/listening',
        color: '#6366f1',
        points: [
          'Matching, MCQ, map/diagram labelling',
          'Section-by-section difficulty analysis',
          'Audio replay on review mode',
        ],
      },
      {
        Icon: BookOpen,
        label: 'Reading',
        score: '7.0',
        id: 'skill-ielts-reading',
        href: '/practice/ielts/reading',
        color: '#6366f1',
        points: [
          'True/False/Not Given and matching headings',
          'Passage-level time tracking',
          'Keyword strategy highlights',
        ],
      },
      {
        Icon: PenLine,
        label: 'Writing',
        score: '6.5',
        id: 'skill-ielts-writing',
        href: '/practice/ielts/writing',
        color: '#6366f1',
        points: [
          'Task 1 and Task 2 AI scoring',
          'Full band rubric breakdown',
          'Lexical resource and coherence suggestions',
        ],
      },
      {
        Icon: Mic,
        label: 'Speaking',
        score: '7.5',
        id: 'skill-ielts-speaking',
        href: '/practice/ielts/speaking',
        color: '#6366f1',
        points: [
          'Part 1, 2, and 3 practice prompts',
          'Fluency, vocabulary, and grammar feedback',
          'Model answer comparisons',
        ],
      },
    ],
  },
  cefr: {
    eyebrow: 'Six levels. Clear milestones.',
    headline: 'Every level mapped.\nEvery skill tracked.',
    sub: 'CEFR measures each skill independently. See exactly where you sit on the A1–C2 scale — and what it takes to move up.',
    skills: [
      {
        Icon: Headphones,
        label: 'Listening',
        score: 'B2',
        id: 'skill-cefr-listening',
        href: '/practice/cefr/listening',
        color: '#6366f1',
        points: [
          'Extended speech, news, and lectures',
          'Level-labelled practice sets',
          'Speed and accent variation drills',
        ],
      },
      {
        Icon: BookOpen,
        label: 'Reading',
        score: 'B1',
        id: 'skill-cefr-reading',
        href: '/practice/cefr/reading',
        color: '#6366f1',
        points: [
          'Authentic texts at every CEFR level',
          'Descriptor-aligned question types',
          'Vocabulary-in-context tracking',
        ],
      },
      {
        Icon: PenLine,
        label: 'Writing',
        score: 'B2',
        id: 'skill-cefr-writing',
        href: '/practice/cefr/writing',
        color: '#6366f1',
        points: [
          'Range, accuracy, and fluency scoring',
          'Can-do statement feedback',
          'Task-type variety: formal, informal, academic',
        ],
      },
      {
        Icon: Mic,
        label: 'Speaking',
        score: 'C1',
        id: 'skill-cefr-speaking',
        href: '/practice/cefr/speaking',
        color: '#6366f1',
        points: [
          'Structured conversation prompts by level',
          'Interaction and production feedback',
          'Phonology and stress pattern tips',
        ],
      },
    ],
  },
}

// Hook: IntersectionObserver bilan kard ko'ringanda animatsiya boshlash
function useRevealOnScroll(count: number) {
  const refs = useRef<(HTMLElement | null)[]>([])
  const [visible, setVisible] = useState<boolean[]>(Array(count).fill(false))

  useEffect(() => {
    setVisible(Array(count).fill(false))
    const observers: IntersectionObserver[] = []

    refs.current.forEach((el, i) => {
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible((prev) => {
              const next = [...prev]
              next[i] = true
              return next
            })
            obs.disconnect()
          }
        },
        { threshold: 0.15 }
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [count])

  return { refs, visible }
}

interface Props { mode: Mode }

export default function SkillsSection({ mode }: Props) {
  const c = CONTENT[mode] ?? CONTENT['ielts']
  const { refs, visible } = useRevealOnScroll(c.skills.length)

  return (
    <section
      id="skills"
      className="px-5 py-20 sm:px-8 sm:py-32 lg:py-40"
      style={{
        fontFamily: 'Manrope, Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background: 'rgb(250,249,255)',
      }}
    >
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="max-w-3xl">
          <p
            className="text-[0.75rem] font-bold uppercase tracking-[0.22em]"
            style={{ color: ACCENT }}
          >
            {c.eyebrow}
          </p>
          <h2
            className="mt-6 whitespace-pre-line leading-[1.02] tracking-[-0.06em]"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 4.4rem)', fontWeight: 600, color: 'rgb(26,19,40)' }}
          >
            {c.headline}
          </h2>
          <p
            className="mt-6 leading-[1.75]"
            style={{ fontSize: 'clamp(1rem, 1.5vw, 1.1rem)', color: 'rgb(99,91,120)', maxWidth: '36rem' }}
          >
            {c.sub}
          </p>
        </div>

        {/* Skills grid */}
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 sm:mt-20">
          {c.skills.map(({ Icon, label, score, id, href, points }, i) => (

            <a key={id}
              id={id}
              href={href}
              ref={(el) => { refs.current[i] = el }}
              className="group relative overflow-hidden rounded-[1.4rem] border p-6 block no-underline"
              style={{
                background: 'rgb(252,251,255)',
                borderColor: 'rgb(224,222,255)',
                // Entry animatsiyasi
                opacity: visible[i] ? 1 : 0,
                transform: visible[i] ? 'translateY(0)' : 'translateY(28px)',
                transition: `opacity 0.5s ease ${i * 80}ms, transform 0.5s ease ${i * 80}ms, box-shadow 0.2s ease`,
                // Hover shadow
                boxShadow: 'none',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 40px rgba(99,102,241,0.12)'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'none'
              }}
            >
              {/* Subtle glow on hover */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-[1.4rem]"
                style={{ background: 'radial-gradient(circle at 50% 0%, rgba(99,102,241,0.07), transparent 70%)' }}
              />

              {/* Icon + score row */}
              <div className="flex items-start justify-between">
                <div
                  className="flex size-11 items-center justify-center rounded-[0.85rem]"
                  style={{ background: 'rgba(99,102,241,0.09)' }}
                >
                  <Icon className="size-5" style={{ color: ACCENT }} strokeWidth={2.2} />
                </div>
                <span
                  className="rounded-[0.6rem] px-3 py-1.5 text-[1rem] font-bold tabular-nums"
                  style={{ background: ACCENT, color: 'white', fontFamily: 'Geist, Manrope, sans-serif', letterSpacing: '-0.03em' }}
                >
                  {score}
                </span>
              </div>

              {/* Label */}
              <p
                className="mt-5 text-[1.15rem] font-semibold tracking-[-0.03em]"
                style={{ color: 'rgb(26,19,40)' }}
              >
                {label}
              </p>

              {/* Points */}
              <ul className="mt-4 space-y-2.5">
                {points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2.5">
                    <CheckCircle2
                      className="mt-[1px] size-4 shrink-0"
                      style={{ color: 'rgba(99,102,241,0.55)' }}
                      strokeWidth={2}
                    />
                    <span
                      className="text-[0.86rem] leading-[1.55]"
                      style={{ color: 'rgb(99,91,120)' }}
                    >
                      {pt}
                    </span>
                  </li>
                ))}
              </ul>

              {/* "Practice →" call-to-action */}
              <p
                className="mt-5 text-[0.82rem] font-semibold tracking-[-0.01em] transition-colors duration-150 group-hover:text-indigo-500"
                style={{ color: 'rgba(99,102,241,0.5)' }}
              >
                Practice →
              </p>
            </a>
          ))}
        </div>

      </div>
    </section>
  )
}