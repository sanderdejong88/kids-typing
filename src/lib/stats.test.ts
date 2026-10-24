import { describe, expect, it } from 'vitest'
import { accuracy, wordsPerMinute } from './stats'

describe('wordsPerMinute', () => {
  it('counts 5 characters as one word', () => {
    expect(wordsPerMinute(100, 60_000)).toBe(20)
  })

  it('returns 0 when no time has passed', () => {
    expect(wordsPerMinute(10, 0)).toBe(0)
  })
})

describe('accuracy', () => {
  it('is a percentage of correct keystrokes', () => {
    expect(accuracy(19, 20)).toBe(95)
  })

  it('is 100 before any key is pressed', () => {
    expect(accuracy(0, 0)).toBe(100)
  })
})
