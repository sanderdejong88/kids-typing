import { readJson, writeJson } from './storage'

// After a lesson she may say what she thought of it, once per lesson on this device,
// so the question doesn't come back every time she plays it again
const STORAGE_KEY = 'typen-maar:rated'

export const RATINGS = [
  { id: 'leuk', art: 'face-happy', label: 'Leuk' },
  { id: 'gewoon', art: 'face-okay', label: 'Gewoon' },
  { id: 'niet-leuk', art: 'face-sad', label: 'Niet leuk' },
] as const

export type Rating = (typeof RATINGS)[number]['id']

export function loadRated(): string[] {
  return readJson<string[]>(STORAGE_KEY, [])
}

export function saveRated(lessonId: string): void {
  const rated = loadRated()
  if (!rated.includes(lessonId)) writeJson(STORAGE_KEY, [...rated, lessonId])
}

export const isRated = (lessonId: string) => loadRated().includes(lessonId)
