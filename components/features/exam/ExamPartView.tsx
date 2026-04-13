'use client'

import { Card } from '@/components/ui/card'
import { CountdownTimer } from '@/components/features/timer/CountdownTimer'
import { RecordingDisplay } from '@/components/features/recording/RecordingDisplay'
import { RecordButton } from '@/components/features/recording/RecordButton'
import { QuestionPrompt } from '@/components/features/questions/QuestionPrompt'
import type { ExamPart } from '@/types/speaking'

interface ExamPartViewProps {
  part: ExamPart
  duration: number
  timeRemaining: number
  isRecording: boolean
  questionText: string
  onStartRecording: () => void
  onStopRecording: () => void
}

export function ExamPartView({
  part,
  duration,
  timeRemaining,
  isRecording,
  questionText,
  onStartRecording,
  onStopRecording,
}: ExamPartViewProps) {
  const partInfo = {
    1: { title: 'Part 1: Introduction & Interview', totalTime: 300 },
    2: { title: 'Part 2: Long Turn', totalTime: 180 },
    3: { title: 'Part 3: Discussion', totalTime: 420 },
  }

  const info = partInfo[part]
  const warning = timeRemaining <= 60

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">{info.title}</h2>
        <p className="text-muted-foreground">Speaking now...</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuestionPrompt question={{ id: `part${part}`, part, text: questionText, prepTime: 0, speakingTime: info.totalTime, difficulty: 'hard' }} />
        <CountdownTimer seconds={timeRemaining} totalSeconds={info.totalTime} isRunning={isRecording} warning={warning} />
      </div>

      <RecordingDisplay duration={duration} isRecording={isRecording} />

      <div className="flex justify-center">
        <RecordButton isRecording={isRecording} onStart={onStartRecording} onStop={onStopRecording} />
      </div>
    </div>
  )
}
