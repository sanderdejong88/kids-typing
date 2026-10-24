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

// What a star needs: at least this accuracy (in %) and speed (in apm)
export type Bar = { accuracy: number; apm: number }

const meets = (accuracyPct: number, apm: number, bar: Bar) => accuracyPct >= bar.accuracy && apm >= bar.apm

// Stars reward accuracy first; the third star also needs the speed goal (REQUIREMENTS P1).
// One star is for finishing; `bars` holds what two and three stars need.
export function stars(accuracyPct: number, apm: number, bars: [Bar, Bar]): 1 | 2 | 3 {
  if (meets(accuracyPct, apm, bars[1])) return 3
  if (meets(accuracyPct, apm, bars[0])) return 2
  return 1
}
