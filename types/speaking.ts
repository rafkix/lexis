export type RecordingState = 'idle' | 'recording' | 'processing' | 'completed'
export type ExamPart = 1 | 2 | 3
export type DifficultyLevel = 'easy' | 'medium' | 'hard'

export interface SpeakingScore {
  fluency: number
  vocabulary: number
  grammar: number
  pronunciation: number
  overall: number
}

export interface Question {
  id: string
  part: ExamPart
  text: string
  prepTime: number
  speakingTime: number
  difficulty: DifficultyLevel
}

export interface RecordingResult {
  transcript: string
  duration: number
  score: SpeakingScore
  feedback: string[]
  timestamp: Date
}

export interface PracticeSession {
  id: string
  date: Date
  questions: Question[]
  results: RecordingResult[]
  totalScore: number
  completed: boolean
}

export interface ExamSession {
  id: string
  startTime: Date
  endTime?: Date
  parts: ExamPart[]
  currentPart: ExamPart
  results: Map<ExamPart, RecordingResult[]>
  status: 'in-progress' | 'completed'
}
