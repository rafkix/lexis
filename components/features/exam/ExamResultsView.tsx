'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScoreCard } from '@/components/features/feedback/ScoreCard'
import { FeedbackItem } from '@/components/features/feedback/FeedbackItem'
import { calculateBandScore } from '@/lib/utils-speaking'
import type { RecordingResult, ExamPart } from '@/types/speaking'

interface ExamResultsViewProps {
  results: Map<ExamPart, RecordingResult[]>
  onFinish: () => void
}

export function ExamResultsView({ results, onFinish }: ExamResultsViewProps) {
  const allResults = Array.from(results.values()).flat()
  const overallScore =
    allResults.length > 0
      ? allResults.reduce((sum, r) => sum + calculateBandScore(r.score), 0) / allResults.length
      : 0

  const avgScores = {
    fluency: allResults.reduce((sum, r) => sum + r.score.fluency, 0) / allResults.length || 0,
    vocabulary: allResults.reduce((sum, r) => sum + r.score.vocabulary, 0) / allResults.length || 0,
    grammar: allResults.reduce((sum, r) => sum + r.score.grammar, 0) / allResults.length || 0,
    pronunciation: allResults.reduce((sum, r) => sum + r.score.pronunciation, 0) / allResults.length || 0,
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Exam Complete</h2>
        <p className="text-5xl font-bold text-primary mt-4">{overallScore.toFixed(1)}</p>
        <p className="text-muted-foreground">Overall IELTS Band Score</p>
      </div>

      <Card className="p-6 border border-border bg-gradient-to-br from-primary/10 to-primary/5">
        <h3 className="font-bold text-foreground mb-4">Performance Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ScoreCard label="Fluency & Coherence" score={avgScores.fluency} />
          <ScoreCard label="Lexical Range" score={avgScores.vocabulary} />
          <ScoreCard label="Grammar" score={avgScores.grammar} />
          <ScoreCard label="Pronunciation" score={avgScores.pronunciation} />
        </div>
      </Card>

      {[1, 2, 3].map(part => {
        const partResults = results.get(part as ExamPart) || []
        if (partResults.length === 0) return null

        return (
          <Card key={part} className="p-6 border border-border bg-card space-y-4">
            <h3 className="font-bold text-foreground">Part {part} Feedback</h3>
            {partResults[0].feedback.map((item, idx) => (
              <FeedbackItem key={idx} text={item} />
            ))}
          </Card>
        )
      })}

      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={onFinish}>
          Review More
        </Button>
        <Button onClick={onFinish} className="bg-primary hover:bg-primary/90">
          Complete Exam
        </Button>
      </div>
    </div>
  )
}
