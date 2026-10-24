// Characters per minute ("aanslagen per minuut", apm) is the unit Dutch typing diplomas use.
export function charactersPerMinute(correctChars: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0
  return Math.round(correctChars / (elapsedMs / 60_000))
}

// Words per minute uses the standard definition of 1 word = 5 characters.
export function wordsPerMinute(correctChars: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0
  return Math.round(correctChars / 5 / (elapsedMs / 60_000))
}

export function accuracy(correctKeystrokes: number, totalKeystrokes: number): number {
  if (totalKeystrokes === 0) return 100
  return Math.round((correctKeystrokes / totalKeystrokes) * 100)
}

// Stars reward accuracy first; the third star also needs the speed goal (REQUIREMENTS P1).
export function stars(accuracyPct: number, apm: number, goalApm: number): 1 | 2 | 3 {
  if (accuracyPct >= 95 && apm >= goalApm) return 3
  if (accuracyPct >= 90) return 2
  return 1
}
