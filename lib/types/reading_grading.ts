// lib/exams/reading/grading.ts

import { QuestionType } from '@/lib/types/reading' // Yoki o'zingizdagi Question turini import qiling

/**
 * Matnni tozalash funksiyasi:
 * 1. Boshidagi va oxiridagi bo'shliqlarni olib tashlaydi (trim).
 * 2. Katta-kichik harflarni kichraytiradi (lowercase).
 * 3. Ortiqcha bo'shliqlarni (masalan o'rtadagi 2 ta probel) bittaga aylantiradi.
 */
const normalizeText = (text: string): string => {
  if (!text) return ''
  return text.trim().toLowerCase().replace(/\s+/g, ' ') // Ko'p probellarni bitta probelga almashtirish
}

/**
 * Asosiy tekshirish funksiyasi
 */
export function checkAnswer(question: any, userAnswer: string): boolean {
  if (!userAnswer) return false
  if (!question.correct_answer) return false

  const cleanUserAnswer = normalizeText(userAnswer)
  const cleanCorrectAnswer = normalizeText(question.correct_answer)

  // 1. MULTIPLE CHOICE / TRUE-FALSE / MATCHING
  // Bu turlarda javob aniq bitta harf yoki so'z bo'ladi (A, B, TRUE, FALSE)
  if (
    question.type === 'MULTIPLE_CHOICE' ||
    question.type === 'TRUE_FALSE_NOT_GIVEN' ||
    question.type === 'TEXT_MATCH' ||
    question.type === 'HEADINGS_MATCH'
  ) {
    return cleanUserAnswer === cleanCorrectAnswer
  }

  // 2. GAP FILL (Bo'sh joy to'ldirish)
  // Bu yerda bir nechta variant bo'lishi mumkin. Masalan: "color/colour" yoki "bus; train"
  if (question.type === 'GAP_FILL' || question.type === 'GAP_FILL_FILL') {
    // Agar to'g'ri javobda "/" yoki ";" belgisi bo'lsa, bu variantlar borligini bildiradi
    const possibilities = cleanCorrectAnswer.split(/[\/;]+/).map((item) => item.trim())

    // Foydalanuvchi javobi variantlardan biriga to'g'ri kelsa - TRUE
    return possibilities.includes(cleanUserAnswer)
  }

  // 3. Standart tekshirish (qolgan barcha holatlar uchun)
  return cleanUserAnswer === cleanCorrectAnswer
}
