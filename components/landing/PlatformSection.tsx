'use client'

import { ArrowRight, MapPin } from 'lucide-react'
import type { Mode } from './useModeTransition'

const ACCENT = '#6366f1'

const CONTENT = {
  ielts: {
    eyebrow: 'Your IELTS training ground',
    headline: 'Mock. Analyse.\nImprove.',
    sub: 'Take a full timed mock, get a precise breakdown of where you lost marks, and know exactly what to work on before your next attempt.',
    rows: [
      { label: 'Full mock tests', desc: 'Academic and General Training under real exam conditions — timing, format, and difficulty included.' },
      { label: 'Skill breakdown', desc: 'See which sub-skills are holding your band score back and by exactly how much.' },
      { label: 'Targeted next step', desc: 'After every mock, one focused task is assigned based on your weakest area — no guessing what to study.' },
    ],
    cardLabel: 'IELTS Academic · Reading · Passage 2',
    passageText1: 'The migration patterns of arctic terns have long puzzled ornithologists. These small seabirds travel from pole to pole each year, covering distances no other vertebrate matches. Recent geolocator studies suggest the route is not a straight line — instead,',
    passageHighlight: 'the birds use atmospheric pressure systems to conserve energy',
    passageText2: ', adding thousands of kilometres to the trip.',
    passageText3: 'This finding challenges earlier assumptions that the species relied solely on celestial navigation, and opens questions about whether warming oceans will disrupt these pressure-system corridors.',
    questionNum: 'Question 14',
    blankSentence: 'Arctic terns add extra distance to their migration by using',
    blankAnswer: 'pressure systems',
    blankEnd: 'to conserve energy.',
    hint: 'Tip: look for the phrase that explains how terns conserve energy during migration.',
    progressLabel: '14 of 40',
  },
  cefr: {
    eyebrow: 'Your CEFR learning path',
    headline: 'Test. Map.\nLevel up.',
    sub: 'Start with a placement test that tells you exactly where you are on the A1–C2 scale, then follow a structured path built around your current level.',
    rows: [
      { label: 'Placement tests', desc: 'Accurate level assessment across reading, listening, writing, and speaking — not just a grammar quiz.' },
      { label: 'Skill map', desc: 'See the specific CEFR descriptors you have not yet reached and what is standing between you and the next level.' },
      { label: 'Targeted next step', desc: 'After every test, one focused task is assigned to close the gap between where you are and where you need to be.' },
    ],
    cardLabel: 'CEFR B2 · Reading · Practice Set',
    passageText1: 'Large language models have transformed how computers process text. Unlike earlier rule-based systems, these models learn patterns from vast amounts of data. Researchers note that',
    passageHighlight: 'the most capable models adapt their outputs depending on the situation',
    passageText2: ', which makes them useful across many different domains.',
    passageText3: 'This flexibility raises questions about reliability and consistency, prompting ongoing research into how such systems can be better evaluated and controlled.',
    questionNum: 'Question 6',
    blankSentence: 'The most capable language models are known for',
    blankAnswer: 'adapting outputs',
    blankEnd: 'depending on context.',
    hint: 'Tip: look for the phrase that describes what makes the most capable models stand out.',
    progressLabel: '6 of 30',
  },
}

interface Props { mode: Mode }

export default function PlatformSection({ mode }: Props) {
  const c = CONTENT[mode] ?? CONTENT['ielts']

  return (
    <section
      id="platform"
      className="overflow-hidden px-5 py-20 sm:px-8 sm:py-32 lg:py-40"
      style={{
        fontFamily: 'Manrope, Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background: 'rgb(248, 247, 255)',
      }}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&display=swap');

        @keyframes writeLine {
          from { stroke-dashoffset: 120; opacity: 0; }
          to   { stroke-dashoffset: 0;   opacity: 1; }
        }
        .write-line {
          stroke-dasharray: 120;
          stroke-dashoffset: 120;
          animation: writeLine 0.5s cubic-bezier(0.4,0,0.2,1) forwards;
        }
        .write-line-1 { animation-delay: 0.1s; }
        .write-line-2 { animation-delay: 0.22s; }
        .write-line-3 { animation-delay: 0.34s; }
        .write-line-4 { animation-delay: 0.46s; }

        @keyframes inkWrite {
          0%   { clip-path: inset(0 100% 0 0); opacity: 0; }
          5%   { opacity: 1; }
          100% { clip-path: inset(0 0% 0 0); opacity: 1; }
        }
        .fitb-answer {
          display: inline-block;
          clip-path: inset(0 100% 0 0);
          animation: inkWrite 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.4s forwards;
        }
      `}</style>

      <div className="mx-auto max-w-7xl">

        {/* ── SCREEN 1: copy + mock card ── */}
        <div className="grid gap-16 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:gap-20">

          {/* Left copy */}
          <div>
            <p
              className="text-[0.68rem] font-bold uppercase tracking-[0.22em]"
              style={{ color: ACCENT }}
            >
              {c.eyebrow}
            </p>

            <h2
              className="mt-4 whitespace-pre-line leading-[1.02] tracking-[-0.06em]"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3.4rem)', fontWeight: 600, color: 'rgb(26,19,40)' }}
            >
              {c.headline}
            </h2>

            <p
              className="mt-5 leading-[1.75]"
              style={{ fontSize: 'clamp(0.88rem, 1.2vw, 0.97rem)', color: 'rgb(99,91,120)', maxWidth: '34rem' }}
            >
              {c.sub}
            </p>

            <div
              className="mt-10 space-y-0 divide-y"
              style={{ borderColor: 'rgb(224,222,255)' }}
            >
              {c.rows.map(({ label, desc }, i) => (
                <div
                  key={label}
                  className="py-4"
                  style={{ borderColor: 'rgb(224,222,255)' }}
                >
                  <div className="flex items-start gap-4">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="mt-0.5 shrink-0">
                      <circle cx="14" cy="14" r="13" stroke="rgba(99,102,241,0.18)" strokeWidth="1.5" />
                      <text
                        x="14" y="19"
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="700"
                        fill={ACCENT}
                        fontFamily="Geist, Manrope, sans-serif"
                      >
                        {i + 1}
                      </text>
                    </svg>
                    <div>
                      <p
                        className="font-semibold leading-tight tracking-[-0.03em]"
                        style={{ fontSize: '0.97rem', color: 'rgb(26,19,40)' }}
                      >
                        {label}
                      </p>
                      <p
                        className="mt-1.5 leading-[1.65]"
                        style={{ fontSize: '0.86rem', color: 'rgb(99,91,120)' }}
                      >
                        {desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: mock card */}
          <div className="relative">
            <div
              className="absolute inset-x-[-8%] top-[20%] h-[50%] blur-3xl pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.14), transparent 64%)' }}
            />
            <div
              className="relative w-full overflow-hidden rounded-[1.6rem] border shadow-[0_32px_64px_rgba(17,24,39,0.08)]"
              style={{ background: 'rgb(252,251,255)', borderColor: 'rgb(224,222,255)' }}
            >
              {/* Top bar */}
              <div
                className="flex items-center justify-between border-b px-6 py-3.5"
                style={{ borderColor: 'rgb(224,222,255)' }}
              >
                <div className="flex items-center gap-2">
                  {['#E2DEFF', '#E2DEFF', '#E2DEFF'].map((col, i) => (
                    <span key={i} className="size-2.5 rounded-full" style={{ background: col }} />
                  ))}
                </div>
                <div
                  className="text-[0.7rem] font-semibold uppercase tracking-[0.18em]"
                  style={{ color: 'rgb(120,112,150)' }}
                >
                  {c.cardLabel}
                </div>
                <div
                  className="rounded-[0.5rem] px-2.5 py-1 text-[0.72rem] font-semibold tabular-nums"
                  style={{ background: ACCENT, color: 'white' }}
                >
                  18:42
                </div>
              </div>

              {/* Content */}
              <div className="grid gap-6 p-6 sm:grid-cols-2 sm:gap-8 sm:p-8">
                {/* Passage */}
                <div>
                  <p
                    className="text-[0.68rem] font-bold uppercase tracking-[0.2em]"
                    style={{ color: ACCENT }}
                  >
                    Passage
                  </p>
                  <p className="mt-4 text-[0.94rem] leading-[1.8]" style={{ color: 'rgb(26,19,40)' }}>
                    {c.passageText1}{' '}
                    <span style={{ background: 'rgba(99,102,241,0.13)', padding: '1px 3px', borderRadius: '3px' }}>
                      {c.passageHighlight}
                    </span>
                    {c.passageText2}
                  </p>
                  <p className="mt-4 text-[0.94rem] leading-[1.8]" style={{ color: 'rgb(99,91,120)' }}>
                    {c.passageText3}
                  </p>
                </div>

                {/* Question */}
                <div>
                  <p
                    className="text-[0.68rem] font-bold uppercase tracking-[0.2em]"
                    style={{ color: ACCENT }}
                  >
                    {c.questionNum}
                  </p>
                  <p
                    className="mt-4 text-[0.94rem] font-semibold leading-[1.65]"
                    style={{ color: 'rgb(26,19,40)' }}
                  >
                    Complete the sentence using <span style={{ color: ACCENT }}>no more than two words</span> from the passage.
                  </p>

                  <div
                    className="mt-5 rounded-[0.9rem] border p-4 leading-[1.9] text-[0.94rem]"
                    style={{ borderColor: 'rgb(224,222,255)', background: 'rgba(99,102,241,0.03)', color: 'rgb(26,19,40)' }}
                  >
                    {c.blankSentence}{' '}
                    <span
                      className="inline-block border-b-2 align-bottom"
                      style={{ borderColor: ACCENT, minWidth: '7rem', marginBottom: '-2px' }}
                    >
                      <span className="fitb-answer px-1" style={{
                        fontFamily: "'Caveat', 'Segoe Print', cursive",
                        fontSize: '1.05rem',
                        color: '#3730a3',
                        letterSpacing: '0.02em',
                      }}>
                        {c.blankAnswer}
                      </span>
                    </span>
                    {' '}{c.blankEnd}
                  </div>

                  <div
                    className="mt-3 flex items-center gap-2 rounded-[0.7rem] px-3.5 py-2.5"
                    style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.18)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6.5" stroke={ACCENT} strokeWidth="1.2" />
                      <path d="M4.5 7.2l1.8 1.8 3.2-3.5" stroke={ACCENT} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[0.8rem] font-semibold" style={{ color: ACCENT }}>
                      Correct — found in paragraph 1
                    </span>
                  </div>

                  <p className="mt-4 text-[0.8rem] leading-[1.6]" style={{ color: 'rgb(120,112,150)' }}>
                    {c.hint}
                  </p>
                </div>
              </div>

              {/* Bottom bar */}
              <div
                className="flex items-center justify-between border-t px-6 py-3.5"
                style={{ borderColor: 'rgb(224,222,255)' }}
              >
                <div
                  className="flex items-center gap-2 text-[0.76rem] font-semibold"
                  style={{ color: 'rgb(99,91,120)' }}
                >
                  <MapPin className="size-3.5" style={{ color: ACCENT }} fill={ACCENT} strokeWidth={0} />
                  {c.progressLabel}
                </div>
                <div className="text-[0.76rem] font-semibold" style={{ color: 'rgb(120,112,150)' }}>
                  Auto-saved
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
