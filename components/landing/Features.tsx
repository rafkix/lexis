'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Zap, TrendingUp, Mic, Brain, BarChart3, Smartphone } from 'lucide-react'

const modes = [
  {
    icon: BookOpen,
    title: 'Practice Mode',
    desc: 'Build confidence step by step',
    gradient: 'from-blue-500/10 to-cyan-500/10',
    border: 'hover:border-blue-500/40',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-600',
    features: [
      'Unlimited speaking practice',
      'Topic-based questions',
      'Instant corrections',
      'Progress tracking'
    ]
  },
  {
    icon: Zap,
    title: 'Real Exam Mode',
    desc: 'Simulate real IELTS pressure',
    gradient: 'from-red-500/10 to-orange-500/10',
    border: 'hover:border-red-500/40',
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-600',
    features: [
      'Full IELTS simulation (Part 1, 2, 3)',
      'Realistic timer & pressure',
      'Complete band score',
      'Detailed performance report'
    ]
  }
]

const additionalFeatures = [
  {
    icon: Mic,
    name: 'Speech Recognition',
    color: 'text-pink-600',
    bg: 'bg-pink-500/10'
  },
  {
    icon: Brain,
    name: 'AI Scoring Engine',
    color: 'text-purple-600',
    bg: 'bg-purple-500/10'
  },
  {
    icon: BarChart3,
    name: 'Progress Analytics',
    color: 'text-green-600',
    bg: 'bg-green-500/10'
  },
  {
    icon: Smartphone,
    name: 'Mobile Optimized',
    color: 'text-orange-600',
    bg: 'bg-orange-500/10'
  }
]

export default function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative">

      <div className="max-w-7xl mx-auto relative z-10">

        {/* HEADER */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Everything You Need to
            <span className="block text-red-600">
              Master Speaking
            </span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built specifically for IELTS & CEFR speaking success with real AI feedback
          </p>
        </div>

        {/* MODES */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">

          {modes.map((mode, idx) => {
            const Icon = mode.icon

            return (
              <Card
                key={idx}
                className={`
                  p-8 border border-border bg-gradient-to-br ${mode.gradient}
                  transition-all duration-300
                  hover:shadow-2xl ${mode.border}
                  hover:-translate-y-1
                `}
              >

                {/* TOP */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-3 rounded-xl ${mode.iconBg}`}>
                    <Icon className={`w-6 h-6 ${mode.iconColor}`} />
                  </div>

                  <Badge variant="secondary">
                    Mode {idx + 1}
                  </Badge>
                </div>

                {/* TITLE */}
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {mode.title}
                </h3>

                <p className="text-muted-foreground mb-6">
                  {mode.desc}
                </p>

                {/* FEATURES */}
                <ul className="space-y-3">
                  {mode.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-foreground"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

              </Card>
            )
          })}
        </div>

        {/* ADDITIONAL FEATURES */}
        <div>

          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-foreground">
              Advanced Capabilities
            </h3>

            <TrendingUp className="w-5 h-5 text-primary" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

            {additionalFeatures.map((feature, idx) => {
              const Icon = feature.icon

              return (
                <Card
                  key={idx}
                  className="
                    p-6 text-center border border-border bg-card
                    hover:shadow-xl hover:-translate-y-1
                    transition-all duration-300
                  "
                >
                  <div className={`mx-auto mb-4 w-14 h-14 flex items-center justify-center rounded-xl ${feature.bg}`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>

                  <p className="font-medium text-foreground text-sm">
                    {feature.name}
                  </p>
                </Card>
              )
            })}

          </div>
        </div>

      </div>
    </section>
  )
}