import { describe, expect, it } from 'vitest'
import { addTime, dayOf, streak, todayMs, week } from './days'

const at = (date: string) => new Date(`${date}T12:00:00`)

describe('streak', () => {
  it('counts practice days in a row', () => {
    const days = { '2026-10-22': 1, '2026-10-23': 1, '2026-10-24': 1 }
    expect(streak(days, at('2026-10-24'))).toBe(3)
  })

  it('keeps the streak until she practises today', () => {
    expect(streak({ '2026-10-23': 1 }, at('2026-10-24'))).toBe(1)
  })

  it('forgives one missed day', () => {
    expect(streak({ '2026-10-21': 1, '2026-10-23': 1 }, at('2026-10-24'))).toBe(2)
  })

  it('breaks after two missed days', () => {
    expect(streak({ '2026-10-20': 1, '2026-10-23': 1 }, at('2026-10-24'))).toBe(1)
    expect(streak({ '2026-10-21': 1 }, at('2026-10-24'))).toBe(0)
  })
})

describe('addTime', () => {
  it('adds up the typing time of today', () => {
    const now = at('2026-10-24')
    const days = addTime(addTime({}, 1000, now), 500, now)
    expect(todayMs(days, now)).toBe(1500)
    expect(dayOf(now)).toBe('2026-10-24')
  })
})

describe('week', () => {
  it('runs from Monday to Sunday with the practised days marked', () => {
    // 2026-10-24 is a Saturday
    const days = week({ '2026-10-19': 1, '2026-10-24': 1, '2026-10-18': 1 }, at('2026-10-24'))
    expect(days.map((day) => day.label)).toEqual(['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'])
    expect(days.map((day) => day.practised)).toEqual([true, false, false, false, false, true, false])
    expect(days.findIndex((day) => day.today)).toBe(5)
    expect(days.map((day) => day.future)).toEqual([false, false, false, false, false, false, true])
  })

  it('starts on the Monday before a Sunday', () => {
    expect(week({ '2026-10-19': 1 }, at('2026-10-25'))[0].practised).toBe(true)
  })
})
