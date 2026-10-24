import { describe, expect, it } from 'vitest'
import { BALLOONS, FISH, ISLANDS, LESSONS, ROUNDS, dailyLesson, isUnlocked, makeBalloons, makeDrill, makeFish, makeRounds, isGame, roundKinds, wordsFor } from './lessons'

describe('LESSONS', () => {
  it('adds keys step by step', () => {
    expect(LESSONS[0].keys).toEqual(['f', 'j'])
    expect(LESSONS[2].keys).toEqual(['f', 'j', 'd', 'k', 's', 'l'])
  })

  it('has one lesson per island step', () => {
    const steps = ISLANDS.reduce((sum, island) => sum + island.steps.length, 0)
    expect(LESSONS).toHaveLength(steps)
  })

  it('tests all keys of the island', () => {
    const test = LESSONS.find((lesson) => lesson.kind === 'test' && lesson.island === 1)
    expect(test?.newKeys).toEqual(['e', 'i', 'r', 'u', 't', 'o'])
  })

  it('wants some speed in an island test', () => {
    const test = LESSONS.find((lesson) => lesson.kind === 'test')!
    expect(test.bars[0].apm).toBeGreaterThan(0)
    expect(makeRounds(test).join('').length).toBeGreaterThan(makeRounds(LESSONS[0]).join('').length)
  })

  it('ends with the speed island and the diploma exam', () => {
    const speed = LESSONS.filter((lesson) => lesson.kind === 'speed')
    expect(speed.map((lesson) => lesson.goalApm)).toEqual([75, 100, 120])
    const exam = LESSONS[LESSONS.length - 1]
    expect(exam.kind).toBe('exam')
    expect(exam.bars[0]).toEqual({ accuracy: 95, apm: 120 })
    expect(exam.certificate).toBe(120)
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
  it('ends every lesson with a game round, but not the tests', () => {
    for (const lesson of LESSONS) {
      expect(isGame(roundKinds(lesson).at(-1)!)).toBe(lesson.kind === 'lesson')
    }
  })

  it('takes turns between the fish, the balloons and the ball', () => {
    expect(roundKinds(LESSONS[0]).at(-1)).toBe('fish')
    expect(roundKinds(LESSONS[1]).at(-1)).toBe('balloons')
    expect(roundKinds(LESSONS[2]).at(-1)).toBe('ball')
  })

  it('keeps the fish to the letter islands', () => {
    for (const lesson of LESSONS.filter((l) => l.practice !== 'letters')) {
      expect(roundKinds(lesson)).not.toContain('fish')
    }
  })

  it('gives every fish one letter she knows', () => {
    for (const lesson of LESSONS.filter((l) => l.kind === 'lesson' && l.practice === 'letters')) {
      const letters = makeFish(lesson)
      expect(letters).toHaveLength(FISH)
      expect([...letters].every((char) => lesson.keys.includes(char))).toBe(true)
    }
  })

  it('floats at least the balloons of a round, with keys she knows', () => {
    for (const lesson of LESSONS.filter((l) => l.kind === 'lesson')) {
      const words = makeBalloons(lesson).split(' ')
      expect(words.length).toBeGreaterThanOrEqual(BALLOONS)
      for (const char of words.join('')) expect(lesson.keys).toContain(char)
    }
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

describe('dailyLesson', () => {
  it('waits until she has played a lesson', () => {
    expect(dailyLesson({}, () => [])).toBeUndefined()
  })

  it('drills her weak keys with every letter she knows', () => {
    const daily = dailyLesson({ [LESSONS[2].id]: 2 }, () => ['k', 's'])!
    expect(daily.newKeys).toEqual(['k', 's'])
    expect(daily.keys).toEqual(['f', 'j', 'd', 'k', 's', 'l'])
    for (const round of makeRounds(daily)) {
      for (const char of round.replaceAll(' ', '')) expect(daily.keys).toContain(char)
    }
  })

  it('takes the newest keys without enough data', () => {
    expect(dailyLesson({ [LESSONS[2].id]: 2 }, () => [])!.newKeys).toEqual(['s', 'l'])
  })

  it('leaves out capitals, numbers and new punctuation', () => {
    const all = Object.fromEntries(LESSONS.map((lesson) => [lesson.id, 3]))
    const daily = dailyLesson(all, () => [])!
    expect(daily.keys.join('')).toMatch(/^[a-z;,.'/]+$/)
  })
})
