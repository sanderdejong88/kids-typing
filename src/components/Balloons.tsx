import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { loadBalloonRecord, saveBalloonRecord } from '../lib/awards'
import { wordsFor } from '../lib/lessons'
import { play } from '../lib/sound'
import { Art } from './Art'
import { Confetti } from './Confetti'
import { Hippo } from './Hippo'

type Props = {
  // The letters she knows; every balloon uses only these (REQUIREMENTS M5)
  keys: string[]
  // How long she typed, for the daily goal
  onPlayed: (ms: number) => void
  onHome: () => void
}

type Balloon = {
  id: number
  word: string
  // Left edge, in % of the sky
  x: number
  born: number
  // How long it takes to float from the bottom to the top
  riseMs: number
  hue: number
  typed: number
  poppedAt?: number
}

const GAME_MS = 60_000
const POP_MS = 450
const MAX_BALLOONS = 6
const HUES = [0, 40, 110, 190, 260, 310]

// The game speeds up with every popped balloon: they come more often and rise faster
const spawnGap = (score: number) => Math.max(1200, 2800 - score * 90)
const riseTime = (score: number) => Math.max(5500, 12_000 - score * 250)

// Real words where she knows enough of them, otherwise little letter groups.
// Short words first; longer ones join as she pops more.
function wordFor(keys: string[], score: number): string {
  const letters = keys.filter((key) => /^[a-z]$/.test(key))
  const words = wordsFor(keys).filter((word) => /^[a-z']+$/.test(word))
  const maxLength = 3 + Math.floor(score / 4)
  const fitting = words.filter((word) => word.length <= maxLength)
  if (fitting.length >= 6) return fitting[Math.floor(Math.random() * fitting.length)]
  const length = 2 + Math.floor(Math.random() * 2)
  return Array.from({ length }, () => letters[Math.floor(Math.random() * letters.length)]).join('')
}

// Somewhere across the sky, but not right where the last two balloons went up
function placeFor(balloons: Balloon[]): number {
  const recent = balloons.slice(-2).map((b) => b.x)
  for (let tries = 0; tries < 10; tries++) {
    const x = 4 + Math.random() * 78
    if (recent.every((other) => Math.abs(other - x) > 16)) return x
  }
  return 4 + Math.random() * 78
}

const fresh = (t: number) => ({
  startedAt: t,
  nextSpawn: t,
  nextId: 1,
  balloons: [] as Balloon[],
  // The balloon she is typing, 0 for none
  target: 0,
  score: 0,
  poppedAt: 0,
  missedAt: 0,
})

type Game = ReturnType<typeof fresh>

const snapshot = (g: Game, now: number) => ({ ...g, balloons: g.balloons.map((b) => ({ ...b })), now })

// Pop the balloons by typing their words before they float away. Only right keys move
// the game forward, so accuracy feels physical (REQUIREMENTS M5).
export function Balloons({ keys, onPlayed, onHome }: Props) {
  const [phase, setPhase] = useState<'ready' | 'playing' | 'over'>('ready')
  const [wrong, setWrong] = useState(0)
  const [record, setRecord] = useState(loadBalloonRecord)
  const [newRecord, setNewRecord] = useState(false)
  // The game runs on a ref; every frame a copy goes into state to draw from
  const game = useRef(fresh(0))
  const [view, setView] = useState(() => snapshot(fresh(0), 0))
  const played = useRef(onPlayed)
  useEffect(() => {
    played.current = onPlayed
  })

  const start = () => {
    const t = performance.now()
    game.current = fresh(t)
    setNewRecord(false)
    setView(snapshot(game.current, t))
    setPhase('playing')
    play('tap')
  }

  // The game clock: balloons spawn, rise and float away
  useEffect(() => {
    if (phase !== 'playing') return
    let frame = requestAnimationFrame(function tick(t) {
      const g = game.current
      if (t - g.startedAt >= GAME_MS) {
        // The time counts for the daily goal, and a new record gets a party
        played.current(GAME_MS)
        if (g.score > loadBalloonRecord()) {
          saveBalloonRecord(g.score)
          setRecord(g.score)
          setNewRecord(true)
          play('complete')
        } else {
          play('round')
        }
        setPhase('over')
        return
      }
      if (t >= g.nextSpawn && g.balloons.filter((b) => !b.poppedAt).length < MAX_BALLOONS) {
        g.balloons.push({
          id: g.nextId++,
          word: wordFor(keys, g.score),
          x: placeFor(g.balloons),
          born: t,
          riseMs: riseTime(g.score),
          hue: HUES[g.nextId % HUES.length],
          typed: 0,
        })
        g.nextSpawn = t + spawnGap(g.score)
      }
      g.balloons = g.balloons.filter((b) => {
        if (b.poppedAt) return t - b.poppedAt < POP_MS
        const escaped = (t - b.born) / b.riseMs > 1
        if (escaped && g.target === b.id) g.target = 0
        return !escaped
      })
      setView(snapshot(g, t))
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
      const live = g.balloons.filter((b) => !b.poppedAt)
      // Without a target she can start on any balloon; the highest one goes first
      const target =
        live.find((b) => b.id === g.target) ??
        live
          .filter((b) => b.word[0] === event.key)
          .sort((a, b) => (performance.now() - a.born) / a.riseMs - (performance.now() - b.born) / b.riseMs)
          .pop()
      if (!target || target.word[target.typed] !== event.key) {
        play('wrong')
        g.missedAt = performance.now()
        setWrong((n) => n + 1)
        return
      }
      target.typed++
      g.target = target.id
      if (target.typed < target.word.length) {
        play('key', target.typed)
      } else {
        target.poppedAt = performance.now()
        g.poppedAt = target.poppedAt
        g.target = 0
        g.score++
        play('pop', g.score)
      }
      setView(snapshot(g, performance.now()))
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const { now, ...g } = view
  // Nijl cheers on every pop and goes "oops" on a miss
  const mood = phase === 'over' || now - g.poppedAt < 700 ? 'happy' : now - g.missedAt < 400 ? 'oops' : 'idle'
  const left = Math.max(0, Math.ceil((GAME_MS - (now - g.startedAt)) / 1000))

  return (
    <section className="balloons">
      <div className="balloons-top">
        <span className="balloons-score" key={g.score}>
          <Art name="balloon" size={30} />
          {g.score}
        </span>
        {phase === 'playing' && (
          <div className="balloons-clock" aria-label={`Nog ${left} seconden`}>
            <span className="balloons-clock-fill" style={{ width: `${(left / (GAME_MS / 1000)) * 100}%` }} />
            <strong>{left}</strong>
          </div>
        )}
        <span className="balloons-record">
          <Art name="trophy" size={26} />
          record: {record}
        </span>
      </div>

      <div className={`sky ${wrong ? `shake-${wrong % 2}` : ''}`}>
        {phase === 'playing' &&
          g.balloons.map((b) => {
            const rise = Math.min((now - b.born) / b.riseMs, 1)
            return (
              <div
                key={b.id}
                className={['balloon', b.poppedAt ? 'popped' : '', b.id === g.target ? 'target' : ''].join(' ')}
                style={{ left: `${b.x}%`, bottom: `calc(${rise} * (100% + 150px) - 150px)`, '--hue': `${b.hue}deg` } as CSSProperties}
              >
                <Art name="balloon" size={86} className="balloon-art" />
                <span className="balloon-word">
                  <span className="balloon-typed">{b.word.slice(0, b.typed)}</span>
                  {b.word.slice(b.typed)}
                </span>
                {b.poppedAt && <span className="balloon-burst" />}
              </div>
            )
          })}

        {phase === 'ready' && (
          <div className="balloons-card">
            <Art name="balloon" size={84} className="balloons-card-art" />
            <h2>Ballonnen knallen</h2>
            <p>Typ het woord op een ballon voordat hij wegvliegt. Hoe meer je er knalt, hoe sneller het gaat!</p>
            <p className="small">Druk op spatie om te beginnen · Esc = terug naar de kaart</p>
          </div>
        )}

        {phase === 'over' && (
          <div className="balloons-card">
            <Confetti fire={1} amount={newRecord ? 220 : 60} />
            <Art name={newRecord ? 'trophy' : 'party-popper'} size={84} className="balloons-card-art" />
            <h2>{newRecord ? 'Nieuw record!' : 'Tijd is om!'}</h2>
            <p className="balloons-result">
              Je knalde <strong>{g.score}</strong> {g.score === 1 ? 'ballon' : 'ballonnen'}
            </p>
            {!newRecord && record > 0 && <p className="small">Je record is {record}. Lukt het je om dat te verslaan?</p>}
            <p className="small">Spatie = nog een keer · Esc = terug naar de kaart</p>
          </div>
        )}
      </div>

      <Hippo size={80} className="balloons-hippo" mood={mood} />
    </section>
  )
}
