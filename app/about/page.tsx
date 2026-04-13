'use client'

import Navbar from '@/components/Header'
import Footer from '@/components/Footer'
import { Card } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function AboutPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const handleStart = () => {
    if (session) {
      router.push('/practice')
    } else {
      router.push('/auth/login')
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">

      {/* 🔥 GLOBAL GRID */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      <Navbar />

      <main className="pt-28 pb-20 relative z-10">
        <div className="max-w-5xl mx-auto px-4 space-y-24">

          {/* HERO */}
          <section className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              Speak English with Confidence
              <span className="block text-red-600">
                IELTS & CEFR Ready
              </span>
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Practice real speaking scenarios, get instant AI feedback,
              and improve from A2 to C1 level.
            </p>
          </section>

          {/* PROBLEM */}
          <section className="text-center max-w-3xl mx-auto">
            <p className="text-lg text-gray-700 leading-relaxed">
              Many learners understand English but cannot speak fluently.

              <br /><br />

              In real exams like IELTS, pressure, timing, and confidence
              become the biggest challenges — not grammar.
            </p>
          </section>

          {/* SOLUTION */}
          <section>
            <div className="
              p-10 rounded-3xl
              backdrop-blur-2xl
              bg-white/60
              border border-white/40
              shadow-[0_10px_40px_rgba(0,0,0,0.1)]
            ">
              <h2 className="text-3xl font-bold mb-4">
                Built for IELTS & CEFR Speaking
              </h2>

              <p className="text-gray-700 text-lg leading-relaxed">
                Lexis simulates real exam conditions with structured speaking tasks,
                including IELTS Part 1, 2, 3 and CEFR-level conversations.

                <br /><br />

                You get instant feedback on fluency, grammar, vocabulary,
                and pronunciation — exactly what examiners evaluate.
              </p>
            </div>
          </section>

          {/* LEVELS */}
          <section>
            <h2 className="text-3xl font-bold mb-10">
              Multi-Level Learning System
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  level: 'A2 – B1',
                  desc: 'Build basic speaking confidence'
                },
                {
                  level: 'B2',
                  desc: 'Improve fluency and structure'
                },
                {
                  level: 'C1',
                  desc: 'Advanced speaking & exam readiness'
                }
              ].map((item, i) => (
                <Card
                  key={i}
                  className="p-6 rounded-2xl backdrop-blur-xl bg-white/50 border border-white/40"
                >
                  <h3 className="text-xl font-bold mb-2 text-red-600">
                    {item.level}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {item.desc}
                  </p>
                </Card>
              ))}
            </div>
          </section>

          {/* WHY */}
          <section>
            <h2 className="text-3xl font-bold mb-10">
              Why Choose Lexis
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                'Real IELTS speaking simulation',
                'Instant AI feedback (no teacher needed)',
                'CEFR-based structured practice',
                'Track your speaking improvement daily'
              ].map((text, i) => (
                <Card
                  key={i}
                  className="p-6 rounded-2xl backdrop-blur-xl bg-white/50 border border-white/40"
                >
                  <div className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-red-500" />
                    <p className="text-gray-700">{text}</p>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* UZBEK USERS */}
          <section className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              Built for Uzbek Learners
            </h2>

            <p className="text-gray-600 text-lg">
              Designed specifically for students in Uzbekistan preparing
              for IELTS and CEFR exams — with clear explanations,
              realistic practice, and simple user experience.
            </p>
          </section>

          {/* PROCESS */}
          <section>
            <h2 className="text-3xl font-bold mb-10">
              How It Works
            </h2>

            <div className="space-y-6">
              {[
                'Choose your level (A2–C1)',
                'Start speaking practice or mock exam',
                'Get instant AI feedback',
                'Improve daily and track progress'
              ].map((step, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                  <p className="text-gray-700 text-lg">{step}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              Start Your Speaking Journey
            </h2>

            <p className="text-gray-600 mb-6">
              Practice anytime. Improve faster. Get your target score.
            </p>

            <button
              onClick={handleStart}
              className="
                px-8 py-4 rounded-xl
                bg-red-600 text-white font-semibold
                hover:bg-red-700 transition
                shadow-lg
              "
            >
              Start Free Practice
            </button>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  )
}