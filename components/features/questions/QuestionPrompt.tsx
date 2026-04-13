'use client'

import { Card } from '@/components/ui/card'
import type { Question } from '@/types/speaking'

interface QuestionPromptProps {
  question: Question | null
  showPrepTime?: boolean
}

export function QuestionPrompt({ question, showPrepTime = false }: QuestionPromptProps) {
  if (!question) {
    return (
      <Card className="p-8 text-center border border-border bg-card">
        <p className="text-muted-foreground">No question loaded</p>
      </Card>
    )
  }

  return (
    <Card className="p-8 border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-muted-foreground">Part {question.part}</p>
          {showPrepTime && question.prepTime > 0 && (
            <p className="text-xs text-primary font-medium">Prep time: {question.prepTime}s</p>
          )}
        </div>
        <p className="text-lg text-foreground leading-relaxed">{question.text}</p>
      </div>
    </Card>
  )
}
