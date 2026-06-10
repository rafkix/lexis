'use client'

import { useState, useCallback } from 'react'
import type { ExamSession, ExamPart, RecordingResult } from '@/types/speaking'
import { generateSessionId } from '@/lib/utils-speaking'

export const useExamState = () => {
  const [session, setSession] = useState<ExamSession | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  const startExam = useCallback(() => {
    const newSession: ExamSession = {
      id: generateSessionId(),
      startTime: new Date(),
      parts: [1, 2, 3],
      currentPart: 1,
      results: new Map(),
      status: 'in-progress',
    }
    setSession(newSession)
    setCurrentQuestionIndex(0)
  }, [])

  const addResult = useCallback((part: ExamPart, result: RecordingResult) => {
    setSession(prev => {
      if (!prev) return null
      const results = new Map(prev.results)
      const partResults = results.get(part) || []
      results.set(part, [...partResults, result])
      return { ...prev, results }
    })
  }, [])

  const moveToPart = useCallback((part: ExamPart) => {
    setSession(prev => (prev ? { ...prev, currentPart: part } : null))
    setCurrentQuestionIndex(0)
  }, [])

  const completeExam = useCallback(() => {
    setSession(prev =>
      prev
        ? {
            ...prev,
            status: 'completed',
            endTime: new Date(),
          }
        : null
    )
  }, [])

  return {
    session,
    currentQuestionIndex,
    startExam,
    addResult,
    moveToPart,
    completeExam,
  }
}
