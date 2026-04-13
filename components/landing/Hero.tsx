'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mic, Volume2, Zap } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const questions = [
  'Tell me about a hobby you enjoy and explain why you like it.',
  'Describe your favorite place in your city.',
  'Do you prefer studying alone or with others?',
  'What are your future career goals?',
]

export default function Hero() {
  const router = useRouter()
  const { data: session } = useSession()

  const waveRef = useRef<HTMLDivElement>(null)
  const miniWaveRef = useRef<HTMLDivElement>(null)

  const [time, setTime] = useState(30)
  const [qIndex, setQIndex] = useState(0)

  const go = (path: string) => {
    router.push(session ? path : '/auth/login')
  }

  // 🔥 BACKGROUND WAVE (FAST)
  useEffect(() => {
    const bars = waveRef.current?.children
    if (!bars) return

    let t = 0
    let raf: number

    const animate = () => {
      t += 0.08

      for (let i = 0; i < bars.length; i++) {
        const el = bars[i] as HTMLElement

        const h =
          60 +
          Math.sin(i * 0.25 + t) * 60 +
          Math.sin(i * 0.08 + t * 1.5) * 40

        el.style.height = `${Math.max(20, h)}px`
      }

      raf = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(raf)
  }, [])

  // 🎤 MINI WAVE (RECORDING)
  useEffect(() => {
    const bars = miniWaveRef.current?.children
    if (!bars) return

    let t = 0
    let raf: number

    const animate = () => {
      t += 0.15

      for (let i = 0; i < bars.length; i++) {
        const el = bars[i] as HTMLElement

        const h =
          15 +
          Math.sin(i * 0.4 + t) * 20 +
          Math.sin(i * 0.2 + t * 1.5) * 10

        el.style.height = `${Math.max(6, h)}px`
      }

      raf = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(raf)
  }, [])

  // ⏱ TIMER + QUESTION CHANGE
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          setQIndex((i) => (i + 1) % questions.length)
          return 30
        }
        return t - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const barsCount =
    typeof window !== 'undefined' && window.innerWidth < 768
      ? 60
      : 140

  return (
    <section className="relative w-full min-h-screen overflow-hidden flex items-center">

      {/* 🌊 BACKGROUND WAVE */}
      <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
        <div
          ref={waveRef}
          className="flex items-end w-full h-full gap-[2px] px-2"
        >
          {Array.from({ length: barsCount }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-full"
              style={{
                height: '40px',
                background:
                  'linear-gradient(to top, #ef4444, rgba(239,68,68,0.3))',
                opacity: 0.5,
              }}
            />
          ))}
        </div>
      </div>

      {/* 🔥 CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

        {/* LEFT */}
        <div>
          <Badge className="mb-6 bg-red-50 text-red-600 border-red-200">
            <Zap className="w-3 h-3 mr-1" />
            AI IELTS Speaking Simulator
          </Badge>

          <h1 className="text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-extrabold leading-[1.05] text-gray-900 mb-6">
            Speak English
            <span className="block text-red-600">
              Like Real IELTS
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-10 max-w-xl leading-relaxed">
            Real-time AI examiner, voice analysis, instant band score,
            and full speaking simulation that feels like the real exam.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => go('/practice')}
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-5 text-lg shadow-xl gap-2"
            >
              <Mic className="w-5 h-5" />
              Start Practice
            </Button>

            <Button
              onClick={() => go('/exam')}
              size="lg"
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 px-8 py-5 text-lg gap-2"
            >
              <Volume2 className="w-5 h-5" />
              Real Exam Mode
            </Button>
          </div>
        </div>

        {/* RIGHT (REALISTIC PANEL) */}
        <div className="max-w-xl w-full hidden lg:block">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl border shadow-xl p-6">
            <div className="space-y-6">

              {/* HEADER */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                  <span className="font-medium text-gray-800">
                    Recording...
                  </span>
                </div>

                <span className="text-red-600 font-bold text-lg">
                  0:{time.toString().padStart(2, '0')}
                </span>
              </div>

              {/* MINI WAVE */}
              <div className="bg-gray-50 rounded-xl p-4 border">
                <div
                  ref={miniWaveRef}
                  className="flex items-end gap-[2px] h-16"
                >
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-red-500 rounded-full"
                      style={{ height: '10px' }}
                    />
                  ))}
                </div>
              </div>

              {/* QUESTION */}
              <div className="bg-red-50 border border-red-100 rounded-xl p-6 transition-all duration-500">
                <p className="text-sm text-gray-500 mb-2">
                  Current Question
                </p>

                <p className="text-gray-900 text-lg leading-relaxed">
                  {questions[qIndex]}
                </p>

                <div className="flex items-center gap-2 text-red-600 font-medium mt-4">
                  <Mic className="w-4 h-4 animate-pulse" />
                  Speak now...
                </div>
              </div>

              {/* FAKE LIVE SCORE */}
              <div className="grid grid-cols-3 gap-3">
                {['Fluency', 'Vocabulary', 'Grammar'].map((label, i) => (
                  <div key={i} className="border rounded-lg p-3">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-lg font-bold text-red-600">
                      {(6.5 + Math.random()).toFixed(1)}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  )
}