'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScoreCard } from '@/components/features/feedback/ScoreCard'
import { FeedbackItem } from '@/components/features/feedback/FeedbackItem'
import { calculateBandScore } from '@/lib/utils-speaking'
import type { RecordingResult } from '@/types/speaking'

interface PracticeResultsViewProps {
  result: RecordingResult | null
  onNext: () => void
  onFinish: () => void
  isLastQuestion: boolean
}

export function PracticeResultsView({ result, onNext, onFinish, isLastQuestion }: PracticeResultsViewProps) {
  if (!result) return null

  const bandScore = calculateBandScore(result.score)

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Your Results</h2>
        <p className="text-4xl font-bold text-primary mt-4">{bandScore}.0</p>
        <p className="text-muted-foreground">IELTS Band Score</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ScoreCard label="Fluency" score={result.score.fluency} />
        <ScoreCard label="Vocabulary" score={result.score.vocabulary} />
        <ScoreCard label="Grammar" score={result.score.grammar} />
        <ScoreCard label="Pronunciation" score={result.score.pronunciation} />
      </div>

      <Card className="p-6 border border-border bg-card">
        <h3 className="font-bold text-foreground mb-4">Your Transcript</h3>
        <p className="text-sm text-foreground leading-relaxed italic">{result.transcript}</p>
      </Card>

      <div className="space-y-3">
        <h3 className="font-bold text-foreground">Areas to Improve</h3>
        {result.feedback.map((item, idx) => (
          <FeedbackItem key={idx} text={item} />
        ))}
      </div>

      <div className="flex gap-3 justify-center">
        {!isLastQuestion && (
          <Button onClick={onNext} variant="outline">
            Next Question
          </Button>
        )}
        <Button onClick={onFinish} className="bg-primary hover:bg-primary/90">
          {isLastQuestion ? 'Finish Practice' : 'Save & Continue'}
        </Button>
      </div>
    </div>
  )
}
