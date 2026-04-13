'use client'

import { Card } from '@/components/ui/card'
import { getScoreColor } from '@/lib/utils-speaking'

interface ScoreCardProps {
  label: string
  score: number
  max?: number
}

export function ScoreCard({ label, score, max = 9 }: ScoreCardProps) {
  const percentage = (score / max) * 100

  return (
    <Card className="p-4 space-y-2 border border-border bg-card hover:border-primary/50 transition-colors">
      <p className="text-xs text-muted-foreground font-semibold">{label}</p>
      <div className="flex items-baseline gap-1">
        <p className={`text-2xl font-bold ${getScoreColor(score)}`}>{score.toFixed(1)}</p>
        <p className="text-xs text-muted-foreground">/{max}</p>
      </div>
      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
        <div className="bg-primary h-full rounded-full" style={{ width: `${percentage}%` }} />
      </div>
    </Card>
  )
}
