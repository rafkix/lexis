'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

const solutions = [
  {
    title: 'AI Simulates Real Examiner',
    description:
      'Practice with an adaptive AI that behaves like a real IELTS examiner and challenges your level',
  },
  {
    title: 'Real-Time Band Score',
    description:
      'Instant IELTS band score (0–9) and CEFR level after every speaking session',
  },
  {
    title: 'Detailed Feedback Analysis',
    description:
      'Get actionable insights on fluency, grammar, vocabulary, and pronunciation instantly',
  },
]

export default function Solution() {
  const router = useRouter()
  const { data: session } = useSession()

  const go = (path: string) => {
    router.push(session ? path : '/auth/login')
  }

  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">

      <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

        {/* LEFT (TEXT + CTA) */}
        <div>
          <h2 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6 leading-tight">
            Turn Your Speaking
            <span className="block text-red-600">
              Into Real Exam Confidence
            </span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed">
            Lexis AI gives you a realistic speaking experience, instant scoring,
            and deep feedback — so you improve faster and walk into the exam fully prepared.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => go('/practice')}
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-5 text-lg shadow-xl"
            >
              Start Speaking Now
            </Button>

            <Button
              onClick={() => go('/exam')}
              size="lg"
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 px-8 py-5 text-lg"
            >
              Try Exam Mode
            </Button>
          </div>

        </div>

        {/* RIGHT (STACKED CARDS) */}
        <div className="space-y-6">

          {solutions.map((item, idx) => (
            <Card
              key={idx}
              className="
                group p-6 rounded-2xl border border-border
                bg-card/80 backdrop-blur-xl
                transition-all duration-300
                hover:shadow-2xl hover:-translate-y-1 hover:border-red-300
              "
            >
              <div className="flex gap-4">

                {/* ICON */}
                <div className="flex-shrink-0">
                  <div className="
                    h-12 w-12 rounded-lg 
                    bg-red-50 flex items-center justify-center
                    group-hover:bg-red-100 transition
                  ">
                    <CheckCircle2 className="w-6 h-6 text-red-600" />
                  </div>
                </div>

                {/* TEXT */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>

                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>

              </div>
            </Card>
          ))}

        </div>

      </div>
    </section>
  )
}