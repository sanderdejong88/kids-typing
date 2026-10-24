// Words per minute uses the standard definition of 1 word = 5 characters.
export function wordsPerMinute(correctChars: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0
  return Math.round(correctChars / 5 / (elapsedMs / 60_000))
}

export function accuracy(correctKeystrokes: number, totalKeystrokes: number): number {
  if (totalKeystrokes === 0) return 100
  return Math.round((correctKeystrokes / totalKeystrokes) * 100)
}
