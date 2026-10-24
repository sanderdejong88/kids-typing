export type Lesson = {
  id: string
  title: string
  newKeys: string[]
  // All keys she may use in this lesson, the new ones included
  keys: string[]
  goalApm: number
}

// Level 1, the home row, in the order of REQUIREMENTS C2
const HOME_ROW_STEPS = [
  ['f', 'j'],
  ['d', 'k'],
  ['s', 'l'],
  ['a', ';'],
  ['g', 'h'],
]

export const LESSONS: Lesson[] = HOME_ROW_STEPS.map((newKeys, i) => ({
  id: `home-${i + 1}`,
  title: `Les ${i + 1}`,
  newKeys,
  keys: HOME_ROW_STEPS.slice(0, i + 1).flat(),
  goalApm: 25,
}))

// Dutch words that only use home-row letters, without accents (decided 2026-10-24)
const WORDS = [
  'als', 'dag', 'dak', 'gas', 'had', 'hak', 'hal', 'jas', 'kas', 'lag', 'las', 'gaf', 'laf',
  'alles', 'glas', 'hals', 'slak', 'haas', 'jaja', 'klad', 'fakkel', 'saga', 'lada',
]

export function wordsFor(keys: string[]): string[] {
  return WORDS.filter((word) => [...word].every((char) => keys.includes(char)))
}

function pick<T>(items: T[], random: () => number): T {
  return items[Math.floor(random() * items.length)]
}

// A drill line of short letter groups that leans on the new keys, plus real words once there are enough.
export function makeDrill(lesson: Lesson, groups = 10, random = Math.random): string {
  const words = wordsFor(lesson.keys)
  const parts: string[] = []
  for (let i = 0; i < groups; i++) {
    if (words.length >= 3 && i % 3 === 2) {
      parts.push(pick(words, random))
      continue
    }
    const pool = i % 2 === 0 ? lesson.newKeys : lesson.keys
    const length = 2 + Math.floor(random() * 3)
    let group = ''
    for (let j = 0; j < length; j++) group += pick(pool, random)
    parts.push(group)
  }
  return parts.join(' ')
}
