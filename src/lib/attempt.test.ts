import { describe, expect, it } from 'vitest'
import { combine, resultFor } from './attempt'
import { LESSONS } from './lessons'

describe('combine', () => {
  it('adds up the rounds', () => {
    const round = { text: 'fj', keystrokes: 3, firstTry: 1, elapsedMs: 1000 }
    expect(combine([round, round])).toEqual({ text: 'fjfj', keystrokes: 6, firstTry: 2, elapsedMs: 2000, timedChars: 4 })
  })

  it('counts a balloons round for accuracy but not for speed', () => {
    const typed = { text: 'fjfj', keystrokes: 4, firstTry: 4, elapsedMs: 6000 }
    const balloons = { text: 'fjfj', keystrokes: 6, firstTry: 2, elapsedMs: 60_000, untimed: true }
    const result = resultFor(LESSONS[0], combine([typed, balloons]))
    expect(result.apm).toBe(40)
    expect(result.accuracy).toBe(75)
  })
})
