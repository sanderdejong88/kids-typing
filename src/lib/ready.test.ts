import { describe, expect, it } from 'vitest'
import { START, TAPS, anchorDone, anchorDown, anchorUp, readyToday, type Anchor } from './ready'

const press = (state: Anchor, keys: string[]) => keys.reduce(anchorDown, state)

describe('readyToday', () => {
  it('is only true on the same day', () => {
    expect(readyToday('2026-10-25', new Date('2026-10-25T09:00:00'))).toBe(true)
    expect(readyToday('2026-10-24', new Date('2026-10-25T09:00:00'))).toBe(false)
    expect(readyToday(undefined)).toBe(false)
  })
})

describe('anchor check', () => {
  it('is done after holding F and J and tapping the other home keys in order', () => {
    expect(anchorDone(press(START, ['f', 'j', ...TAPS]))).toBe(true)
  })

  it('ignores taps until both index fingers are down', () => {
    expect(press(START, ['f', 'd']).done).toBe(0)
  })

  it('ignores a wrong key without starting over', () => {
    expect(press(START, ['f', 'j', 'd', 'g', 'k']).done).toBe(2)
  })

  it('starts over when she lets go of F or J halfway', () => {
    const state = anchorUp(press(START, ['f', 'j', 'd', 'k']), 'j')
    expect(state).toEqual({ held: ['f'], done: 0, slipped: true })
    expect(anchorDown(state, 'j').slipped).toBe(false)
  })

  it('lets her go once every tap is done', () => {
    expect(anchorDone(anchorUp(press(START, ['f', 'j', ...TAPS]), 'f'))).toBe(true)
  })
})
