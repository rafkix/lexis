'use client'

import { Card } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Choose Your Exam',
    description: 'Select IELTS or CEFR format based on your goals'
  },
  {
    number: '02',
    title: 'Start Speaking',
    description: 'Answer naturally like a real exam session'
  },
  {
    number: '03',
    title: 'Get Instant Feedback',
    description: 'Receive band score and detailed AI analysis instantly'
  }
]

export default function HowItWorks() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 block text-red-600">
            How It Works
          </h2>

          <p className="text-xl text-muted-foreground">
            Simple process. Real results.
          </p>
        </div>

        {/* FLOW LINE */}
        <div className="hidden md:block absolute left-0 right-0 top-[52%] h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        {/* STEPS */}
        <div className="grid md:grid-cols-3 gap-10 relative">

          {steps.map((step, idx) => (
            <div key={idx} className="relative group">

              <Card
                className="
                  p-8 bg-white/90 backdrop-blur-xl border border-border
                  transition-all duration-300
                  hover:shadow-2xl hover:-translate-y-2
                "
              >

                {/* STEP NUMBER (BIG BACKGROUND) */}
                <div className="absolute top-6 right-6 text-6xl font-extrabold text-primary/10">
                  {step.number}
                </div>

                {/* CONTENT */}
                <div className="relative z-10">

                  <div className="mb-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>

                </div>
              </Card>

              {/* ARROW */}
              {idx < steps.length - 1 && (
                <div className="
                  hidden md:flex absolute top-1/2 right-[-20px] 
                  -translate-y-1/2 z-20
                ">
                  <ArrowRight className="w-6 h-6 text-primary opacity-70 group-hover:translate-x-1 transition" />
                </div>
              )}

            </div>
          ))}

        </div>

      </div>
    </section>
  )
}