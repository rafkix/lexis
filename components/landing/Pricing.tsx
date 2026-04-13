'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2 } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    description: 'Start practicing with limited access',
    price: '0',
    currency: 'UZS',
    features: [
      '1 full mock test',
      '10 practice questions',
      'Basic AI feedback',
      'Limited daily usage'
    ],
    cta: 'Start Free',
    highlighted: false,
    color: 'gray'
  },
  {
    name: 'Pro',
    description: 'For consistent improvement',
    price: '9,990',
    oldPrice: '14,990',
    discount: '-33%',
    currency: 'UZS',
    period: '/month',
    features: [
      '3 full mock tests',
      '30 practice questions',
      'Detailed AI feedback',
      'Band score analysis',
      'Progress tracking'
    ],
    cta: 'Upgrade to Pro',
    highlighted: true,
    color: 'red'
  },
  {
    name: 'Premium',
    description: 'Maximum results & full access',
    price: '17,780',
    oldPrice: '24,990',
    discount: '-28%',
    currency: 'UZS',
    period: '/month',
    features: [
      '10 full mock tests',
      'Unlimited practice questions',
      'Advanced AI feedback',
      'Full performance reports',
      'Priority processing'
    ],
    cta: 'Go Premium',
    highlighted: false,
    color: 'blue'
  }
]

export default function Pricing() {
  return (
    <section className="relative py-24 px-4 overflow-hidden" id="pricing">

      {/* 🔴 GRID BG */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </span>
          </h2>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your IELTS speaking preparation
          </p>
        </div>

        {/* PLANS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {plans.map((plan, idx) => (
            <Card
              key={idx}
              className={`
                relative p-8 rounded-2xl border transition-all duration-300
                backdrop-blur-xl bg-white/60
                hover:scale-[1.02] hover:shadow-2xl
                ${plan.highlighted ? 'border-red-500 shadow-2xl scale-105' : 'border-gray-200'}
              `}
            >

              {/* 🔥 DISCOUNT */}
              {plan.discount && (
                <Badge className="absolute top-4 left-4 bg-red-600 text-white">
                  {plan.discount}
                </Badge>
              )}

              {/* 🔥 POPULAR */}
              {plan.highlighted && (
                <Badge className="absolute top-4 right-4 bg-black text-white">
                  Most Popular
                </Badge>
              )}

              {/* TITLE */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h3>

              <p className="text-gray-500 mb-6 text-sm">
                {plan.description}
              </p>

              {/* 💰 PRICE */}
              <div className="mb-6">

                {/* OLD PRICE */}
                {plan.oldPrice && (
                  <div className="text-gray-400 line-through text-sm">
                    {plan.oldPrice} {plan.currency}
                  </div>
                )}

                <div className="flex items-end gap-2">
                  <span
                    className={`
                      text-4xl font-extrabold
                      ${plan.color === 'red' && 'text-red-600'}
                      ${plan.color === 'blue' && 'text-blue-600'}
                      ${plan.color === 'gray' && 'text-gray-900'}
                    `}
                  >
                    {plan.price}
                  </span>

                  <span className="text-gray-500 text-sm mb-1">
                    {plan.currency}
                  </span>

                  {plan.period && (
                    <span className="text-gray-400 text-sm mb-1">
                      {plan.period}
                    </span>
                  )}
                </div>
              </div>

              {/* CTA */}
              <Button
                className={`
                  w-full mb-8 py-5 text-lg font-semibold
                  ${plan.color === 'red' && 'bg-red-600 hover:bg-red-700 text-white'}
                  ${plan.color === 'blue' && 'bg-blue-600 hover:bg-blue-700 text-white'}
                  ${plan.color === 'gray' && 'bg-gray-900 hover:bg-black text-white'}
                `}
              >
                {plan.cta}
              </Button>

              {/* FEATURES */}
              <div className="space-y-4">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

            </Card>
          ))}

        </div>

        {/* FOOTNOTE */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Limited-time discounts available for early users
          </p>
        </div>

      </div>
    </section>
  )
}