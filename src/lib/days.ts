import { readJson, writeJson } from './storage'

// Typing time per day. It gives the daily goal and the streak of practice days (REQUIREMENTS M2).
const STORAGE_KEY = 'typen-maar:days'

// Milliseconds of typing per day, by local date (2026-10-24)
export type Days = Record<string, number>

// Five minutes of actual typing is a lesson or two, plus intros and results around it (A)
export const DAY_GOAL_MS = 5 * 60_000

export function loadDays(): Days {
  return readJson<Days>(STORAGE_KEY, {})
}

export function saveDays(value: Days): void {
  writeJson(STORAGE_KEY, value)
}

export function dayOf(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function addTime(days: Days, ms: number, now = new Date()): Days {
  const today = dayOf(now)
  return { ...days, [today]: (days[today] ?? 0) + ms }
}

export function todayMs(days: Days, now = new Date()): number {
  return days[dayOf(now)] ?? 0
}

// Practice days in a row. Missing one day doesn't break the streak, so a busy day doesn't
// undo a good week; missing two days does. Today only counts once she has practised.
export function streak(days: Days, now = new Date()): number {
  let count = 0
  let missed = 0
  const day = new Date(now)
  for (let i = 0; i < 1000; i++) {
    if ((days[dayOf(day)] ?? 0) > 0) {
      count++
      missed = 0
    } else if (i > 0 && ++missed > 1) {
      break
    }
    day.setDate(day.getDate() - 1)
  }
  return count
}
