'use client'

import { Card } from '@/components/ui/card'
import { Users, MessageCircle, Heart, BookOpen } from 'lucide-react'

const problems = [
  {
    icon: Users,
    title: 'No Real Speaking Partner',
    description:
      'It’s difficult to find qualified speaking partners for consistent and structured practice',
  },
  {
    icon: MessageCircle,
    title: 'No Instant Feedback',
    description:
      'Without immediate correction, mistakes become habits and slow down improvement',
  },
  {
    icon: Heart,
    title: 'Fear of Real Exam',
    description:
      'Lack of real simulation creates anxiety and lowers performance under pressure',
  },
  {
    icon: BookOpen,
    title: 'No Structured Practice',
    description:
      'Random speaking doesn’t match IELTS format or scoring criteria',
  },
]

export default function Problems() {
  return (
    <section
      id="problems"
      className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6 leading-tight">
            Why Students Struggle
            <span className="block text-red-600">With Speaking</span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Most learners don’t fail because of grammar — they fail because of
            poor speaking habits, lack of feedback, and no real exam simulation.
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {problems.map((problem, idx) => {
            const Icon = problem.icon

            return (
              <Card
                key={idx}
                className="
                  group relative p-7 rounded-2xl border border-border
                  bg-card/80 backdrop-blur-xl
                  transition-all duration-300
                  hover:-translate-y-1 hover:shadow-2xl hover:border-red-300
                "
              >
                {/* glow on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-red-500/10 to-transparent" />

                <div className="relative flex gap-5">
                  {/* ICON */}
                  <div className="flex-shrink-0">
                    <div
                      className="
                        flex items-center justify-center 
                        h-14 w-14 rounded-xl
                        bg-red-50
                        group-hover:bg-red-100
                        transition
                      "
                    >
                      <Icon className="h-7 w-7 text-red-600 group-hover:scale-110 transition-transform" />
                    </div>
                  </div>

                  {/* TEXT */}
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {problem.title}
                    </h3>

                    <p className="text-muted-foreground leading-relaxed">
                      {problem.description}
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