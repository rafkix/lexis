'use client'

import { useState, useCallback } from 'react'
import type { RecordingState, RecordingResult, SpeakingScore } from '@/types/speaking'
import { generateScores, getSampleTranscript } from '@/lib/utils-speaking'

export const useRecording = () => {
  const [state, setState] = useState<RecordingState>('idle')
  const [duration, setDuration] = useState(0)
  const [result, setResult] = useState<RecordingResult | null>(null)

  const startRecording = useCallback(() => {
    setState('recording')
    setDuration(0)
  }, [])

  const stopRecording = useCallback(async (totalDuration: number) => {
    setState('processing')
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    const score: SpeakingScore = {
      fluency: generateScores(),
      vocabulary: generateScores(0.95),
      grammar: generateScores(0.92),
      pronunciation: generateScores(0.98),
      overall: generateScores(),
    }

    const newResult: RecordingResult = {
      transcript: getSampleTranscript(totalDuration),
      duration: totalDuration,
      score,
      feedback: generateFeedback(score),
      timestamp: new Date(),
    }

    setResult(newResult)
    setState('completed')
  }, [])

  const reset = useCallback(() => {
    setState('idle')
    setDuration(0)
    setResult(null)
  }, [])

  return { state, duration, result, startRecording, stopRecording, reset }
}

const generateFeedback = (score: SpeakingScore): string[] => {
  const feedback: string[] = []

  if (score.fluency < 7) {
    feedback.push('Work on using more linking words and speaking at a natural pace.')
  }
  if (score.vocabulary < 7) {
    feedback.push('Use more varied vocabulary and avoid repetition of words.')
  }
  if (score.grammar < 7) {
    feedback.push('Practice using more complex sentence structures.')
  }
  if (score.pronunciation < 7) {
    feedback.push('Focus on word stress and intonation patterns.')
  }

  if (feedback.length === 0) {
    feedback.push('Excellent performance! Keep practicing to maintain consistency.')
  }

  return feedback
}
