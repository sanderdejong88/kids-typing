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

// The streak as it was before today: where the count starts on the streak screen
export function streakBefore(days: Days, now = new Date()): number {
  return streak({ ...days, [dayOf(now)]: 0 }, now)
}

// She practised before, but the streak had broken: Snuf welcomes her back instead of a lost count
export function cameBack(days: Days, now = new Date()): boolean {
  const today = dayOf(now)
  return streakBefore(days, now) === 0 && Object.entries(days).some(([day, ms]) => day < today && ms > 0)
}

// Streaks worth an extra party (REQUIREMENTS M3)
export const MILESTONES = [3, 7, 14, 30, 50, 100]

// The day the streak screen was last shown, so it comes once a day, after the first lesson
const SHOWN_KEY = 'typen-maar:streak-shown'

export function streakShownToday(now = new Date()): boolean {
  return readJson<string | null>(SHOWN_KEY, null) === dayOf(now)
}

export function saveStreakShown(now = new Date()): void {
  writeJson(SHOWN_KEY, dayOf(now))
}

export function forgetStreakShown(): void {
  writeJson(SHOWN_KEY, null)
}

export type WeekDay = { label: string; practised: boolean; today: boolean; future: boolean }

const LABELS = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo']

// This week from Monday to Sunday, for the flames on the home screen
export function week(days: Days, now = new Date()): WeekDay[] {
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  return LABELS.map((label, i) => {
    const day = new Date(monday)
    day.setDate(monday.getDate() + i)
    return {
      label,
      practised: (days[dayOf(day)] ?? 0) > 0,
      today: dayOf(day) === dayOf(now),
      future: day > now && dayOf(day) !== dayOf(now),
    }
  })
}
