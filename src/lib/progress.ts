// Best stars per lesson, kept in this browser only (REQUIREMENTS T4).
// Storage can be blocked or wiped, so every access is guarded.
const STORAGE_KEY = 'typen-maar:stars'

export type BestStars = Record<string, number>

export function loadStars(): BestStars {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as BestStars
  } catch {
    return {}
  }
}

export function saveStars(best: BestStars): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(best))
  } catch {
    // Progress just isn't remembered this time
  }
}
