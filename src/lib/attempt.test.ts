import { describe, expect, it } from 'vitest'
import { combine } from './attempt'

describe('combine', () => {
  it('adds up the rounds', () => {
    const round = { text: 'fj', keystrokes: 3, firstTry: 1, elapsedMs: 1000 }
    expect(combine([round, round])).toEqual({ text: 'fjfj', keystrokes: 6, firstTry: 2, elapsedMs: 2000 })
  })
})
