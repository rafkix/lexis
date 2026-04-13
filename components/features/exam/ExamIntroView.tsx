'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ExamIntroViewProps {
  onStart: () => void
}

export function ExamIntroView({ onStart }: ExamIntroViewProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">IELTS Speaking Exam</h2>
        <p className="text-muted-foreground">Full simulation with all 3 parts</p>
      </div>

      <Card className="p-8 border border-border bg-card space-y-6">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground">Exam Structure</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-4">
              <div className="text-2xl font-bold text-primary">Part 1</div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Introduction & Interview</p>
                <p className="text-sm text-muted-foreground">4-5 minutes. Answer general questions about yourself.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="text-2xl font-bold text-primary">Part 2</div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Long Turn</p>
                <p className="text-sm text-muted-foreground">3-4 minutes. Speak about a topic for 2 minutes.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="text-2xl font-bold text-primary">Part 3</div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Discussion</p>
                <p className="text-sm text-muted-foreground">4-5 minutes. Discuss abstract ideas related to Part 2.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-foreground">
            <span className="font-semibold">Total Time:</span> 11-14 minutes. This is a full simulation of the actual IELTS speaking test.
          </p>
        </div>
      </Card>

      <div className="flex justify-center">
        <Button onClick={onStart} size="lg" className="bg-primary hover:bg-primary/90">
          Start Exam
        </Button>
      </div>
    </div>
  )
}
