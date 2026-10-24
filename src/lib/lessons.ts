export type Lesson = {
  id: string
  // Position on the map, starting at 1
  number: number
  island: number
  // A review step practises everything on the island so far
  review: boolean
  newKeys: string[]
  // All keys she may use in this lesson, the new ones included
  keys: string[]
  goalApm: number
}

export type Island = {
  name: string
  steps: string[][]
  goalApm: number
}

const REVIEW: string[] = []

// The key order of REQUIREMENTS C2, with speed goals from P2
export const ISLANDS: Island[] = [
  {
    name: 'De thuisrij',
    steps: [['f', 'j'], ['d', 'k'], ['s', 'l'], ['a', ';'], ['g', 'h'], REVIEW],
    goalApm: 25,
  },
  {
    name: 'De bovenrij',
    steps: [['e', 'i'], ['r', 'u'], ['t', 'o'], REVIEW],
    goalApm: 35,
  },
  {
    name: 'De onderrij',
    steps: [['n'], ['v', 'm'], ['c', ','], ['b', '.'], REVIEW],
    goalApm: 50,
  },
  {
    name: 'De laatste letters',
    steps: [['w', 'p'], ["'"], ['z', 'y'], ['q', 'x', '/'], REVIEW],
    goalApm: 65,
  },
]

function buildLessons(): Lesson[] {
  const lessons: Lesson[] = []
  const known: string[] = []
  const islandStart: number[] = []
  ISLANDS.forEach((island, islandIndex) => {
    islandStart[islandIndex] = known.length
    for (const step of island.steps) {
      const review = step === REVIEW
      known.push(...step)
      const number = lessons.length + 1
      lessons.push({
        id: `lesson-${number}`,
        number,
        island: islandIndex,
        review,
        newKeys: review ? known.slice(islandStart[islandIndex]) : step,
        keys: [...known],
        goalApm: island.goalApm,
      })
    }
  })
  return lessons
}

export const LESSONS = buildLessons()

// A lesson opens once every lesson before it has at least 2 stars (REQUIREMENTS P3)
export function isUnlocked(lesson: Lesson, best: Record<string, number>): boolean {
  return LESSONS.slice(0, lesson.number - 1).every((before) => (best[before.id] ?? 0) >= 2)
}

// Dutch words for 9-year-olds, without accents (decided 2026-10-24).
// Each lesson uses only the words that fit its unlocked keys.
const WORDS = [
  'als', 'dag', 'dak', 'gas', 'had', 'hak', 'hal', 'jas', 'kas', 'lag', 'las', 'gaf', 'laf',
  'alles', 'glas', 'hals', 'slak', 'haas', 'jaja', 'klad', 'fakkel', 'saga', 'lada',
  'de', 'het', 'is', 'ik', 'die', 'dit', 'eet', 'oor', 'ster', 'rode', 'stoel', 'tafel', 'hoed',
  'rug', 'red', 'ruik', 'geit', 'feest', 'liedje', 'koekje', 'tijd', 'rijst', 'ijsje', 'groet',
  'naar', 'maan', 'vis', 'man', 'boom', 'boek', 'bal', 'kind', 'kat', 'hond', 'muis', 'nest',
  'zon', 'zee', 'ijs', 'fiets', 'water', 'school', 'vriend', 'appel', 'banaan', 'nijlpaard',
  'eend', 'zwemmen', 'spelen', 'lachen', 'typen', 'paard', 'pizza', 'konijn', 'zebra', 'pyjama',
  "auto's", "foto's", "oma's", "opa's", "baby's", 'quiz', 'taxi', 'examen',
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
