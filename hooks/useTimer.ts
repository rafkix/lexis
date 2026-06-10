'use client'

import { useState, useEffect, useCallback } from 'react'

export const useTimer = (initialSeconds: number) => {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          setIsRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning])

  const start = useCallback(() => setIsRunning(true), [])
  const pause = useCallback(() => setIsRunning(false), [])
  const resume = useCallback(() => setIsRunning(true), [])
  const reset = useCallback(() => {
    setIsRunning(false)
    setSeconds(initialSeconds)
  }, [initialSeconds])

  return { seconds, isRunning, start, pause, resume, reset }
}
