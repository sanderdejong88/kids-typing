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

// All rounds of a lesson count together, as if she typed one long text
export function combine(attempts: Attempt[]): Attempt {
  return {
    // Joined without separators: only characters she actually typed count
    text: attempts.map((attempt) => attempt.text).join(''),
    keystrokes: attempts.reduce((sum, attempt) => sum + attempt.keystrokes, 0),
    firstTry: attempts.reduce((sum, attempt) => sum + attempt.firstTry, 0),
    elapsedMs: attempts.reduce((sum, attempt) => sum + attempt.elapsedMs, 0),
  }
}
