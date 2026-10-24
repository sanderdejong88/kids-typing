import { describe, expect, it } from 'vitest'
import { LESSONS, makeDrill, wordsFor } from './lessons'

describe('LESSONS', () => {
  it('adds keys step by step', () => {
    expect(LESSONS[0].keys).toEqual(['f', 'j'])
    expect(LESSONS[2].keys).toEqual(['f', 'j', 'd', 'k', 's', 'l'])
  })
})

describe('makeDrill', () => {
  it('only uses keys from the lesson', () => {
    for (const lesson of LESSONS) {
      const drill = makeDrill(lesson)
      for (const char of drill.replaceAll(' ', '')) expect(lesson.keys).toContain(char)
    }
  })

  it('makes the requested number of groups', () => {
    expect(makeDrill(LESSONS[0], 7).split(' ')).toHaveLength(7)
  })
})

describe('wordsFor', () => {
  it('keeps words that fit the unlocked keys', () => {
    expect(wordsFor(['f', 'j', 'd', 'k', 's', 'l', 'a'])).toContain('als')
    expect(wordsFor(['f', 'j', 'd', 'k', 's', 'l', 'a'])).not.toContain('dag')
  })
})
