import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { Attempt } from '../lib/attempt'
import { loadFishRecord, saveFishRecord } from '../lib/awards'
import type { KeySample } from '../lib/keystats'
import { FINGER_NAMES, fingerFor } from '../lib/keyboard'
import type { Lesson } from '../lib/lessons'
import { play } from '../lib/sound'
import { Art } from './Art'
import { Confetti } from './Confetti'
import { Seal, type Mood } from './Seal'
import { Keyboard } from './Keyboard'
import { RoundProgress } from './TypingExercise'

// Places are in % of the sea scene. Snuf sits on a rock on the left; the fish swim in
// from the right in three lanes and have to be caught before they reach the rock.
const ROCK = 24
const LANES = [64, 77, 90]
const START = 108
const LEAP_MS = 550
const FLEE_MS = 700
const CHEER_STEP = 10
const HUES = [0, 150, 200, 280, 320]

type Fish = {
  id: number
  char: string
  x: number
  lane: number
  hue: number
  // Swimming speed, in % per second
  speed: number
  caughtAt?: number
  fledAt?: number
}

const alive = (f: Fish) => !f.caughtAt && !f.fledAt

// A fish that is caught leaps out of the water into Snuf's mouth; one that got away
// turns around and swims off
function FishSprite({ fish: f, front, shake }: { fish: Fish; front: boolean; shake: number }) {
  // A wrong key makes the first fish wiggle; two names so the next one starts it again
  const state = f.caughtAt ? 'caught' : f.fledAt ? 'fled' : front ? `front ${shake ? `shake-${shake % 2}` : ''}` : ''
  return (
    <div
      className={`fish ${state}`}
      style={{ '--x': f.x, '--top': LANES[f.lane], '--hue': `${f.hue}deg` } as CSSProperties}
    >
      <div className="fish-body">
        <Art name="fish" size={64} className="fish-art" />
        <span className="fish-letter">{f.char}</span>
      </div>
    </div>
  )
}

// Snuf on its rock above the water, gulping with every fish
function FishScene({ fish, gulps, mood, frontId, shake }: { fish: Fish[]; gulps: number; mood: Mood; frontId?: number; shake: number }) {
  return (
    <>
      <div className="fish-rock" />
      <div className={`fish-seal gulp-${gulps % 2}`}>
        <Seal mood={mood} />
      </div>
      {fish.map((f) => (
        <FishSprite key={f.id} fish={f} front={f.id === frontId} shake={shake} />
      ))}
    </>
  )
}

function Cheer({ count, at, now }: { count: number; at: number; now: number }) {
  if (at === 0 || now - at > 1300) return null
  return (
    <span className="combo fish-cheer" key={`cheer-${at}`}>
      {count} vissen!
    </span>
  )
}

const moodFor = (now: number, caughtAt: number, missedAt: number, happy: boolean): Mood =>
  happy || (caughtAt > 0 && now - caughtAt < 500) ? 'happy' : missedAt > 0 && now - missedAt < 600 ? 'oops' : 'idle'

type GameProps = {
  // The letters she knows; every fish carries one of these (REQUIREMENTS M5)
  keys: string[]
  // How long she typed, for the daily goal
  onPlayed: (ms: number) => void
  onHome: () => void
}

const LIVES = 3
const MAX_FISH = 4
// The game speeds up with every fish: they come more often and swim faster
const swimTime = (score: number) => Math.max(3.4, 8 - score * 0.09)
const spawnGap = (score: number) => Math.max(800, 2300 - score * 35)

// Half the fish carry one of the newest six keys, so what she just learned comes by most
function letterFor(keys: string[]): string {
  const letters = keys.filter((key) => key.length === 1 && key !== ' ')
  const pool = letters.length === 0 ? ['f', 'j'] : Math.random() < 0.5 ? letters.slice(-6) : letters
  return pool[Math.floor(Math.random() * pool.length)]
}

// Another lane than the last fish, so two fish never swim on top of each other
function laneFor(fish: Fish[]): number {
  const last = fish.at(-1)?.lane
  const lanes = [0, 1, 2].filter((lane) => lane !== last)
  return lanes[Math.floor(Math.random() * lanes.length)]
}

const freshGame = (t: number) => ({
  fish: [] as Fish[],
  nextId: 1,
  nextSpawn: t + 600,
  lives: LIVES,
  score: 0,
  startedAt: t,
  lastAt: t,
  caughtAt: 0,
  missedAt: 0,
  cheeredAt: 0,
})

type Game = ReturnType<typeof freshGame>

const gameSnapshot = (g: Game, now: number) => ({ ...g, fish: g.fish.map((f) => ({ ...f })), now })

// Catch the fish by typing the letter they carry before they reach Snuf's rock. A fish that
// gets there, or one scared off by a wrong key, costs one of the three hearts (feedback 2026-10-24).
export function FishGame({ keys, onPlayed, onHome }: GameProps) {
  const [phase, setPhase] = useState<'ready' | 'playing' | 'over'>('ready')
  const [record, setRecord] = useState(loadFishRecord)
  const [newRecord, setNewRecord] = useState(false)
  const [misses, setMisses] = useState(0)
  // The game runs on a ref; every frame a copy goes into state to draw from
  const game = useRef(freshGame(0))
  const [view, setView] = useState(() => gameSnapshot(game.current, 0))
  const played = useRef(onPlayed)
  useEffect(() => {
    played.current = onPlayed
  })

  const start = () => {
    const t = performance.now()
    game.current = freshGame(t)
    setNewRecord(false)
    setView(gameSnapshot(game.current, t))
    setPhase('playing')
    play('tap')
  }

  // A fish got away: it turns around and swims off, and a heart is gone
  const lose = (g: Game, f: Fish, now: number) => {
    f.fledAt = now
    g.missedAt = now
    g.lives--
    play('splash')
  }

  // The game clock: fish come in, swim to the rock and get away there
  useEffect(() => {
    if (phase !== 'playing') return
    let last = performance.now()
    let frame = requestAnimationFrame(function tick(t) {
      const g = game.current
      const dt = Math.min((t - last) / 1000, 0.05)
      last = t
      if (g.lives > 0 && t >= g.nextSpawn && g.fish.filter(alive).length < MAX_FISH) {
        g.fish.push({
          id: g.nextId,
          char: letterFor(keys),
          x: START,
          lane: laneFor(g.fish),
          hue: HUES[g.nextId % HUES.length],
          speed: (START - ROCK) / swimTime(g.score),
        })
        g.nextId++
        g.nextSpawn = t + spawnGap(g.score)
      }
      for (const f of g.fish) {
        if (!alive(f)) continue
        f.x -= f.speed * dt
        if (f.x <= ROCK && g.lives > 0) lose(g, f, t)
      }
      g.fish = g.fish.filter((f) => (f.caughtAt ? t - f.caughtAt < LEAP_MS : f.fledAt ? t - f.fledAt < FLEE_MS : true))
      if (g.lives === 0 && t - g.missedAt > FLEE_MS) {
        // The time counts for the daily goal, and a new record gets a party
        played.current(g.lastAt - g.startedAt)
        if (g.score > loadFishRecord()) {
          saveFishRecord(g.score)
          setRecord(g.score)
          setNewRecord(true)
          play('complete')
        } else {
          play('round')
        }
        setPhase('over')
        setView(gameSnapshot(g, t))
        return
      }
      setView(gameSnapshot(g, t))
      frame = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(frame)
  }, [phase, keys])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      if (event.key === 'Escape') return onHome()
      if (phase !== 'playing') {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          start()
        }
        return
      }
      if (event.key.length !== 1) return
      event.preventDefault()
      const g = game.current
      const now = performance.now()
      if (g.lives === 0) return
      g.lastAt = now
      // The fish closest to Snuf with this letter; a wrong key scares off the closest fish
      const swimming = g.fish.filter(alive).sort((a, b) => a.x - b.x)
      const fish = swimming.find((f) => f.char === event.key)
      if (!fish) {
        play('wrong')
        setMisses((n) => n + 1)
        if (swimming.length > 0) lose(g, swimming[0], now)
        return
      }
      fish.caughtAt = now
      g.caughtAt = now
      g.score++
      if (g.score % CHEER_STEP === 0) {
        g.cheeredAt = now
        play('combo')
      } else {
        play('gulp', g.score)
      }
      setView(gameSnapshot(g, now))
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const { now, ...g } = view
  const mood = moodFor(now, g.caughtAt, g.missedAt, phase === 'over')

  return (
    <section className="balloons fish-game">
      <div className="balloons-top">
        <span className="balloons-score" key={g.score}>
          <Art name="fish" size={30} />
          {g.score}
        </span>
        <span className="fish-game-lives" aria-label={`Nog ${g.lives} ${g.lives === 1 ? 'hartje' : 'hartjes'}`}>
          {Array.from({ length: LIVES }, (_, i) => (
            <Art key={i} name="blue-heart" size={30} className={i < g.lives ? 'fish-game-life' : 'fish-game-life lost'} />
          ))}
        </span>
        <span className="balloons-record">
          <Art name="trophy" size={26} />
          record: {record}
        </span>
      </div>

      <div className={`sky sea ${misses ? `shake-${misses % 2}` : ''}`}>
        <Cheer count={g.score} at={g.cheeredAt} now={now} />
        <FishScene fish={g.fish} gulps={g.score} mood={mood} shake={0} />

        {phase === 'ready' && (
          <div className="balloons-card">
            <Art name="fish" size={84} className="balloons-card-art" />
            <h2>Vissen vangen</h2>
            <p>Typ de letter op een vis, dan hapt Snuf hem op. Laat er geen ontsnappen! Je hebt 3 hartjes.</p>
            <p className="small">Druk op spatie om te beginnen · Esc = terug naar de kaart</p>
          </div>
        )}

        {phase === 'over' && (
          <div className="balloons-card">
            <Confetti fire={1} amount={newRecord ? 220 : 60} />
            <Art name={newRecord ? 'trophy' : 'party-popper'} size={84} className="balloons-card-art" />
            <h2>{newRecord ? 'Nieuw record!' : 'De hartjes zijn op!'}</h2>
            <p className="balloons-result">
              Snuf heeft <strong>{g.score}</strong> {g.score === 1 ? 'vis' : 'vissen'} gevangen
            </p>
            {!newRecord && record > 0 && <p className="small">Je record is {record}. Lukt het je om dat te verslaan?</p>}
            <p className="small">Spatie = nog een keer · Esc = terug naar de kaart</p>
          </div>
        )}
      </div>
    </section>
  )
}

type RoundProps = {
  lesson: Lesson
  // The letters to type, one per fish
  text: string
  // Which round of the lesson this is, counting from 0
  round: number
  rounds: number
  beginner: boolean
  onDone: (attempt: Attempt) => void
  onStop: () => void
}

// The fish wait in a row in front of the rock; the first one is next
const QUEUE = 5
const slotFor = (place: number) => ROCK + 3 + place * 16
const QUEUE_SPEED = 45
const END_MS = 900

// A round of a lesson where Snuf catches fish (feedback 2026-10-24: more variety). The
// letters swim up in a row and wait in front of the rock; every right key lets Snuf snap up
// the first one. There is no clock, and it counts like a typing round.
export function FishRound({ lesson, text, round, rounds, beginner, onDone, onStop }: RoundProps) {
  const [position, setPosition] = useState(0)
  const [misses, setMisses] = useState(0)
  const [pressed, setPressed] = useState<{ key: string; ok: boolean; n: number }>()
  // Every fish is the letter at its index; they start one after another off to the right
  const school = useRef(
    [...text].map(
      (char, i): Fish => ({ id: i, char, x: START + Math.min(i, QUEUE) * 16, lane: i % 2, hue: HUES[i % HUES.length], speed: QUEUE_SPEED }),
    ),
  )
  const marks = useRef({ caughtAt: 0, missedAt: 0 })
  const [view, setView] = useState(() => ({ fish: [] as Fish[], now: 0 }))
  const stats = useRef({ keystrokes: 0, firstTry: 0, missedHere: false, startedAt: 0, lastAt: 0, samples: [] as KeySample[] })
  const finished = position === text.length
  const done = useRef(onDone)
  useEffect(() => {
    done.current = onDone
  })

  // The fish swim up to their place in the row and wait there
  useEffect(() => {
    let last = performance.now()
    let frame = requestAnimationFrame(function tick(t) {
      const dt = Math.min((t - last) / 1000, 0.05)
      last = t
      const next = school.current.findIndex(alive)
      const shown: Fish[] = []
      school.current.forEach((f, i) => {
        if (f.caughtAt) {
          if (t - f.caughtAt < LEAP_MS) shown.push({ ...f })
          return
        }
        const place = i - next
        // Fish further back wait off to the right until there is room in the row
        if (next < 0 || place >= QUEUE) {
          f.x = START
          return
        }
        f.x = Math.max(slotFor(place), f.x - f.speed * dt)
        shown.push({ ...f })
      })
      setView({ fish: shown, now: t })
      frame = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (!finished) return
    const timer = setTimeout(() => {
      const s = stats.current
      done.current({ text, keystrokes: s.keystrokes, firstTry: s.firstTry, elapsedMs: s.lastAt - s.startedAt, samples: s.samples })
    }, END_MS)
    return () => clearTimeout(timer)
  }, [finished, text])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      if (event.key === 'Escape') return onStop()
      if (event.key.length !== 1) return
      event.preventDefault()
      if (position === text.length) return

      const s = stats.current
      const now = performance.now()
      if (s.keystrokes === 0) s.startedAt = now
      s.keystrokes++

      setPressed({ key: event.key, ok: event.key === text[position], n: s.keystrokes })
      if (event.key !== text[position]) {
        s.missedHere = true
        marks.current.missedAt = now
        setMisses((n) => n + 1)
        play('wrong')
        return
      }
      if (!s.missedHere) s.firstTry++
      // The first key has nothing before it to time from
      if (position > 0) s.samples.push({ key: text[position], ms: now - s.lastAt, miss: s.missedHere })
      s.lastAt = now
      s.missedHere = false

      school.current[position].caughtAt = now
      marks.current.caughtAt = now
      const caught = position + 1
      if (caught === text.length) play('round')
      else if (caught % CHEER_STEP === 0) play('combo')
      else play('gulp', caught)
      setPosition(caught)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [position, text, onStop])

  const { fish, now } = view
  const next = text[position]
  const finger = next ? fingerFor(next) : undefined
  const { caughtAt, missedAt } = marks.current

  return (
    <section className="exercise fish-round">
      <RoundProgress round={round} rounds={rounds} progress={position / text.length} cheering={round > 0 && position === 0} />

      <div className="sky sea">
        <span className="balloons-score fish-round-count" key={position} aria-label={`${position} van de ${text.length} vissen gevangen`}>
          <Art name="fish" size={30} />
          {position} / {text.length}
        </span>
        {position === 0 && <p className="balloon-round-call">Vang de vissen! Typ de letter op de voorste vis.</p>}
        <Cheer count={position} at={position % CHEER_STEP === 0 && position < text.length ? caughtAt : 0} now={now} />
        <FishScene fish={fish} gulps={position} mood={moodFor(now, caughtAt, missedAt, finished)} frontId={finished ? undefined : position} shake={misses} />

        {beginner && finger && (
          <p className="balloon-round-hint">
            Gebruik je <strong className={`finger-text finger-${finger}`}>{FINGER_NAMES[finger]}</strong>
          </p>
        )}
      </div>

      <Keyboard next={next} keys={lesson.keys} pressed={pressed} />
    </section>
  )
}
