import { readJson, writeJson } from './storage'

// How fast and how accurately she types each key.
// The daily practice uses it to drill her weakest keys (L6), like keybr and TypingClub do.
const STORAGE_KEY = 'typen-maar:keys'

// One typed character: the time since the key before it, and whether she missed it first
export type KeySample = { key: string; ms: number; miss: boolean }

// Rolling averages, so a key she has improved on stops counting as weak
export type KeyStat = { count: number; ms: number; missRate: number }
export type KeyStats = Record<string, KeyStat>

// How much one new sample moves the average
const WEIGHT = 0.15
// A longer pause is her thinking or looking away, not the key being slow
const MAX_MS = 2500
// Samples a key needs before it can count as weak
const MIN_COUNT = 5

export function loadKeyStats(): KeyStats {
  return readJson<KeyStats>(STORAGE_KEY, {})
}

export function saveKeyStats(value: KeyStats): void {
  writeJson(STORAGE_KEY, value)
}

// Capitals count for their letter, and spaces aren't practised on their own
export function addSamples(stats: KeyStats, samples: KeySample[]): KeyStats {
  const next = { ...stats }
  for (const sample of samples) {
    const key = sample.key.toLowerCase()
    if (key === ' ') continue
    const ms = Math.min(sample.ms, MAX_MS)
    const miss = sample.miss ? 1 : 0
    const old = next[key]
    next[key] = old
      ? {
          count: old.count + 1,
          ms: old.ms + (ms - old.ms) * WEIGHT,
          missRate: old.missRate + (miss - old.missRate) * WEIGHT,
        }
      : { count: 1, ms, missRate: miss }
  }
  return next
}

// The slowest keys, where every miss weighs like a slow key; keys without enough samples don't count
export function weakKeys(stats: KeyStats, keys: string[], count = 3): string[] {
  const score = (key: string) => stats[key].ms * (1 + 3 * stats[key].missRate)
  return keys
    .filter((key) => (stats[key]?.count ?? 0) >= MIN_COUNT)
    .sort((a, b) => score(b) - score(a))
    .slice(0, count)
}
