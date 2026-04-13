import type { Question } from '@/types/speaking'

export const EXAM_TIMING = {
  PART_1_DURATION: 300, // 5 minutes
  PART_2_PREP_TIME: 60, // 1 minute
  PART_2_DURATION: 120, // 2 minutes
  PART_3_DURATION: 420, // 7 minutes
} as const

export const PRACTICE_QUESTIONS: Question[] = [
  {
    id: 'part1-1',
    part: 1,
    text: 'Tell me about a hobby you enjoy and explain why you find it interesting.',
    prepTime: 0,
    speakingTime: 120,
    difficulty: 'easy',
  },
  {
    id: 'part1-2',
    part: 1,
    text: 'Describe your favorite place to study and explain how it helps you concentrate.',
    prepTime: 0,
    speakingTime: 120,
    difficulty: 'easy',
  },
  {
    id: 'part2-1',
    part: 2,
    text: 'Describe a skill you have learned recently. You should say: what the skill is, how you learned it, how often you use it, and explain how you felt when you first learned it.',
    prepTime: 60,
    speakingTime: 120,
    difficulty: 'medium',
  },
  {
    id: 'part2-2',
    part: 2,
    text: 'Talk about a memorable journey you took. You should say: where you went, who you traveled with, how you traveled, and explain why it was memorable.',
    prepTime: 60,
    speakingTime: 120,
    difficulty: 'medium',
  },
  {
    id: 'part3-1',
    part: 3,
    text: 'How do hobbies help people relax and maintain mental health?',
    prepTime: 0,
    speakingTime: 420,
    difficulty: 'hard',
  },
]

export const SCORE_FEEDBACK = {
  FLUENCY: [
    'Work on using more linking words like "moreover", "furthermore", and "consequently"',
    'Practice speaking at a natural pace without long pauses',
    'Try to develop ideas more fully with examples and explanations',
    'Use more complex sentence structures to show proficiency',
  ],
  VOCABULARY: [
    'Use more subject-specific and academic vocabulary',
    'Avoid repeating the same words; use synonyms instead',
    'Practice using collocations and phrases naturally',
    'Try to use some less common but appropriate vocabulary',
  ],
  GRAMMAR: [
    'Work on using a wider range of grammatical structures',
    'Practice using passive voice more frequently',
    'Avoid run-on sentences; use proper sentence boundaries',
    'Use more subordinate clauses to show grammatical range',
  ],
  PRONUNCIATION: [
    'Focus on word stress, especially in multi-syllable words',
    'Practice intonation to sound more natural',
    'Work on connected speech and linking between words',
    'Pay attention to individual sounds that are difficult for you',
  ],
} as const

export const BAND_SCORE_THRESHOLDS = {
  5: 15,
  6: 20,
  7: 25,
  8: 30,
  9: 36,
} as const
