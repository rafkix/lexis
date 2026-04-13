/**
 * Matnni tozalash: bo'sh joylar, kichik harf va ortiqcha probellar
 */
const normalizeText = (text: string): string => {
  if (!text) return ''
  return text.trim().toLowerCase().replace(/\s+/g, ' ')
}

/**
 * Listening savollarini tekshirish funksiyasi
 */
export function checkListeningAnswer(question: any, userAnswer: string): boolean {
  if (!userAnswer) return false

  // Ma'lumotlar bazasidagi to'g'ri javobni olamiz
  const correctAnswer = question.correctAnswer || question.correct_answer
  if (!correctAnswer) return false

  const cleanUserAnswer = normalizeText(userAnswer)
  const cleanCorrectAnswer = normalizeText(correctAnswer)

  // 1. MULTIPLE CHOICE / MATCHING / MAP (A, B, C formatidagi javoblar)
  if (
    question.type === 'MULTIPLE_CHOICE' ||
    question.type === 'MATCHING' ||
    question.type === 'MAP_DIAGRAM' ||
    question.type === 'GAP_FILL'  ||
    question.type === 'SENTENCE_COMPLETION' ||
    question.type === 'SHORT_ANSWER'
  ) {
    // Agar foydalanuvchi variant matnini tanlagan bo'lsa (masalan: "Yes, of course")
    // uni bazadagi variantlar harfi (label) bilan tekshiramiz
    if (question.options) {
      const selectedOption = question.options.find(
        (opt: any) =>
          normalizeText(opt.label) === cleanUserAnswer ||
          normalizeText(opt.value) === cleanUserAnswer
      )

      // Agar tanlangan variantning harfi to'g'ri javobga mos kelsa
      if (
        selectedOption &&
        normalizeText(selectedOption.label) === cleanCorrectAnswer
      ) {
        return true
      }
    }
    // Agar foydalanuvchi to'g'ridan-to'g'ri harfni yuborgan bo'lsa
    return cleanUserAnswer === cleanCorrectAnswer
  }

  // 2. GAP FILL / SENTENCE COMPLETION / SHORT ANSWER
  // Bir nechta variantlar bo'lishi mumkin: "color/colour" yoki "7.75/7 pounds 75"
  if (
    question.type === 'MULTIPLE_CHOICE' ||
    question.type === 'MATCHING' ||
    question.type === 'MAP_DIAGRAM' ||
    question.type === 'GAP_FILL'  ||
    question.type === 'SENTENCE_COMPLETION' ||
    question.type === 'SHORT_ANSWER'
  ) {
    const possibilities = cleanCorrectAnswer.split(/[\/;]+/).map((item) => item.trim())
    return possibilities.includes(cleanUserAnswer)
  }

  // 3. Standart holat
  return cleanUserAnswer === cleanCorrectAnswer
}
