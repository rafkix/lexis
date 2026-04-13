'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Zap, Timer } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function FinalCTA() {
  const router = useRouter()
  const { data: session } = useSession()

  const [timeLeft, setTimeLeft] = useState(600) // 10 min fake urgency

  const handleGetStarted = () => {
    router.push(session ? '/practice' : '/auth/login')
  }

  // ⏱ countdown (conversion trick)
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <section className="relative py-24 px-4 overflow-hidden">

      <div className="relative z-10 max-w-3xl mx-auto text-center">

        {/* 🔥 BADGE */}
        <Badge className="mb-6 bg-red-50 text-red-600 border-red-200">
          <Zap className="w-3 h-3 mr-1" />
          Limited Access
        </Badge>

        {/* 🔥 HEADLINE */}
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
            Your Band Score Won’t Improve
          </span>
          <br />
          Without Real Practice
        </h2>

        {/* 🔥 SUBTEXT */}
        <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
          Most students stay stuck at Band 5–6 because they don’t simulate real speaking exams.
          Start practicing with AI and improve faster.
        </p>

        {/* ⏱ TIMER */}
        <div className="flex items-center justify-center gap-2 text-red-600 font-semibold mb-8">
          <Timer className="w-4 h-4" />
          Offer ends in {minutes}:{seconds.toString().padStart(2, '0')}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">

          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-red-600 hover:bg-red-700 text-white px-10 py-6 text-lg shadow-xl"
          >
            Start Improving Now
          </Button>

          <Button
            onClick={() => router.push('/pricing')}
            size="lg"
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 px-10 py-6 text-lg"
          >
            View Pricing
          </Button>

        </div>

        {/* TRUST */}
        <p className="text-sm text-gray-500 mt-8">
          No credit card required • Start in 10 seconds
        </p>

      </div>
    </section>
  )
}