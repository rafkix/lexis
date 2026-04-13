'use client'

import { Card } from '@/components/ui/card'
import { RecordingDisplay } from '@/components/features/recording/RecordingDisplay'
import { RecordButton } from '@/components/features/recording/RecordButton'
import { QuestionPrompt } from '@/components/features/questions/QuestionPrompt'
import type { Question } from '@/types/speaking'

interface PracticeRecordingViewProps {
  question: Question | null
  duration: number
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => void
}

export function PracticeRecordingView({
  question,
  duration,
  isRecording,
  onStartRecording,
  onStopRecording,
}: PracticeRecordingViewProps) {
  if (!question) return null

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Speaking Now</h2>
        <p className="text-muted-foreground">Part {question.part}</p>
      </div>

      <QuestionPrompt question={question} />

      <RecordingDisplay duration={duration} isRecording={isRecording} />

      <div className="flex justify-center">
        <RecordButton isRecording={isRecording} onStart={onStartRecording} onStop={onStopRecording} />
      </div>
    </div>
  )
}
