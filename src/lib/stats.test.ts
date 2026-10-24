import { describe, expect, it } from 'vitest'
import { accuracy, charactersPerMinute, stars, wordsPerMinute, type Bar } from './stats'

describe('charactersPerMinute', () => {
  it('counts every correct character, spaces included', () => {
    expect(charactersPerMinute(120, 60_000)).toBe(120)
  })

  it('returns 0 when no time has passed', () => {
    expect(charactersPerMinute(10, 0)).toBe(0)
  })
})

describe('stars', () => {
  const lesson: [Bar, Bar] = [
    { accuracy: 90, apm: 0 },
    { accuracy: 95, apm: 25 },
  ]

  it('gives one star for finishing', () => {
    expect(stars(80, 100, lesson)).toBe(1)
  })

  it('gives two stars from 90% accuracy', () => {
    expect(stars(90, 10, lesson)).toBe(2)
  })

  it('needs 95% and the speed goal for three stars', () => {
    expect(stars(95, 25, lesson)).toBe(3)
    expect(stars(98, 24, lesson)).toBe(2)
  })

  it('can ask for speed for two stars too', () => {
    const speed: [Bar, Bar] = [
      { accuracy: 90, apm: 75 },
      { accuracy: 95, apm: 75 },
    ]
    expect(stars(99, 70, speed)).toBe(1)
    expect(stars(92, 80, speed)).toBe(2)
  })
})

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
