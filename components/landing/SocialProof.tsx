'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Azizbek R.',
    role: 'IELTS Student',
    score: '5.5 → 6.5',
    quote: 'Oldin gapira olmasdim, endi ishonch bilan gapiryapman.',
  },
  {
    name: 'Madina T.',
    role: 'Student',
    score: '6.0 → 7.0',
    quote: 'Har kuni 10 daqiqa mashq qilib katta natijaga chiqdim.',
  },
  {
    name: 'Javohir S.',
    role: 'IELTS Candidate',
    score: '6.5 → 7.5',
    quote: 'Real examdek bo‘ldi. Stress yo‘qoldi.',
  },
  {
    name: 'Dilnoza K.',
    role: 'CEFR Learner',
    score: 'B2 → C1',
    quote: 'Feedback juda aniq va foydali.',
  },
  {
    name: 'Sardor M.',
    role: 'Student',
    score: '6.0 → 7.0',
    quote: 'Speaking uchun eng yaxshi platformalardan biri.',
  },
  {
    name: 'Bekzod A.',
    role: 'IELTS Student',
    score: '5.5 → 6.5',
    quote: 'Savollar juda real, examga tayyorlanish osonlashdi.',
  },
  {
    name: 'Zarina H.',
    role: 'Student',
    score: '6.5 → 7.5',
    quote: 'Fluency ustida ishlash uchun juda qulay.',
  },
  {
    name: 'Shohruh D.',
    role: 'IELTS Candidate',
    score: '6.0 → 7.0',
    quote: 'AI examiner juda real gaplashadi.',
  },
  {
    name: 'Akmal T.',
    role: 'CEFR Learner',
    score: 'B1 → B2',
    quote: 'Endi inglizcha gapirishdan qo‘rqmayman.',
  },
  {
    name: 'Nigora S.',
    role: 'Student',
    score: '6.0 → 6.5',
    quote: 'Har kuni practice qilish odat bo‘lib qoldi.',
  },
  {
    name: 'Umidjon P.',
    role: 'IELTS Student',
    score: '5.5 → 6.0',
    quote: 'Boshlanish uchun juda yaxshi platforma.',
  },
  {
    name: 'Diyorbek R.',
    role: 'Student',
    score: '6.5 → 7.0',
    quote: 'Grammar xatolarimni tez tushunib oldim.',
  },
  {
    name: 'Feruza M.',
    role: 'CEFR Learner',
    score: 'B2 → C1',
    quote: 'Speaking darajam ancha oshdi.',
  },
  {
    name: 'Alisher Q.',
    role: 'IELTS Candidate',
    score: '6.0 → 7.0',
    quote: 'Real examdan oldin aynan shu kerak edi.',
  },
  {
    name: 'Kamola Y.',
    role: 'Student',
    score: '6.5 → 7.0',
    quote: 'Confidence juda oshdi.',
  },
  {
    name: 'Rustam B.',
    role: 'Student',
    score: '5.5 → 6.5',
    quote: 'Gapirishim ancha ravonlashdi.',
  },
  {
    name: 'Azamat M.',
    role: 'IELTS Student',
    score: '7.0 → 8.0',
    quote: 'The feedback helped me fix my weak points fast.',
  },
  {
    name: 'Faruxx S.',
    role: 'CEFR Learner',
    score: 'B2 → C1',
    quote: 'Feels like a real speaking exam environment.',
  },
  {
    name: 'Usmonbek Q.',
    role: 'IELTS Candidate',
    score: '6.5 → 7.5',
    quote: 'Practicing daily made a huge difference.',
  },
  {
    name: 'Sanjar 10.',
    role: 'Student',
    score: '6.0 → 7.0',
    quote: 'Very useful for improving fluency and confidence.',
  }
]
export default function SocialProof() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const getCard = (i: number) =>
    testimonials[(index + i + testimonials.length) % testimonials.length]

  return (
    <section className="relative py-28 px-4 overflow-hidden">

      {/* 🔥 CONTENT */}
      <div className="relative z-10 max-w-6xl mx-auto text-center ">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-12">
          <span className="bg-gradient-to-r from-red-600 to-red-600 bg-clip-text text-transparent ">
            Students Are Improving Fast
          </span>
        </h2>

        {/* 💥 3D CAROUSEL */}
        <div className="relative flex items-center justify-center gap-6">

          {[-1, 0, 1].map((offset) => {
            const item = getCard(offset)

            const isCenter = offset === 0

            return (
              <Card
                key={offset}
                className={`
                  transition-all duration-500
                  p-6 w-[320px]
                  ${isCenter
                    ? 'scale-100 opacity-100 shadow-2xl z-10'
                    : 'scale-90 opacity-50 blur-[1px]'
                  }
                `}
              >

                {/* ⭐ */}
                <div className="flex gap-1 mb-3 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-red-500 fill-red-500" />
                  ))}
                </div>

                {/* 💬 */}
                <p className="text-gray-800 text-base mb-5 italic min-h-[70px]">
                  "{item.quote}"
                </p>

                {/* 👤 */}
                <div className="flex items-center gap-3 justify-center">

                  {/* AVATAR */}
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">
                    {item.name[0]}
                  </div>

                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.role}
                    </p>
                    <p className="text-xs text-red-600">
                      {item.score}
                    </p>
                  </div>

                </div>

              </Card>
            )
          })}

        </div>

      </div>
    </section>
  )
}