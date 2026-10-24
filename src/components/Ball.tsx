import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { Attempt } from '../lib/attempt'
import { loadBallRecord, saveBallRecord } from '../lib/awards'
import type { KeySample } from '../lib/keystats'
import { FINGER_NAMES, fingerFor } from '../lib/keyboard'
import type { Lesson } from '../lib/lessons'
import { play } from '../lib/sound'
import { Art } from './Art'
import { wordFor } from './Balloons'
import { Confetti } from './Confetti'
import { BeachBall, Seal, type Mood } from './Seal'
import { Keyboard } from './Keyboard'
import { RoundProgress, TypingLine } from './TypingExercise'

// Heights are in ball sizes above the seal's head, times in seconds
const GRAVITY = 40
// Taps in a row that earn a cheer
const CHEER_STEP = 10
const DROP_MS = 1100

const freshBall = () => ({
  // Height and speed of the ball, and how far it has turned
  y: 0,
  v: 0,
  turn: 0,
  spin: 0,
  gravity: GRAVITY,
  // Right keys in a row: as long as she types right, the ball stays up
  hits: 0,
  best: 0,
  // Every tap so far, for Snuf to nod along
  taps: 0,
  droppedAt: 0,
  // Where the ball was when it fell, so it falls from there
  dropY: 0,
  dropTurn: 0,
  cheeredAt: 0,
  cheer: 0,
})

type Ball = ReturnType<typeof freshBall>

// Moves the ball on by one frame. Returns how fast it came down on Snuf's head, or 0.
function fly(b: Ball, dt: number): number {
  b.turn += b.spin * dt
  if (b.y <= 0 && b.v <= 0) {
    b.spin *= 0.9
    return 0
  }
  b.v -= b.gravity * dt
  b.y += b.v * dt
  if (b.y > 0) return 0
  const speed = -b.v
  b.y = 0
  b.v = 0
  return speed
}

// A right key taps the ball up to the given height, with a cheer every 10 in a row
function tap(b: Ball, peak: number, now: number) {
  b.hits++
  b.taps++
  b.best = Math.max(b.best, b.hits)
  b.v = Math.sqrt(2 * b.gravity * Math.max(peak - b.y, 0.4))
  b.spin = (Math.random() < 0.5 ? -1 : 1) * (200 + Math.random() * 250)
  if (b.hits % CHEER_STEP === 0) {
    b.cheeredAt = now
    b.cheer = b.hits
    play('combo')
  } else {
    play('bounce', b.hits)
  }
}

// The ball tumbles off; a moment later it is back on Snuf's head
function drop(b: Ball, now: number) {
  b.droppedAt = now
  b.dropY = b.y
  b.dropTurn = b.turn
  b.y = 0
  b.v = 0
  b.hits = 0
}

const isFalling = (b: Ball, now: number) => b.droppedAt > 0 && now - b.droppedAt < DROP_MS
const isCheering = (b: Ball, now: number) => b.cheeredAt > 0 && now - b.cheeredAt < 1300

// Snuf on the sand with the ball above its head, flying, falling off or just back
function BallScene({ ball: b, now, mood }: { ball: Ball; now: number; mood: Mood }) {
  return (
    <div className={`ball-seal nod-${b.taps % 2}`}>
      <Seal mood={mood} />
      {isFalling(b, now) ? (
        <BeachBall
          key={b.droppedAt}
          className="ball-round-ball dropping"
          style={{ '--from': b.dropY, '--turn': `${b.dropTurn}deg` } as CSSProperties}
        />
      ) : (
        <BeachBall
          key={`up-${b.droppedAt}`}
          className={b.droppedAt ? 'ball-round-ball back' : 'ball-round-ball'}
          style={{ '--y': b.y, '--turn': `${b.turn}deg` } as CSSProperties}
        />
      )}
    </div>
  )
}

function Cheer({ ball: b, now }: { ball: Ball; now: number }) {
  if (!isCheering(b, now)) return null
  return (
    <span className="combo ball-round-cheer" key={`cheer-${b.cheeredAt}`}>
      {b.cheer} keer hoog!
    </span>
  )
}

const moodFor = (b: Ball, now: number, happy: boolean): Mood =>
  happy || (isCheering(b, now) && now - b.cheeredAt < 900) ? 'happy' : isFalling(b, now) && now - b.droppedAt < 600 ? 'oops' : 'idle'

type GameProps = {
  // The letters she knows; every word uses only these (REQUIREMENTS M5)
  keys: string[]
  // How long she typed, for the daily goal
  onPlayed: (ms: number) => void
  onHome: () => void
}

const LIVES = 3
// The game: the ball must be tapped again before it lands, and each flight is a little
// shorter than the last, from 3 seconds down to 1.4
const GAME_PEAK = 2.2
const flightFor = (score: number) => Math.max(1.4, 3 - score * 0.03)
const WORDS_PER_LINE = 5

const lineFor = (keys: string[], score: number) =>
  Array.from({ length: WORDS_PER_LINE }, () => wordFor(keys, score)).join(' ')

const freshGame = (keys: string[], t: number) => ({
  ball: freshBall(),
  lives: LIVES,
  score: 0,
  text: lineFor(keys, 0),
  position: 0,
  startedAt: t,
  // The ball is in the air, so it must not land
  up: false,
})

type Game = ReturnType<typeof freshGame>

const gameSnapshot = (g: Game, now: number) => ({ ...g, ball: { ...g.ball }, now })

// Keep the ball up as long as you can: every right key taps it, a wrong key or a ball that
// lands costs one of the three balls. The score is the number of taps (feedback 2026-10-24).
export function BallGame({ keys, onPlayed, onHome }: GameProps) {
  const [phase, setPhase] = useState<'ready' | 'playing' | 'over'>('ready')
  const [record, setRecord] = useState(loadBallRecord)
  const [newRecord, setNewRecord] = useState(false)
  const [misses, setMisses] = useState(0)
  // The game runs on a ref; every frame a copy goes into state to draw from
  const game = useRef(freshGame(keys, 0))
  const [view, setView] = useState(() => gameSnapshot(game.current, 0))
  const played = useRef(onPlayed)
  useEffect(() => {
    played.current = onPlayed
  })

  const start = () => {
    const t = performance.now()
    game.current = freshGame(keys, t)
    setNewRecord(false)
    setView(gameSnapshot(game.current, t))
    setPhase('playing')
    play('tap')
  }

  // A ball lost: it falls, and once the last one is down the game is over
  const lose = (g: Game, now: number) => {
    drop(g.ball, now)
    g.up = false
    g.lives--
  }

  // The game clock: the ball flies, and a ball that lands is lost
  useEffect(() => {
    if (phase !== 'playing') return
    let last = performance.now()
    let frame = requestAnimationFrame(function tick(t) {
      const g = game.current
      const dt = Math.min((t - last) / 1000, 0.05)
      last = t
      if (fly(g.ball, dt) > 0 && g.up) {
        play('wrong')
        lose(g, t)
      }
      if (g.lives === 0 && !isFalling(g.ball, t)) {
        // The time counts for the daily goal, and a new record gets a party
        played.current(g.ball.droppedAt - g.startedAt)
        if (g.score > loadBallRecord()) {
          saveBallRecord(g.score)
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
  }, [phase])

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
      const falling = isFalling(g.ball, now)
      if (event.key !== g.text[g.position]) {
        play('wrong')
        setMisses((n) => n + 1)
        if (!falling) lose(g, now)
        return
      }
      // While the ball falls she can keep typing; the next tap after that throws it up again
      if (falling) {
        play('key', g.position % 8)
      } else {
        g.ball.gravity = (8 * GAME_PEAK) / flightFor(g.score) ** 2
        tap(g.ball, GAME_PEAK, now)
        g.up = true
        g.score++
      }
      g.position++
      if (g.position === g.text.length) {
        g.text = lineFor(keys, g.score)
        g.position = 0
      }
      setView(gameSnapshot(g, now))
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const { now, ...g } = view
  const mood = moodFor(g.ball, now, phase === 'over')

  return (
    <section className="balloons ball-game">
      <div className="balloons-top">
        <span className="balloons-score" key={g.score}>
          <BeachBall className="ball-round-icon" />
          {g.score}
        </span>
        <span className="ball-game-lives" aria-label={`Nog ${g.lives} ${g.lives === 1 ? 'bal' : 'ballen'}`}>
          {Array.from({ length: LIVES }, (_, i) => (
            <BeachBall key={i} className={i < g.lives ? 'ball-game-life' : 'ball-game-life lost'} />
          ))}
        </span>
        <span className="balloons-record">
          <Art name="trophy" size={26} />
          record: {record}
        </span>
      </div>

      <div className={phase === 'playing' ? 'line-wrap' : 'line-wrap waiting'} key={g.text}>
        <TypingLine text={g.text} position={g.position} wrong={false} misses={misses} />
      </div>

      <div className={`sky beach ${misses ? `shake-${misses % 2}` : ''}`}>
        <Cheer ball={g.ball} now={now} />
        <BallScene ball={g.ball} now={now} mood={mood} />

        {phase === 'ready' && (
          <div className="balloons-card">
            <BeachBall className="balloons-card-art ball-game-card-art" />
            <h2>Hooghouden</h2>
            <p>Elke goede letter is een tik tegen de bal. Typ op tijd, anders valt hij! Je hebt 3 ballen.</p>
            <p className="small">Druk op spatie om te beginnen · Esc = terug naar de kaart</p>
          </div>
        )}

        {phase === 'over' && (
          <div className="balloons-card">
            <Confetti fire={1} amount={newRecord ? 220 : 60} />
            <Art name={newRecord ? 'trophy' : 'party-popper'} size={84} className="balloons-card-art" />
            <h2>{newRecord ? 'Nieuw record!' : 'De ballen zijn op!'}</h2>
            <p className="balloons-result">
              Je hield de bal <strong>{g.score}</strong> keer hoog
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
  // The words to type, separated by spaces
  text: string
  // Which round of the lesson this is, counting from 0
  round: number
  rounds: number
  beginner: boolean
  onDone: (attempt: Attempt) => void
  onStop: () => void
}

// Every right key sends the ball this high; it climbs a little with every tap in a row,
// but stays in the sky above Snuf (about 4 ball sizes on a small screen)
const peakFor = (hits: number) => 1.5 + Math.min(hits, 20) * 0.05
// The last bounce plays before the round ends
const END_MS = 800

const ballSnapshot = (b: Ball, now: number) => ({ ball: { ...b }, now })

// A round of a lesson where Snuf keeps a beach ball up (feedback 2026-10-24: more variety).
// Every right key taps the ball up; a wrong one knocks it off. There is no clock: when she
// pauses, the ball just rests on Snuf's head. It counts like a typing round.
export function BallRound({ lesson, text, round, rounds, beginner, onDone, onStop }: RoundProps) {
  const [position, setPosition] = useState(0)
  const [wrong, setWrong] = useState(false)
  const [misses, setMisses] = useState(0)
  const [pressed, setPressed] = useState<{ key: string; ok: boolean; n: number }>()
  const ball = useRef(freshBall())
  const [view, setView] = useState(() => ballSnapshot(freshBall(), 0))
  const stats = useRef({ keystrokes: 0, firstTry: 0, missedHere: false, startedAt: 0, lastAt: 0, samples: [] as KeySample[] })
  const finished = position === text.length
  const done = useRef(onDone)
  useEffect(() => {
    done.current = onDone
  })

  // The ball flies and falls back onto Snuf's head
  useEffect(() => {
    let last = performance.now()
    let frame = requestAnimationFrame(function tick(t) {
      const b = ball.current
      const dt = Math.min((t - last) / 1000, 0.05)
      last = t
      // A fast landing bounces once more, a little
      const landing = fly(b, dt)
      if (landing > 6) b.v = landing * 0.2
      setView(ballSnapshot(b, t))
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
      const b = ball.current
      const now = performance.now()
      const falling = isFalling(b, now)
      if (s.keystrokes === 0) s.startedAt = now
      s.keystrokes++

      setPressed({ key: event.key, ok: event.key === text[position], n: s.keystrokes })
      if (event.key !== text[position]) {
        s.missedHere = true
        setWrong(true)
        setMisses((n) => n + 1)
        play('wrong')
        // The ball tumbles off, unless it is already on its way down
        if (!falling) drop(b, now)
        return
      }
      if (!s.missedHere) s.firstTry++
      // The first key has nothing before it to time from
      if (position > 0) s.samples.push({ key: text[position], ms: now - s.lastAt, miss: s.missedHere })
      s.lastAt = now
      s.missedHere = false
      setWrong(false)

      // While the ball is falling she keeps typing; it is back on Snuf's head in a moment
      const last = position + 1 === text.length
      if (!falling) tap(b, last ? 3.3 : peakFor(b.hits), now)
      else play('key', position % 8)
      if (last) play('round')
      setPosition(position + 1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [position, text, onStop])

  const { now, ball: b } = view
  const next = text[position]
  const finger = next ? fingerFor(next) : undefined

  return (
    <section className="exercise ball-round">
      <RoundProgress round={round} rounds={rounds} progress={position / text.length} cheering={round > 0 && position === 0} />

      <TypingLine text={text} position={position} wrong={wrong} misses={misses} />

      <div className="sky beach">
        <span className="balloons-score ball-round-count" key={b.hits} aria-label={`${b.hits} keer hooggehouden`}>
          <BeachBall className="ball-round-icon" />
          {b.hits}
        </span>
        {b.best > 0 && <span className="ball-round-best">beste: {b.best}</span>}
        {position === 0 && <p className="balloon-round-call">Houd de bal hoog! Elke goede letter is een tik.</p>}
        <Cheer ball={b} now={now} />
        <BallScene ball={b} now={now} mood={moodFor(b, now, finished)} />

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
