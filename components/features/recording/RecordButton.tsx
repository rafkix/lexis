'use client'

import { Button } from '@/components/ui/button'
import { Mic, Square } from 'lucide-react'

interface RecordButtonProps {
  isRecording: boolean
  onStart: () => void
  onStop: () => void
  disabled?: boolean
}

export function RecordButton({ isRecording, onStart, onStop, disabled = false }: RecordButtonProps) {
  return (
    <Button
      onClick={isRecording ? onStop : onStart}
      disabled={disabled}
      size="lg"
      className={isRecording ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'}
    >
      {isRecording ? (
        <>
          <Square className="w-5 h-5 mr-2 fill-current" />
          Stop Recording
        </>
      ) : (
        <>
          <Mic className="w-5 h-5 mr-2" />
          Start Recording
        </>
      )}
    </Button>
  )
}
