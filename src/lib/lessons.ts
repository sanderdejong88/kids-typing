import { isCapital } from './keyboard'
import type { Bar } from './stats'

// Letter groups and words, whole sentences, or numbers
export type Practice = 'letters' | 'sentences' | 'numbers'

// A lesson teaches keys; an island test closes an island (REQUIREMENTS L8); a speed lesson
// and the exam train for the diploma (D1, D2); the daily practice drills her weak keys (L6)
export type LessonKind = 'lesson' | 'test' | 'speed' | 'exam' | 'daily'

export type Lesson = {
  id: string
  // Position on the map, starting at 1 (0 for the daily practice, which is not on the map)
  number: number
  island: number
  kind: LessonKind
  // What the results card calls it, such as 'Les 5' or 'Eilandtoets'
  name: string
  // An island test practises every key of the island; the daily practice her weak keys
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
  // What two and three stars need (REQUIREMENTS P1)
  bars: [Bar, Bar]
  // The certificate a good enough result earns (REQUIREMENTS D3), in apm
  certificate?: number
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
  // A speed goal per step, for the island that trains for the diploma
  goals?: number[]
  // Certificates per step, in apm
  certificates?: (number | undefined)[]
}

// The last step of an island: a test of every key on it
const TEST: string[] = []
// The diploma exam
const EXAM: string[] = []

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
    steps: [['f', 'j'], ['d', 'k'], ['s', 'l'], ['a', ';'], ['g', 'h'], TEST],
    goalApm: 25,
  },
  {
    name: 'De bovenrij',
    topic: 'nieuwe letters',
    steps: [['e', 'i'], ['r', 'u'], ['t', 'o'], TEST],
    goalApm: 35,
  },
  {
    name: 'De onderrij',
    topic: 'nieuwe letters',
    steps: [['n'], ['v', 'm'], ['c', ','], ['b', '.'], TEST],
    goalApm: 50,
  },
  {
    name: 'De laatste letters',
    topic: 'nieuwe letters',
    steps: [['w', 'p'], ["'"], ['z', 'y'], ['q', 'x', '/'], TEST],
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
      TEST,
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
    steps: [[], [], [], TEST],
    labels: ['korte zinnen', 'langere zinnen', 'met een komma'],
    sentences: [SHORT, LONG, COMMA],
    goalApm: 60,
  },
  {
    name: 'Leestekens',
    topic: 'leestekens',
    tip: 'Een vraagteken, uitroepteken en dubbele punt typ je met shift. Houd shift vast met de pink van je andere hand.',
    practice: 'sentences',
    steps: [['?'], ['!'], [':', '-'], TEST],
    goalApm: 55,
  },
  {
    // The order of REQUIREMENTS C2: from the index fingers outwards
    name: 'Cijfers',
    topic: 'nieuwe cijfers',
    tip: 'De cijfers staan op de bovenste rij. Strek je vinger en ga daarna terug naar de thuisrij.',
    practice: 'numbers',
    steps: [['4', '7'], ['3', '8'], ['2', '9'], ['1', '0'], ['5', '6'], TEST],
    goalApm: 45,
  },
  {
    // No new keys: speed goals from the first milestone to the diploma norm (REQUIREMENTS 1, D1–D3)
    name: 'Snelheid',
    topic: 'sneller typen',
    tip: 'Je kent alle toetsen! Nu word je steeds sneller. Eerst goed, dan snel: kijk niet naar je handen.',
    practice: 'sentences',
    steps: [[], [], [], EXAM],
    labels: ['75 apm', '100 apm', '120 apm', 'diploma'],
    goals: [75, 100, 120, 120],
    certificates: [75, 100, undefined, 120],
    goalApm: 120,
  },
]

// What a star needs per kind of lesson. Accuracy always comes first; an island test also wants
// some speed, a speed lesson its goal, and the exam the diploma norm of 120 apm at 95% (decided 2026-10-24).
function barsFor(kind: LessonKind, goal: number): [Bar, Bar] {
  switch (kind) {
    case 'test':
      return [{ accuracy: 90, apm: Math.round(goal * 0.7) }, { accuracy: 95, apm: goal }]
    case 'speed':
      return [{ accuracy: 90, apm: goal }, { accuracy: 95, apm: goal }]
    case 'exam':
      return [{ accuracy: 95, apm: goal }, { accuracy: 95, apm: 150 }]
    default:
      return [{ accuracy: 90, apm: 0 }, { accuracy: 95, apm: goal }]
  }
}

function kindOf(island: Island, step: string[]): LessonKind {
  if (step === TEST) return 'test'
  if (step === EXAM) return 'exam'
  return island.goals ? 'speed' : 'lesson'
}

// What Nijl says before a test, a speed lesson or the exam: what she needs to go on
function tipFor(kind: LessonKind, island: Island, bars: [Bar, Bar]): string | undefined {
  switch (kind) {
    case 'test':
      return `De eilandtoets! Typ ${bars[0].apm} aanslagen per minuut met ${bars[0].accuracy}% goed, dan mag je naar het volgende eiland.`
    case 'speed':
      return `${island.tip} Haal ${bars[0].apm} aanslagen per minuut met ${bars[0].accuracy}% goed.`
    case 'exam':
      return `Het examen! Haal ${bars[0].apm} aanslagen per minuut met ${bars[0].accuracy}% goed, dan krijg je je typediploma.`
    default:
      return island.tip
  }
}

const NAMES_OF: Record<LessonKind, string> = {
  lesson: 'Les',
  test: 'Eilandtoets',
  speed: 'Snelheid',
  exam: 'Diploma-examen',
  daily: 'Oefen vandaag',
}

function buildLessons(): Lesson[] {
  const lessons: Lesson[] = []
  const known: string[] = []
  const islandStart: number[] = []
  ISLANDS.forEach((island, islandIndex) => {
    islandStart[islandIndex] = known.length
    island.steps.forEach((step, stepIndex) => {
      const kind = kindOf(island, step)
      const test = kind === 'test'
      known.push(...step)
      const number = lessons.length + 1
      const goalApm = island.goals?.[stepIndex] ?? island.goalApm
      const bars = barsFor(kind, goalApm)
      lessons.push({
        id: `lesson-${number}`,
        number,
        island: islandIndex,
        kind,
        name: kind === 'lesson' ? `Les ${number}` : NAMES_OF[kind],
        newKeys: test ? known.slice(islandStart[islandIndex]) : step,
        keys: [...known],
        label: test ? 'eilandtoets' : (island.labels?.[stepIndex] ?? step.map((key) => key.toUpperCase()).join(' ')),
        topic: island.topic,
        tip: tipFor(kind, island, bars),
        practice: island.practice ?? 'letters',
        focus: island.sentences?.[stepIndex] ?? [],
        goalApm,
        bars,
        certificate: island.certificates?.[stepIndex],
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

// The furthest lesson she has played, if any
export function furthestPlayed(best: Record<string, number>): Lesson | undefined {
  return LESSONS.findLast((lesson) => (best[lesson.id] ?? 0) > 0)
}

// The daily practice drills letters and the punctuation of the letter islands; capitals,
// numbers and sentences come back in the lessons themselves
const isLetterKey = (key: string) => /^[a-z;,.'/]$/.test(key)

// A practice lesson on her weak keys (REQUIREMENTS L6), with everything she has learned so far.
// `weakest` picks the weak keys out of the ones she knows; without enough data it takes the newest.
export function dailyLesson(best: Record<string, number>, weakest: (keys: string[]) => string[]): Lesson | undefined {
  const furthest = furthestPlayed(best)
  if (!furthest) return undefined
  const keys = furthest.keys.filter(isLetterKey)
  const weak = weakest(keys)
  const newKeys = weak.length >= 2 ? weak : keys.slice(-2)
  // Random letter groups are slower than words, so the goal stops at the letter islands' level
  const goalApm = Math.min(furthest.goalApm, 65)
  return {
    id: 'daily',
    number: 0,
    island: furthest.island,
    kind: 'daily',
    name: NAMES_OF.daily,
    newKeys,
    keys,
    label: 'oefen vandaag',
    topic: 'je lastige letters',
    tip: 'Deze letters zijn nog een beetje lastig. Oefen ze rustig, dan worden ze vanzelf makkelijk!',
    practice: 'letters',
    focus: [],
    goalApm,
    bars: barsFor('daily', goalApm),
  }
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

// A balloons round floats its words up on balloons (REQUIREMENTS L7, M5); in a ball round
// Snuf keeps a ball up while she types them; in a fish round Snuf catches one letter per fish
export type RoundKind = 'new' | 'mix' | 'words' | 'balloons' | 'ball' | 'fish'

// Every lesson is several short rounds, so the new keys get plenty of repetition
// before they are mixed with known keys and words (REQUIREMENTS L2, L4). The words come
// last, in a game, so not every round is the same (feedback 2026-10-24).
export const ROUNDS: RoundKind[] = ['new', 'new', 'mix', 'balloons']

// How many balloons a balloons round has
export const BALLOONS = 8
// How many fish a fish round has
export const FISH = 20

// An island test is a longer text with everything from the island; the speed lessons and the
// exam are longer still, since speed only shows over a stretch of real sentences
const PLAN: Record<LessonKind, { rounds: RoundKind[]; groups: number }> = {
  lesson: { rounds: ROUNDS, groups: 8 },
  daily: { rounds: ['new', 'new', 'mix', 'words'], groups: 8 },
  test: { rounds: ['mix', 'words', 'words'], groups: 12 },
  speed: { rounds: ['mix', 'mix', 'mix', 'mix'], groups: 12 },
  exam: { rounds: ['mix', 'mix', 'mix', 'mix', 'mix'], groups: 12 },
}

// The game at the end takes turns: fish, balloons, the ball (feedback 2026-10-24: more
// variety). The fish carry single letters, so only the letter islands have them.
const GAMES: RoundKind[] = ['fish', 'balloons', 'ball']

export function roundKinds(lesson: Lesson): RoundKind[] {
  const { rounds } = PLAN[lesson.kind]
  const game = GAMES[(lesson.number - 1) % GAMES.length]
  const fits = game !== 'fish' || lesson.practice === 'letters'
  return rounds.map((kind) => (kind === 'balloons' && fits ? game : kind))
}

export const isGame = (kind: RoundKind) => kind === 'balloons' || kind === 'ball' || kind === 'fish'

export function makeRounds(lesson: Lesson, random = Math.random): string[] {
  const { groups } = PLAN[lesson.kind]
  const make = lesson.practice === 'sentences' ? makeSentences : makeDrill
  return roundKinds(lesson).map((kind) =>
    kind === 'fish'
      ? makeFish(lesson, random)
      : isGame(kind)
        ? makeBalloons(lesson, random)
        : make(lesson, kind, groups, random),
  )
}

// The letters for a fish round, one per fish: the letters of a mixed drill, without spaces
export function makeFish(lesson: Lesson, random = Math.random): string {
  return makeDrill(lesson, 'mix', FISH, random).replaceAll(' ', '').slice(0, FISH)
}

// The words for a game round, separated by spaces: one balloon each. On the sentence
// islands they are the words of whole sentences, so the punctuation comes along.
export function makeBalloons(lesson: Lesson, random = Math.random): string {
  if (lesson.practice !== 'sentences') return makeDrill(lesson, 'words', BALLOONS, random)
  const words = makeSentences(lesson, 'mix', BALLOONS * 2, random).split(' ')
  const end = words.findIndex((word, i) => i >= BALLOONS - 1 && /[.?!]$/.test(word))
  return end < 0 ? words.join(' ') : words.slice(0, end + 1).join(' ')
}

const fits = (text: string, keys: string[]) => [...text].every((char) => char === ' ' || keys.includes(char))

export function sentencesFor(keys: string[]): string[] {
  return SENTENCES.filter((sentence) => fits(sentence, keys))
}

// A few whole sentences, about as long as a line of letter groups. The warm-up rounds
// take sentences from this step, or with the new keys; later rounds take any that fit.
export function makeSentences(lesson: Lesson, kind: RoundKind = 'mix', groups = 8, random = Math.random): string {
  const all = sentencesFor(lesson.keys)
  const withNew = all.filter((sentence) => lesson.newKeys.some((key) => sentence.includes(key)))
  const focus = lesson.focus.length > 0 ? lesson.focus : withNew.length > 0 ? withNew : all
  const parts: string[] = []
  let length = 0
  while (length < groups * 5) {
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
  const fitting = numbers
    ? NUMBERS.filter((phrase) => fits(phrase, lesson.keys))
    : wordsFor(lesson.keys).filter((word) => !capitals || isCapital(word[0]))
  // Words with a new (or weak) key in them get the most practice
  const withNew = fitting.filter((word) => lesson.newKeys.some((key) => word.includes(key)))
  const words = withNew.length >= 3 ? withNew : fitting
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
