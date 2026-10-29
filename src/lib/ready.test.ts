import { describe, expect, it } from 'vitest'
import { START, anchorDone, anchorDown, anchorUp, readyToday, type Anchor } from './ready'

const press = (state: Anchor, keys: string[]) => keys.reduce(anchorDown, state)

describe('readyToday', () => {
  it('is only true on the same day', () => {
    expect(readyToday('2026-10-25', new Date('2026-10-25T09:00:00'))).toBe(true)
    expect(readyToday('2026-10-24', new Date('2026-10-25T09:00:00'))).toBe(false)
    expect(readyToday(undefined)).toBe(false)
  })
})

describe('anchor check', () => {
  it('is done once F and J are down together', () => {
    expect(anchorDone(press(START, ['f', 'j']))).toBe(true)
    expect(anchorDone(press(START, ['j', 'f']))).toBe(true)
  })

  it('ignores other keys', () => {
    expect(press(START, ['d', 'k', 'f']).held).toEqual(['f'])
  })

  it('is not done when she lets go of F before pressing J', () => {
    const state = anchorDown(anchorUp(press(START, ['f']), 'f'), 'j')
    expect(anchorDone(state)).toBe(false)
  })

  it('stays done after she lets go', () => {
    expect(anchorDone(anchorUp(press(START, ['f', 'j']), 'f'))).toBe(true)
  })
})
