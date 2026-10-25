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

// The index fingers hold F and J while the other fingers tap their own home key, from the middle outwards.
// With both index fingers held down, typing with two fingers is impossible (anchoring, REQUIREMENTS L3).
export const ANCHORS = ['f', 'j']
export const TAPS = ['d', 'k', 's', 'l', 'a', ';']

export type Anchor = {
  held: string[]
  // How many of the taps are done
  done: number
  // She let go of F or J halfway, so it starts over
  slipped: boolean
}

export const START: Anchor = { held: [], done: 0, slipped: false }

export function anchorDown(state: Anchor, key: string): Anchor {
  if (ANCHORS.includes(key)) return { ...state, held: [...new Set([...state.held, key])], slipped: false }
  if (state.held.length < ANCHORS.length) return state
  return key === TAPS[state.done] ? { ...state, done: state.done + 1 } : state
}

export function anchorUp(state: Anchor, key: string): Anchor {
  if (!ANCHORS.includes(key)) return state
  // Once every tap is done she may let go
  if (state.done === TAPS.length) return state
  return { held: state.held.filter((k) => k !== key), done: 0, slipped: state.done > 0 }
}

export const anchorDone = (state: Anchor) => state.done === TAPS.length
