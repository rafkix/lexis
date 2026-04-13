'use client'

import { Card } from '@/components/ui/card'
import { formatTime } from '@/lib/utils-speaking'

interface CountdownTimerProps {
  seconds: number
  totalSeconds: number
  isRunning?: boolean
  warning?: boolean
}

export function CountdownTimer({ seconds, totalSeconds, isRunning = false, warning = false }: CountdownTimerProps) {
  const percentage = (seconds / totalSeconds) * 100

  return (
    <Card className={`p-6 border ${warning ? 'border-destructive' : 'border-border'} bg-card`}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-muted-foreground">Time Remaining</p>
        {isRunning && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
      </div>

      <div className="text-center mb-4">
        <p className={`text-4xl font-bold ${warning ? 'text-destructive' : 'text-primary'}`}>{formatTime(seconds)}</p>
      </div>

      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${warning ? 'bg-destructive' : 'bg-primary'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </Card>
  )
}
