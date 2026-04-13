'use client'

import { Card } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

interface FeedbackItemProps {
  text: string
  isPositive?: boolean
}

export function FeedbackItem({ text, isPositive = false }: FeedbackItemProps) {
  return (
    <Card className="p-4 border border-border bg-card">
      <div className="flex gap-3">
        <AlertCircle className={`w-5 h-5 flex-shrink-0 ${isPositive ? 'text-green-600' : 'text-primary'}`} />
        <p className="text-sm text-foreground">{text}</p>
      </div>
    </Card>
  )
}
