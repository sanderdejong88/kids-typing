import type { KeySample } from './keystats'
import type { Lesson } from './lessons'
import { accuracy, charactersPerMinute, stars, wordsPerMinute } from './stats'

export type Attempt = {
  text: string
  // Keystrokes, correct ones included
  keystrokes: number
  // Characters typed right the first time
  firstTry: number
  elapsedMs: number
  // Time and misses per key, for finding her weak keys
  samples?: KeySample[]
  // A balloons round: the balloons set the pace, so it counts for accuracy but not for speed
  untimed?: boolean
  // The characters of the timed rounds, when rounds are combined
  timedChars?: number
}

export function resultFor(lesson: Lesson, attempt: Attempt) {
  const apm = charactersPerMinute(attempt.timedChars ?? attempt.text.length, attempt.elapsedMs)
  const acc = accuracy(attempt.firstTry, attempt.text.length)
  return {
    apm,
    wpm: wordsPerMinute(attempt.text.length, attempt.elapsedMs),
    accuracy: acc,
    stars: stars(acc, apm, lesson.bars),
  }
}

// All rounds of a lesson count together, as if she typed one long text.
// Every round counts for accuracy; only the timed rounds count for speed.
export function combine(attempts: Attempt[]): Attempt {
  const timed = attempts.filter((attempt) => !attempt.untimed)
  return {
    // Joined without separators: only characters she actually typed count
    text: attempts.map((attempt) => attempt.text).join(''),
    keystrokes: attempts.reduce((sum, attempt) => sum + attempt.keystrokes, 0),
    firstTry: attempts.reduce((sum, attempt) => sum + attempt.firstTry, 0),
    elapsedMs: timed.reduce((sum, attempt) => sum + attempt.elapsedMs, 0),
    timedChars: timed.reduce((sum, attempt) => sum + attempt.text.length, 0),
  }
}
