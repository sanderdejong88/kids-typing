import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { Attempt } from '../lib/attempt'
import type { KeySample } from '../lib/keystats'
import { FINGER_NAMES, fingerFor } from '../lib/keyboard'
import type { Lesson } from '../lib/lessons'
import { play } from '../lib/sound'
import { BeachBall, Seal } from './Seal'
import { Keyboard } from './Keyboard'
import { RoundProgress, TypingLine } from './TypingExercise'

type Props = {
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

// Heights are in ball sizes above the seal's head, times in seconds
const GRAVITY = 40
// Every right key sends the ball this high; it climbs a little with every tap in a row,
// but stays in the sky above Snuf (about 4 ball sizes on a small screen)
const peakFor = (hits: number) => 1.5 + Math.min(hits, 20) * 0.05
// Taps in a row that earn a cheer
const CHEER_STEP = 10
const DROP_MS = 1100
// The last bounce plays before the round ends
const END_MS = 800

const freshBall = () => ({
  // Height and speed of the ball, and how far it has turned
  y: 0,
  v: 0,
  turn: 0,
  spin: 0,
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

const snapshot = (b: Ball, now: number) => ({ ...b, now })

// A round of a lesson where Snuf keeps a beach ball up (feedback 2026-10-24: more variety).
// Every right key taps the ball up; a wrong one knocks it off. There is no clock: when she
// pauses, the ball just rests on Snuf's head. It counts like a typing round.
export function BallRound({ lesson, text, round, rounds, beginner, onDone, onStop }: Props) {
  const [position, setPosition] = useState(0)
  const [wrong, setWrong] = useState(false)
  const [misses, setMisses] = useState(0)
  const [pressed, setPressed] = useState<{ key: string; ok: boolean; n: number }>()
  const ball = useRef(freshBall())
  const [view, setView] = useState(() => snapshot(freshBall(), 0))
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
      if (b.y > 0 || b.v > 0) {
        b.v -= GRAVITY * dt
        b.y += b.v * dt
        if (b.y <= 0) {
          b.y = 0
          // A fast landing bounces once more, a little
          b.v = b.v < -6 ? -b.v * 0.2 : 0
        }
      }
      b.turn += b.spin * dt
      if (b.y === 0) b.spin *= 0.9
      setView(snapshot(b, t))
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
      const falling = now - b.droppedAt < DROP_MS
      if (s.keystrokes === 0) s.startedAt = now
      s.keystrokes++

      setPressed({ key: event.key, ok: event.key === text[position], n: s.keystrokes })
      if (event.key !== text[position]) {
        s.missedHere = true
        setWrong(true)
        setMisses((n) => n + 1)
        play('wrong')
        // The ball tumbles off, unless it is already on its way down
        if (!falling) {
          b.droppedAt = now
          b.dropY = b.y
          b.dropTurn = b.turn
          b.y = 0
          b.v = 0
          b.hits = 0
        }
        return
      }
      if (!s.missedHere) s.firstTry++
      // The first key has nothing before it to time from
      if (position > 0) s.samples.push({ key: text[position], ms: now - s.lastAt, miss: s.missedHere })
      s.lastAt = now
      s.missedHere = false
      setWrong(false)

      // While the ball is falling she keeps typing; it is back on Snuf's head in a moment
      if (!falling) {
        b.hits++
        b.taps++
        b.best = Math.max(b.best, b.hits)
        const last = position + 1 === text.length
        const peak = last ? 3.3 : peakFor(b.hits)
        b.v = Math.sqrt(2 * GRAVITY * Math.max(peak - b.y, 0.4))
        b.spin = (Math.random() < 0.5 ? -1 : 1) * (200 + Math.random() * 250)
        if (b.hits % CHEER_STEP === 0) {
          b.cheeredAt = now
          b.cheer = b.hits
          play('combo')
        } else {
          play('bounce', b.hits)
        }
      } else {
        play('key', position % 8)
      }
      if (position + 1 === text.length) play('round')
      setPosition(position + 1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [position, text, onStop])

  const { now, ...b } = view
  const falling = b.droppedAt > 0 && now - b.droppedAt < DROP_MS
  const next = text[position]
  const finger = next ? fingerFor(next) : undefined
  const cheering = b.cheeredAt > 0 && now - b.cheeredAt < 1300
  const mood =
    finished || (cheering && now - b.cheeredAt < 900) ? 'happy' : falling && now - b.droppedAt < 600 ? 'oops' : 'idle'

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
        {cheering && (
          <span className="combo ball-round-cheer" key={`cheer-${b.cheeredAt}`}>
            {b.cheer} keer hoog!
          </span>
        )}

        <div className={`ball-seal nod-${b.taps % 2}`}>
          <Seal mood={mood} />
          {falling ? (
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
