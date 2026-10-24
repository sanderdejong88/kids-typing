import { describe, expect, it } from 'vitest'
import { addSamples, weakKeys, type KeySample } from './keystats'

const typed = (key: string, ms: number, miss = false, times = 6): KeySample[] =>
  Array.from({ length: times }, () => ({ key, ms, miss }))

describe('weakKeys', () => {
  it('puts the slowest keys first', () => {
    const stats = addSamples({}, [...typed('f', 300), ...typed('k', 900), ...typed('d', 500)])
    expect(weakKeys(stats, ['f', 'd', 'k'], 2)).toEqual(['k', 'd'])
  })

  it('counts misses as weak too', () => {
    const stats = addSamples({}, [...typed('f', 400, true), ...typed('k', 600)])
    expect(weakKeys(stats, ['f', 'k'], 1)).toEqual(['f'])
  })

  it('needs a few samples per key', () => {
    const stats = addSamples({}, typed('k', 900, false, 2))
    expect(weakKeys(stats, ['k'])).toEqual([])
  })

  it('counts a capital for its letter and skips spaces', () => {
    const stats = addSamples({}, [{ key: 'F', ms: 400, miss: false }, { key: ' ', ms: 100, miss: false }])
    expect(Object.keys(stats)).toEqual(['f'])
  })

  it('ignores long pauses', () => {
    const stats = addSamples({}, [{ key: 'f', ms: 20_000, miss: false }])
    expect(stats.f.ms).toBe(2500)
  })
})
