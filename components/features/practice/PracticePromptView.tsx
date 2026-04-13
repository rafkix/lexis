'use client'

import { Button } from '@/components/ui/button'
import { QuestionPrompt } from '@/components/features/questions/QuestionPrompt'
import type { Question } from '@/types/speaking'

interface PracticePromptViewProps {
  question: Question | null
  onStart: () => void
}

export function PracticePromptView({ question, onStart }: PracticePromptViewProps) {
  if (!question) return null

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Practice Question</h2>
        <p className="text-muted-foreground">Part {question.part}</p>
      </div>

      <QuestionPrompt question={question} showPrepTime />

      <div className="flex justify-center">
        <Button onClick={onStart} size="lg" className="bg-primary hover:bg-primary/90">
          Start Speaking
        </Button>
      </div>
    </div>
  )
}
