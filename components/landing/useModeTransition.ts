'use client'

import { useState, useCallback } from 'react'

export type Mode = 'ielts' | 'cefr'

export function useModeTransition(initial: Mode = 'ielts') {
  const [mode, setMode] = useState<Mode>(initial)

  const switchMode = useCallback((next: Mode) => {
    setMode(next)
  }, [])

  return { mode, switchMode }
}
