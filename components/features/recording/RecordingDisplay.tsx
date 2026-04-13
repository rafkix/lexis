'use client'

import { Card } from '@/components/ui/card'
import { formatTime } from '@/lib/utils-speaking'

interface RecordingDisplayProps {
  duration: number
  isRecording: boolean
}

export function RecordingDisplay({ duration, isRecording }: RecordingDisplayProps) {
  return (
    <Card className="p-6 bg-card border border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-destructive animate-pulse' : 'bg-muted'}`} />
          <span className="font-semibold text-foreground">{isRecording ? 'Recording...' : 'Ready'}</span>
        </div>
        <span className="text-lg font-bold text-primary">{formatTime(duration)}</span>
      </div>

      <div className="mt-4 flex items-center justify-center gap-1 h-16">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-gradient-to-t from-primary to-primary/50 rounded-full"
            style={{
              height: isRecording ? `${Math.max(8, Math.sin(i / 5 + Date.now() / 100) * 30 + 35)}px` : '20px',
              opacity: 0.7 + (i % 5) * 0.05,
              transition: 'height 0.1s ease-out',
            }}
          />
        ))}
      </div>
    </Card>
  )
}
