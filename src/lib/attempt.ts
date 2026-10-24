import type { Lesson } from './lessons'
import { accuracy, charactersPerMinute, stars, wordsPerMinute } from './stats'

export type Attempt = {
  text: string
  // Keystrokes, correct ones included
  keystrokes: number
  // Characters typed right the first time
  firstTry: number
  elapsedMs: number
}

export function resultFor(lesson: Lesson, attempt: Attempt) {
  const apm = charactersPerMinute(attempt.text.length, attempt.elapsedMs)
  const acc = accuracy(attempt.firstTry, attempt.text.length)
  return {
    apm,
    wpm: wordsPerMinute(attempt.text.length, attempt.elapsedMs),
    accuracy: acc,
    stars: stars(acc, apm, lesson.goalApm),
  }
}
