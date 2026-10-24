import { describe, expect, it } from 'vitest'
import { renameOldIds } from './progress'

describe('renameOldIds', () => {
  it('keeps stars earned under the old lesson ids', () => {
    expect(renameOldIds({ 'home-1': 3, 'lesson-2': 2 })).toEqual({ 'lesson-1': 3, 'lesson-2': 2 })
  })
})
