import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { combine, resultFor, type Attempt } from '../lib/attempt'
import type { Lesson } from '../lib/lessons'
import { play } from '../lib/sound'
import { charactersPerMinute } from '../lib/stats'
import { Art, type ArtName } from './Art'
import { Confetti } from './Confetti'
import { Seal } from './Seal'
import { SpeedMeter } from './SpeedMeter'

type Props = {
  lesson: Lesson
  // One attempt per round of the lesson
  attempts: Attempt[]
  onAgain: () => void
  // Only there when the next lesson is open
  next?: Lesson
  onNext?: () => void
  onHome: () => void
  // Good news besides the stars: the daily goal, the streak, a certificate
  news?: News[]
  // Only there when this result earned a certificate or the diploma
  onCertificate?: () => void
}

export type News = { art: ArtName; text: string }

const PRAISE = ['Goed gedaan!', 'Super!', 'Fantastisch, wat knap!']

// What Nijl says next to the card
function buddySays(lesson: Lesson, stars: number, nextOpen: boolean): string {
  if (lesson.kind === 'daily') return 'Goed geoefend! Zo worden je lastige letters steeds makkelijker.'
  if (lesson.kind === 'exam' && stars >= 2) return 'Hoera! Je hebt je typediploma!'
  if (stars === 3) return 'Wauw! Jij bent een echte typ-kampioen!'
  if (nextOpen) return 'Goed zo! De volgende les is open.'
  return 'Bijna! Nog een keer, dan lukt het vast.'
}

// The same sea life as on the map, floating around the panel
const DECOR: { name: ArtName; left: string; top: string; size: number }[] = [
  { name: 'palm-tree', left: '6%', top: '18%', size: 64 },
  { name: 'dolphin', left: '92%', top: '28%', size: 56 },
  { name: 'shell', left: '10%', top: '78%', size: 44 },
  { name: 'island', left: '90%', top: '80%', size: 64 },
  { name: 'fish', left: '4%', top: '50%', size: 40 },
]

// The card pops up, the stars land one by one (each with a ding), then the rest follows
const FIRST_STAR_MS = 650
const STAR_GAP_MS = 550
const SPARKS = 8

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// How many stars have landed so far
function useLanding(stars: number): number {
  const [landed, setLanded] = useState(() => (reducedMotion() ? stars : 0))
  useEffect(() => {
    if (reducedMotion()) return
    const timers = Array.from({ length: stars }, (_, i) =>
      setTimeout(() => {
        setLanded(i + 1)
        play('star', i)
      }, FIRST_STAR_MS + i * STAR_GAP_MS),
    )
    return () => timers.forEach(clearTimeout)
  }, [stars])
  return landed
}

// What two stars need, when that is more than 90% right
function twoStarHint(lesson: Lesson): string {
  const [bar] = lesson.bars
  const goal = bar.apm > 0 ? `${bar.apm} aanslagen per minuut met ${bar.accuracy}% goed` : '2 sterren'
  const what = lesson.kind === 'exam' ? 'je diploma te halen' : lesson.kind === 'test' ? 'naar het volgende eiland te gaan' : 'de volgende les te openen'
  return `Haal ${goal} om ${what}. Rustig aan: eerst goed, dan snel.`
}

export function Results({ lesson, attempts, onAgain, next, onNext, onHome, news = [], onCertificate }: Props) {
  const result = resultFor(lesson, combine(attempts))
  // A balloons round has no speed of its own: the balloons set the pace
  const speeds = attempts.map((attempt) => (attempt.untimed ? undefined : charactersPerMinute(attempt.text.length, attempt.elapsedMs)))
  const timed = speeds.filter((apm) => apm !== undefined)
  const fastest = Math.max(...timed, 1)
  const primary = onNext ?? onAgain
  const landed = useLanding(result.stars)
  // Everything after the stars waits until the last one has landed
  const afterStarsMs = FIRST_STAR_MS + (result.stars - 1) * STAR_GAP_MS + 350
  const later = (extraMs: number): CSSProperties => ({ animationDelay: `${afterStarsMs + extraMs}ms` })
  const done = landed === result.stars
  // Three stars: the seal celebrates with a somersault
  const [salto, setSalto] = useState(false)
  useEffect(() => {
    if (!done || result.stars < 3) return
    const timers = [setTimeout(() => setSalto(true), 300), setTimeout(() => setSalto(false), 1300)]
    return () => timers.forEach(clearTimeout)
  }, [done, result.stars])

  // A finished lesson always gets a little confetti, three stars a big shower
  useEffect(() => {
    if (done && result.stars === 3) play('complete')
  }, [done, result.stars])

  // Hands stay on the keyboard: Enter goes straight on
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Enter') primary()
      if (event.key === 'Escape') onHome()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [primary, onHome])

  return (
    <section className="results">
      {DECOR.map((d) => (
        <Art
          key={d.name}
          name={d.name}
          size={d.size}
          className="results-decor"
          style={{ left: d.left, top: d.top }}
        />
      ))}

      <Confetti fire={done ? 1 : 0} amount={result.stars === 3 ? 220 : result.stars === 2 ? 110 : 50} />

      <div className={`panel ${landed === 0 ? '' : landed % 2 ? 'thump-a' : 'thump-b'}`}>
        <div className="panel-stars" aria-label={`${result.stars} van de 3 sterren`}>
          {[1, 2, 3].map((n) => (
            <span key={n} className="panel-star">
              <Art name="star" size={n === 2 ? 96 : 76} className="panel-star-slot" />
              {n <= landed && (
                <>
                  <span className="burst" />
                  {Array.from({ length: SPARKS }, (_, k) => (
                    <span key={k} className="spark" style={{ '--angle': `${(k * 360) / SPARKS + n * 20}deg` } as CSSProperties} />
                  ))}
                  <Art name="star" size={n === 2 ? 96 : 76} className="panel-star-gold" />
                </>
              )}
            </span>
          ))}
        </div>

        <h2 className="reveal" style={{ animationDelay: '250ms' }}>
          {lesson.name}
        </h2>
        <p className="panel-praise reveal pop" style={later(0)}>
          {PRAISE[result.stars - 1]}
        </p>

        <div className="reveal" style={later(150)}>
          <SpeedMeter apm={result.apm} goalApm={lesson.goalApm} delayMs={afterStarsMs + 350} />
        </div>

        <div className="panel-facts reveal" style={later(900)}>
          <span className="fact">
            <Art name="sparkles" size={26} />
            {result.accuracy}% goed
          </span>
          <span className="fact">
            <Art name="flag" size={26} />
            doel: {lesson.goalApm}
          </span>
        </div>

        {/* Speed per round: the first round is always slow, so show how she warmed up */}
        {speeds.length > 1 && (
          <div className="round-bars" aria-label="Aanslagen per minuut per ronde">
            {speeds.map((apm, i) => (
              <div key={i} className="round-bar">
                {apm === undefined ? (
                  <Art name="balloon" size={34} className="round-bar-balloon reveal" style={later(1300 + i * 120)} />
                ) : (
                  <>
                    <span className="round-bar-value reveal" style={later(1300 + i * 120)}>
                      {apm}
                    </span>
                    <span
                      className="round-bar-fill"
                      style={{ height: `${(apm / fastest) * 100}%`, ...later(1100 + i * 120) }}
                    />
                  </>
                )}
                <span className="round-bar-label">ronde {i + 1}</span>
              </div>
            ))}
          </div>
        )}
        {timed.length > 1 && timed[timed.length - 1] > timed[0] && (
          <p className="tip faster reveal" style={later(1700)}>
            Je werd steeds sneller!
          </p>
        )}
        {lesson.kind !== 'daily' && !next && result.stars < 2 && (
          <p className="tip reveal" style={later(1700)}>
            {twoStarHint(lesson)}
          </p>
        )}

        {news.length > 0 && (
          <div className="panel-news">
            {news.map((item, i) => (
              <span key={item.text} className="news reveal pop" style={later(1900 + i * 250)}>
                <Art name={item.art} size={30} />
                {item.text}
              </span>
            ))}
          </div>
        )}

        <div className="panel-buttons">
          <RoundButton label="Kaart" onClick={onHome} style={later(500)}>
            <Art name="island" size={34} />
          </RoundButton>
          <RoundButton label="Nog een keer" onClick={onAgain} primary={!next} style={later(600)}>
            <svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true">
              <path d="M18 8a7 7 0 1 0 1.6 6" className="icon-line" />
              <path d="M19 3v5h-5" className="icon-line" />
            </svg>
          </RoundButton>
          {onCertificate && (
            <RoundButton label={lesson.kind === 'exam' ? 'Diploma' : 'Oorkonde'} onClick={onCertificate} style={later(650)}>
              <Art name="diploma" size={38} />
            </RoundButton>
          )}
          {next && (
            <RoundButton label={next.name} onClick={onNext!} primary style={later(700)}>
              <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true">
                <path d="M5 5l7 7-7 7M12 5l7 7-7 7" className="icon-line" />
              </svg>
            </RoundButton>
          )}
        </div>
      </div>

      <div className="results-buddy">
        <p className="speech reveal pop" style={later(200)}>
          {buddySays(lesson, result.stars, next !== undefined)}
        </p>
        <Seal size={160} mood={done && result.stars >= 2 ? 'happy' : 'idle'} salto={salto} />
      </div>
      <p className="small results-hint">Druk op Enter om {next ? 'door te gaan' : 'het nog een keer te doen'}</p>
    </section>
  )
}

function RoundButton({
  label,
  onClick,
  primary = false,
  style,
  children,
}: {
  label: string
  onClick: () => void
  primary?: boolean
  style?: CSSProperties
  children: ReactNode
}) {
  return (
    <div className="round-button-wrap reveal pop" style={style}>
      <button
        className={`round-button ${primary ? 'primary' : ''}`}
        onClick={() => {
          play('tap')
          onClick()
        }}
        aria-label={label}
      >
        {children}
      </button>
      <span>{label}</span>
    </div>
  )
}
