import { dayOf } from './days'
import { readJson, writeJson } from './storage'

// The day she last sat ready (posture and fingers on the home row), so the check comes once a day (REQUIREMENTS G4)
const STORAGE_KEY = 'typen-maar:ready'

export function loadReadyDay(): string | undefined {
  return readJson<string | null>(STORAGE_KEY, null) ?? undefined
}

export function saveReadyDay(now = new Date()): void {
  writeJson(STORAGE_KEY, dayOf(now))
}

// After wiping the progress she gets the full explanation again
export function forgetReady(): void {
  writeJson(STORAGE_KEY, null)
}

export function readyToday(day: string | undefined, now = new Date()): boolean {
  return day === dayOf(now)
}

// Both index fingers press F and J at the same time, so they find the home row by the bumps.
// Pressing two keys far apart at once needs two hands (anchoring, REQUIREMENTS L3).
export const ANCHORS = ['f', 'j']

export type Anchor = { held: string[]; done: boolean }

export const START: Anchor = { held: [], done: false }

export function anchorDown(state: Anchor, key: string): Anchor {
  if (state.done || !ANCHORS.includes(key)) return state
  const held = [...new Set([...state.held, key])]
  return { held, done: held.length === ANCHORS.length }
}

export function anchorUp(state: Anchor, key: string): Anchor {
  // Once both were down together she may let go
  if (state.done) return state
  return { ...state, held: state.held.filter((k) => k !== key) }
}

export const anchorDone = (state: Anchor) => state.done
