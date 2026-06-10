import type { SpeakingScore } from '@/types/speaking'
import { BAND_SCORE_THRESHOLDS } from './constants'

export const calculateBandScore = (scores: SpeakingScore): number => {
  const average = (scores.fluency + scores.vocabulary + scores.grammar + scores.pronunciation) / 4
  
  for (const [band, threshold] of Object.entries(BAND_SCORE_THRESHOLDS)) {
    if (average >= threshold) {
      return parseInt(band)
    }
  }
  return 4
}

export const getScoreColor = (score: number): string => {
  if (score >= 8) return 'text-green-600'
  if (score >= 6.5) return 'text-blue-600'
  if (score >= 5.5) return 'text-yellow-600'
  return 'text-red-600'
}

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const calculateProgress = (current: number, total: number): number => {
  return Math.round((current / total) * 100)
}

export const getSampleTranscript = (duration: number): string => {
  const transcripts = [
    "Well, I have quite a few hobbies actually. I really enjoy reading, especially science fiction novels. I find it fascinating to explore different worlds and ideas through books. I also love hiking on weekends when the weather is nice. It's a great way to stay active and enjoy nature at the same time.",
    "My favorite place to study is definitely the library near my house. It has a quiet atmosphere which helps me concentrate really well. There are fewer distractions compared to studying at home. The library also has good lighting and comfortable tables, which makes studying for long hours much easier.",
    "I think hobbies are extremely important for people's mental health. They provide a way to relieve stress and take a break from daily responsibilities. Many hobbies also promote physical activity, which is beneficial for overall wellbeing. Additionally, pursuing hobbies can boost self-confidence and provide a sense of accomplishment.",
  ]
  return transcripts[Math.floor(Math.random() * transcripts.length)]
}

export const generateScores = (multiplier: number = 1): number => {
  const base = 6.5 + Math.random() * 2.5
  return Math.round((base * multiplier) * 10) / 10
}
