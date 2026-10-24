import { describe, expect, it } from 'vitest'
import { accuracy, charactersPerMinute, stars, wordsPerMinute } from './stats'

describe('charactersPerMinute', () => {
  it('counts every correct character, spaces included', () => {
    expect(charactersPerMinute(120, 60_000)).toBe(120)
  })

  it('returns 0 when no time has passed', () => {
    expect(charactersPerMinute(10, 0)).toBe(0)
  })
})

describe('stars', () => {
  it('gives one star for finishing', () => {
    expect(stars(80, 100, 25)).toBe(1)
  })

  it('gives two stars from 90% accuracy', () => {
    expect(stars(90, 10, 25)).toBe(2)
  })

  it('needs 95% and the speed goal for three stars', () => {
    expect(stars(95, 25, 25)).toBe(3)
    expect(stars(98, 24, 25)).toBe(2)
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
