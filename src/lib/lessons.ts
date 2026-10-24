import { isCapital } from './keyboard'

// Letter groups and words, whole sentences, or numbers
export type Practice = 'letters' | 'sentences' | 'numbers'

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
  // What the map shows under the lesson
  label: string
  // What the intro title calls the lesson, such as 'nieuwe letters'
  topic: string
  // Explains what is new on this island, if anything besides keys
  tip?: string
  practice: Practice
  // Sentences that fit this step best; the warm-up rounds use only these
  focus: string[]
  goalApm: number
}

export type Island = {
  name: string
  topic: string
  tip?: string
  practice?: Practice
  steps: string[][]
  // Map labels for steps with too many keys to list
  labels?: string[]
  // Sentences per step, for an island that teaches sentences rather than keys
  sentences?: string[][]
  goalApm: number
}

const REVIEW: string[] = []

// Sentences without accents, for 9-year-olds (decided 2026-10-24).
// Each lesson uses only the sentences that fit its keys.
const SHORT = [
  'Ik lees.', 'De kat slaapt.', 'Wij zwemmen.', 'Het regent.', 'Ik eet soep.', 'De zon schijnt.',
  'Oma bakt koekjes.', 'Daan fietst snel.', 'De hond blaft.', 'Lotte zingt.', 'Papa kookt.', 'Het is koud.',
]
const LONG = [
  'Ik eet een ijsje.', 'De vis zwemt in de zee.', 'Mijn fiets is rood.', 'Wij spelen op school.',
  'Het nijlpaard is heel groot.', 'Sara heeft een konijn.', 'De vogel zit in de boom.',
  'Morgen gaan we naar oma.', 'Ik typ met tien vingers.', 'Bram leest een boek.',
]
const COMMA = [
  'Ja, dat is goed.', 'Kom, we gaan spelen.', 'Eerst eten, dan spelen.', 'Hoi, ik ben Mila.',
  'Nee, de kat slaapt nog.', 'Ik heb appels, peren en bananen.', 'De zon schijnt, dus we gaan naar buiten.',
]
const PUNCTUATION = [
  'Waar is de kat?', 'Hoe heet jij?', 'Wil je spelen?', 'Is het al pauze?', 'Wat eet je graag?',
  'Kijk uit!', 'Wat leuk!', 'Goed zo!', 'Hoera, vakantie!', 'Pas op, een slak!',
  'Let op: de vloer is nat.', 'Mijn tip: oefen elke dag.', 'Een zebra is zwart-wit.',
  'Wij wonen in Noord-Holland.', 'Wie heeft de bal? Ik!', 'Raad eens: wat is dit?',
]
const SENTENCES = [...SHORT, ...LONG, ...COMMA, ...PUNCTUATION]

// Short phrases with numbers
const NUMBERS = [
  '4 poten', '7 dagen', '47 appels', '3 katten', '8 armen', '2 handen', '9 ballen', '10 vingers',
  '100 jaar', '12 maanden', '24 uur', '60 minuten', '365 dagen', '5 eenden', '6 eieren', '30 kinderen',
  '11 spelers', '78 toetsen', '29 dagen', '1 zon',
]

// The key order of REQUIREMENTS C2, with speed goals from P2
export const ISLANDS: Island[] = [
  {
    name: 'De thuisrij',
    topic: 'nieuwe letters',
    steps: [['f', 'j'], ['d', 'k'], ['s', 'l'], ['a', ';'], ['g', 'h'], REVIEW],
    goalApm: 25,
  },
  {
    name: 'De bovenrij',
    topic: 'nieuwe letters',
    steps: [['e', 'i'], ['r', 'u'], ['t', 'o'], REVIEW],
    goalApm: 35,
  },
  {
    name: 'De onderrij',
    topic: 'nieuwe letters',
    steps: [['n'], ['v', 'm'], ['c', ','], ['b', '.'], REVIEW],
    goalApm: 50,
  },
  {
    name: 'De laatste letters',
    topic: 'nieuwe letters',
    steps: [['w', 'p'], ["'"], ['z', 'y'], ['q', 'x', '/'], REVIEW],
    goalApm: 65,
  },
  {
    // Every letter is known by now; the new skill is Shift with the other hand
    name: 'Hoofdletters',
    topic: 'hoofdletters',
    tip: 'Een hoofdletter maak je met shift. Houd shift vast met de pink van je andere hand.',
    steps: [
      ['F', 'J'],
      ['D', 'K', 'S', 'L', 'A', 'G', 'H'],
      ['E', 'I', 'R', 'U', 'T', 'O', 'W', 'P', 'Y', 'Q'],
      ['N', 'V', 'M', 'C', 'B', 'Z', 'X'],
      REVIEW,
    ],
    labels: ['⇧ F J', '⇧ thuisrij', '⇧ bovenrij', '⇧ onderrij'],
    goalApm: 55,
  },
  {
    // No new keys: everything comes together in real sentences
    name: 'Zinnetjes',
    topic: 'zinnetjes',
    tip: 'Nu typ je hele zinnetjes. Begin met een hoofdletter en eindig met een punt.',
    practice: 'sentences',
    steps: [[], [], [], REVIEW],
    labels: ['korte zinnen', 'langere zinnen', 'met een komma'],
    sentences: [SHORT, LONG, COMMA],
    goalApm: 60,
  },
  {
    name: 'Leestekens',
    topic: 'leestekens',
    tip: 'Een vraagteken, uitroepteken en dubbele punt typ je met shift. Houd shift vast met de pink van je andere hand.',
    practice: 'sentences',
    steps: [['?'], ['!'], [':', '-'], REVIEW],
    goalApm: 55,
  },
  {
    // The order of REQUIREMENTS C2: from the index fingers outwards
    name: 'Cijfers',
    topic: 'nieuwe cijfers',
    tip: 'De cijfers staan op de bovenste rij. Strek je vinger en ga daarna terug naar de thuisrij.',
    practice: 'numbers',
    steps: [['4', '7'], ['3', '8'], ['2', '9'], ['1', '0'], ['5', '6'], REVIEW],
    goalApm: 45,
  },
]

function buildLessons(): Lesson[] {
  const lessons: Lesson[] = []
  const known: string[] = []
  const islandStart: number[] = []
  ISLANDS.forEach((island, islandIndex) => {
    islandStart[islandIndex] = known.length
    island.steps.forEach((step, stepIndex) => {
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
        label: review ? 'herhaling' : (island.labels?.[stepIndex] ?? step.map((key) => key.toUpperCase()).join(' ')),
        topic: island.topic,
        tip: island.tip,
        practice: island.practice ?? 'letters',
        focus: island.sentences?.[stepIndex] ?? [],
        goalApm: island.goalApm,
      })
    })
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

// Names and places for the capitals island
const NAMES = [
  'Anna', 'Daan', 'Sara', 'Tim', 'Lotte', 'Fleur', 'Jesse', 'Sem', 'Noor', 'Bram', 'Eva', 'Mila',
  'Luuk', 'Kees', 'Pip', 'Gijs', 'Vera', 'Wim', 'Cas', 'Ruben', 'Olaf', 'Yara', 'Quinten', 'Xander',
  'Zwolle', 'Utrecht', 'Holland', 'Nijmegen', 'Amsterdam', 'IJsland',
]

// IJ at the start of a word gets two capitals (REQUIREMENTS C4)
const capitalize = (word: string) =>
  word.startsWith('ij') ? 'IJ' + word.slice(2) : word[0].toUpperCase() + word.slice(1)

export function wordsFor(keys: string[]): string[] {
  return [...WORDS, ...WORDS.map(capitalize), ...NAMES].filter((word) => fits(word, keys))
}

function pick<T>(items: T[], random: () => number): T {
  return items[Math.floor(random() * items.length)]
}

export type RoundKind = 'new' | 'mix' | 'words'

// Every lesson is several short rounds, so the new keys get plenty of repetition
// before they are mixed with known keys and words (REQUIREMENTS L2, L4).
export const ROUNDS: RoundKind[] = ['new', 'new', 'mix', 'words']

export function makeRounds(lesson: Lesson, random = Math.random): string[] {
  // A review lesson has no new keys of its own, so it skips the warm-up on new keys
  const kinds = lesson.review ? ROUNDS.map((kind) => (kind === 'new' ? 'mix' : kind)) : ROUNDS
  const make = lesson.practice === 'sentences' ? makeSentences : makeDrill
  return kinds.map((kind) => make(lesson, kind, 8, random))
}

const fits = (text: string, keys: string[]) => [...text].every((char) => char === ' ' || keys.includes(char))

export function sentencesFor(keys: string[]): string[] {
  return SENTENCES.filter((sentence) => fits(sentence, keys))
}

// A few whole sentences, about as long as a line of letter groups. The warm-up rounds
// take sentences from this step, or with the new keys; later rounds take any that fit.
export function makeSentences(lesson: Lesson, kind: RoundKind = 'mix', _groups = 8, random = Math.random): string {
  const all = sentencesFor(lesson.keys)
  const withNew = all.filter((sentence) => lesson.newKeys.some((key) => sentence.includes(key)))
  const focus = lesson.focus.length > 0 ? lesson.focus : withNew.length > 0 ? withNew : all
  const parts: string[] = []
  let length = 0
  while (length < 40) {
    const pool = kind === 'new' || (kind === 'mix' && parts.length % 2 === 0) ? focus : all
    const sentence = pick(pool.filter((s) => !parts.includes(s)), random) ?? pick(pool, random)
    parts.push(sentence)
    length += sentence.length + 1
  }
  return parts.join(' ')
}

// One line of short letter groups and, depending on the kind, real words.
export function makeDrill(lesson: Lesson, kind: RoundKind = 'mix', groups = 8, random = Math.random): string {
  // On the capitals island every group and word starts with a capital, like a name
  const capitals = lesson.keys.some(isCapital)
  const numbers = lesson.practice === 'numbers'
  const words = numbers
    ? NUMBERS.filter((phrase) => fits(phrase, lesson.keys))
    : wordsFor(lesson.keys).filter((word) => !capitals || isCapital(word[0]))
  // Number lessons practise groups of digits only
  const keys = numbers ? lesson.keys.filter((key) => /[0-9]/.test(key)) : lesson.keys
  const parts: string[] = []
  for (let i = 0; i < groups; i++) {
    const wantWord = kind === 'words' ? i % 2 === 1 || words.length >= 6 : kind === 'mix' && i % 3 === 2
    if (wantWord && words.length >= 3) {
      parts.push(pick(words, random))
      continue
    }
    const pool = kind === 'new' || i % 2 === 0 ? lesson.newKeys : keys
    const length = 2 + Math.floor(random() * 3)
    let group = ''
    if (capitals && !numbers) {
      // A capital, then small letters: the new ones in a warm-up, any letter otherwise
      group = pick(pool.filter(isCapital), random)
      const small = kind === 'new' ? lesson.newKeys.map((key) => key.toLowerCase()) : lesson.keys.filter((key) => /[a-z]/.test(key))
      for (let j = 1; j < length; j++) group += pick(small, random)
    } else {
      for (let j = 0; j < length; j++) group += pick(pool, random)
    }
    parts.push(group)
  }
  return parts.join(' ')
}
