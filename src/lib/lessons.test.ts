import { describe, expect, it } from 'vitest'
import { ISLANDS, LESSONS, ROUNDS, isUnlocked, makeDrill, makeRounds, wordsFor } from './lessons'

describe('LESSONS', () => {
  it('adds keys step by step', () => {
    expect(LESSONS[0].keys).toEqual(['f', 'j'])
    expect(LESSONS[2].keys).toEqual(['f', 'j', 'd', 'k', 's', 'l'])
  })

  it('has one lesson per island step', () => {
    const steps = ISLANDS.reduce((sum, island) => sum + island.steps.length, 0)
    expect(LESSONS).toHaveLength(steps)
  })

  it('reviews all keys of the island', () => {
    const review = LESSONS.find((lesson) => lesson.review && lesson.island === 1)
    expect(review?.newKeys).toEqual(['e', 'i', 'r', 'u', 't', 'o'])
  })

  it('ends up with the whole alphabet', () => {
    const last = LESSONS[LESSONS.length - 1]
    for (const letter of 'abcdefghijklmnopqrstuvwxyz') expect(last.keys).toContain(letter)
  })
})

describe('isUnlocked', () => {
  it('opens the first lesson right away', () => {
    expect(isUnlocked(LESSONS[0], {})).toBe(true)
  })

  it('needs two stars on the lesson before', () => {
    expect(isUnlocked(LESSONS[1], { [LESSONS[0].id]: 1 })).toBe(false)
    expect(isUnlocked(LESSONS[1], { [LESSONS[0].id]: 2 })).toBe(true)
  })

  it('stays locked when an earlier lesson still needs work', () => {
    expect(isUnlocked(LESSONS[2], { [LESSONS[0].id]: 1, [LESSONS[1].id]: 3 })).toBe(false)
  })
})

describe('makeDrill', () => {
  it('only uses keys from the lesson', () => {
    for (const lesson of LESSONS) {
      for (const drill of makeRounds(lesson)) {
        for (const char of drill.replaceAll(' ', '')) expect(lesson.keys).toContain(char)
      }
    }
  })

  it('uses only the new keys in a warm-up round', () => {
    const lesson = LESSONS[2]
    for (const char of makeDrill(lesson, 'new').replaceAll(' ', '')) expect(lesson.newKeys).toContain(char)
  })

  it('makes the requested number of groups', () => {
    expect(makeDrill(LESSONS[0], 'mix', 7).split(' ')).toHaveLength(7)
  })
})

describe('makeRounds', () => {
  it('makes one line per round', () => {
    expect(makeRounds(LESSONS[0])).toHaveLength(ROUNDS.length)
  })
})

describe('capitals island', () => {
  const capitalLessons = LESSONS.filter((lesson) => lesson.island === 4)

  it('ends up with every capital', () => {
    const last = capitalLessons[capitalLessons.length - 1]
    for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') expect(last.keys).toContain(letter)
  })

  it('starts every group and word with a capital', () => {
    for (const lesson of capitalLessons) {
      for (const drill of makeRounds(lesson)) {
        for (const part of drill.split(' ')) expect(part[0]).toMatch(/[A-Z]/)
      }
    }
  })

  it('writes IJ as two capitals', () => {
    const last = capitalLessons[capitalLessons.length - 1]
    expect(wordsFor(last.keys)).toContain('IJsje')
    expect(wordsFor(last.keys)).not.toContain('Ijsje')
  })
})

describe('sentences and numbers', () => {
  const onIsland = (name: string) => LESSONS.filter((lesson) => ISLANDS[lesson.island].name === name)

  it('types whole sentences on the sentence islands', () => {
    for (const lesson of [...onIsland('Zinnetjes'), ...onIsland('Leestekens')]) {
      for (const round of makeRounds(lesson)) expect(round).toMatch(/^[A-Z].*[.?!]$/)
    }
  })

  it('warms up with the new punctuation mark', () => {
    const question = onIsland('Leestekens')[0]
    expect(makeRounds(question)[0]).toContain('?')
  })

  it('mixes digits only with number phrases', () => {
    for (const lesson of onIsland('Cijfers')) {
      for (const round of makeRounds(lesson)) {
        for (const part of round.split(' ')) expect(part).toMatch(/^([0-9]+|[a-z]+)$/)
      }
    }
  })
})

describe('wordsFor', () => {
  it('keeps words that fit the unlocked keys', () => {
    expect(wordsFor(['f', 'j', 'd', 'k', 's', 'l', 'a'])).toContain('als')
    expect(wordsFor(['f', 'j', 'd', 'k', 's', 'l', 'a'])).not.toContain('dag')
  })
})
