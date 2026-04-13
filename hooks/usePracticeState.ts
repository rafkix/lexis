'use client'

import { useState, useCallback } from 'react'
import type { PracticeSession, Question, RecordingResult } from '@/types/speaking'
import { generateSessionId } from '@/lib/utils-speaking'
import { PRACTICE_QUESTIONS } from '@/lib/constants'

export const usePracticeState = () => {
  const [session, setSession] = useState<PracticeSession | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  const startSession = useCallback(() => {
    const newSession: PracticeSession = {
      id: generateSessionId(),
      date: new Date(),
      questions: PRACTICE_QUESTIONS.slice(0, 3), // Select first 3 for practice
      results: [],
      totalScore: 0,
      completed: false,
    }
    setSession(newSession)
    setCurrentQuestionIndex(0)
  }, [])

  const addResult = useCallback((result: RecordingResult) => {
    setSession(prev => {
      if (!prev) return null
      const newResults = [...prev.results, result]
      const totalScore = newResults.reduce((sum, r) => sum + r.score.overall, 0) / newResults.length
      return { ...prev, results: newResults, totalScore }
    })
  }, [])

  const nextQuestion = useCallback(() => {
    setCurrentQuestionIndex(prev => prev + 1)
  }, [])

  const completeSession = useCallback(() => {
    setSession(prev => prev ? { ...prev, completed: true } : null)
  }, [])

  const currentQuestion = session?.questions[currentQuestionIndex] || null

  return {
    session,
    currentQuestion,
    currentQuestionIndex,
    startSession,
    addResult,
    nextQuestion,
    completeSession,
  }
}
