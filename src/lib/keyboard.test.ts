import { describe, expect, it } from 'vitest'
import { fingerFor, shiftFor } from './keyboard'

describe('shiftFor', () => {
  it('uses Shift on the other hand', () => {
    expect(shiftFor('F')?.key).toBe('ShiftRight')
    expect(shiftFor('J')?.key).toBe('ShiftLeft')
  })

  it('needs no Shift for small letters', () => {
    expect(shiftFor('f')).toBeUndefined()
  })
})

describe('symbols', () => {
  it('finds the key under a symbol typed with Shift', () => {
    expect(fingerFor('?')).toBe('right-pinky')
    expect(shiftFor('?')?.key).toBe('ShiftLeft')
    expect(shiftFor('!')?.key).toBe('ShiftRight')
    expect(shiftFor('-')).toBeUndefined()
  })
})
