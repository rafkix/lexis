'use client'

import { ArrowRight, Star } from 'lucide-react'
import type { Mode } from './useModeTransition'

const ACCENT = '#6366f1'

const CONTENT = {
  ielts: {
    eyebrow: 'Student proof',
    headline: 'Bands moving up.',
    reviews: [
      {
        initials: 'NN', name: 'Nurmukhammad Nurr',
        before: '5.5', after: '7.5',
        quote: '"I liked the format of the test. I felt like in a real exam because of some restrictions such as not able to pause or restart audio. I wanna say my thanks to Ganisher teacher.."',
      },
      {
        initials: 'SS', name: 'saltanat sevinchova',
        before: '6.0', after: '7.5',
        quote: '"Assalamu alaykum. Biroz keyinroq bolsada bu marathonni tugatdim 25 martda examga kiryapman. Explanation video drasliklar readingni improve qilishga katta yordam berdi va saytni o\'zi ham juda qulay. Raxmat."',
      },
      {
        initials: 'SR', name: 'Samandar Ramanov',
        before: '6.5', after: '8.0',
        quote: '"This is one of the coolest projects i\'ve ever seen in my life)"',
      },
    ],
  },
  cefr: {
    eyebrow: 'Student proof',
    headline: 'Levels moving up.',
    reviews: [
      {
        initials: 'AK', name: 'Aziz Karimov',
        before: 'B1', after: 'C1',
        quote: '"The placement test was spot on — it found exactly the gaps I didn\'t know I had. Within three months I moved two full levels, which I didn\'t think was possible that fast."',
      },
      {
        initials: 'MY', name: 'Malika Yusupova',
        before: 'A2', after: 'B2',
        quote: '"The writing AI feedback is unlike anything else. It doesn\'t just grade you — it tells you which CEFR can-do statements you\'re missing and how to fix them. Genuinely helpful."',
      },
      {
        initials: 'DR', name: 'Dilnoza Rashidova',
        before: 'B2', after: 'C2',
        quote: '"I used this to prepare for a university language requirement. The structured path made it very clear what to work on each week. Passed with C2 first attempt."',
      },
    ],
  },
}

interface Props { mode: Mode }

export default function ResultsSection({ mode }: Props) {
  const c = CONTENT[mode] ?? CONTENT['ielts']

  return (
    <section
      id="results"
      className="px-5 py-16 sm:px-8 sm:py-24 lg:py-32"
      style={{
        fontFamily: 'Manrope, Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background: 'rgb(248,247,255)',
      }}
    >
      <div className="mx-auto max-w-7xl">

        <div className="ielts-reveal flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p
              className="text-[0.78rem] font-bold uppercase tracking-[0.18em]"
              style={{ color: ACCENT, fontFamily: 'Geist, Manrope, sans-serif' }}
            >
              {c.eyebrow}
            </p>
            <h2
              className="mt-3 max-w-3xl leading-[1] tracking-[-0.06em]"
              style={{ fontSize: 'clamp(2rem,9vw,5.1rem)', fontWeight: 600, color: 'rgb(26,19,40)' }}
            >
              {c.headline}
            </h2>
          </div>
          <a
            className="inline-flex items-center gap-2 text-[0.94rem] font-semibold"
            href="/onboarding"
            style={{ color: ACCENT }}
          >
            See your route
            <ArrowRight className="size-4" strokeWidth={2.5} />
          </a>
        </div>

        <div className="mt-9 grid gap-4 sm:mt-12 sm:gap-6 lg:grid-cols-3">
          {c.reviews.map(({ initials, name, before, after, quote }) => (
            <article
              key={initials}
              className="ielts-reveal rounded-[1.15rem] border p-5 sm:p-6"
              style={{ borderColor: 'rgb(224,222,255)', background: 'rgb(250,249,255)' }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="rounded-[0.72rem] px-4 py-2 text-[1.05rem] font-semibold tabular-nums"
                  style={{ background: 'rgb(232,229,255)', color: 'rgb(120,112,150)', fontFamily: 'Geist, Manrope, sans-serif' }}
                >
                  {before}
                </span>
                <ArrowRight className="size-4" style={{ color: 'rgb(120,112,150)' }} strokeWidth={2.5} />
                <span
                  className="rounded-[0.72rem] px-4 py-2 text-[1.05rem] font-semibold tabular-nums text-white"
                  style={{ background: ACCENT, fontFamily: 'Geist, Manrope, sans-serif' }}
                >
                  {after}
                </span>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <div
                  className="flex size-12 items-center justify-center rounded-full text-[0.95rem] font-semibold text-white"
                  style={{ background: ACCENT, fontFamily: 'Geist, Manrope, sans-serif' }}
                >
                  {initials}
                </div>
                <div>
                  <p className="font-semibold leading-tight" style={{ color: 'rgb(26,19,40)' }}>{name}</p>
                  <p className="text-[0.82rem]" style={{ color: 'rgb(120,112,150)' }}>Verified review</p>
                </div>
              </div>

              <div className="mt-5 flex" style={{ color: 'rgb(245,168,0)' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4" fill="currentColor" strokeWidth={0} />
                ))}
              </div>

              <p className="mt-5 text-[0.98rem] leading-relaxed" style={{ color: 'rgb(63,47,60)' }}>
                {quote}
              </p>
            </article>
          ))}
        </div>

      </div>
    </section>
  )
}
