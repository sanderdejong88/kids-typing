// Best stars per lesson, kept in this browser only (REQUIREMENTS T4).
// Storage can be blocked or wiped, so every access is guarded.
const STORAGE_KEY = 'typen-maar:stars'

export type BestStars = Record<string, number>

export function loadStars(): BestStars {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as BestStars
    return renameOldIds(stored)
  } catch {
    return {}
  }
}

// The first version called the home-row lessons home-1 to home-5; they are now lesson-1 to lesson-5.
export function renameOldIds(stored: BestStars): BestStars {
  const renamed: BestStars = {}
  for (const [id, stars] of Object.entries(stored)) {
    renamed[id.replace(/^home-/, 'lesson-')] = stars
  }
  return renamed
}

export function saveStars(best: BestStars): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(best))
  } catch {
    // Progress just isn't remembered this time
  }
}
