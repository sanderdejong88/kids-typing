import { useEffect, type ReactNode } from 'react'
import { combine, resultFor, type Attempt } from '../lib/attempt'
import type { Lesson } from '../lib/lessons'
import { charactersPerMinute } from '../lib/stats'
import { Art, type ArtName } from './Art'
import { Hippo } from './Hippo'
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
}

const PRAISE = ['Goed gedaan!', 'Super!', 'Fantastisch, wat knap!']

// What Nijl says next to the card
function buddySays(stars: number, nextOpen: boolean): string {
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

// The stars land one by one, then the meter starts
const STAR_DELAY = 0.35
const METER_DELAY_MS = 1500

export function Results({ lesson, attempts, onAgain, next, onNext, onHome }: Props) {
  const result = resultFor(lesson, combine(attempts))
  const speeds = attempts.map((attempt) => charactersPerMinute(attempt.text.length, attempt.elapsedMs))
  const fastest = Math.max(...speeds, 1)
  const primary = onNext ?? onAgain

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

      <div className="panel">
        <div className="panel-stars" aria-label={`${result.stars} van de 3 sterren`}>
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={`panel-star ${n <= result.stars ? 'on' : 'off'}`}
              style={{ animationDelay: `${0.2 + (n - 1) * STAR_DELAY}s` }}
            >
              <Art name="star" size={n === 2 ? 96 : 76} />
              {n <= result.stars && <span className="burst" style={{ animationDelay: `${0.5 + (n - 1) * STAR_DELAY}s` }} />}
            </span>
          ))}
        </div>

        <h2>Les {lesson.number}</h2>
        <p className="panel-praise">{PRAISE[result.stars - 1]}</p>

        <SpeedMeter apm={result.apm} goalApm={lesson.goalApm} delayMs={METER_DELAY_MS} />

        <div className="panel-facts">
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
                <span className="round-bar-value">{apm}</span>
                <span className="round-bar-fill" style={{ height: `${(apm / fastest) * 100}%` }} />
                <span className="round-bar-label">ronde {i + 1}</span>
              </div>
            ))}
          </div>
        )}
        {speeds.length > 1 && speeds[speeds.length - 1] > speeds[0] && (
          <p className="tip">Je werd steeds sneller!</p>
        )}
        {!next && result.stars < 2 && (
          <p className="tip">Haal 2 sterren om de volgende les te openen. Rustig aan: eerst goed, dan snel.</p>
        )}

        <div className="panel-buttons">
          <RoundButton label="Kaart" onClick={onHome}>
            <Art name="island" size={34} />
          </RoundButton>
          <RoundButton label="Nog een keer" onClick={onAgain} primary={!next}>
            <svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true">
              <path d="M18 8a7 7 0 1 0 1.6 6" className="icon-line" />
              <path d="M19 3v5h-5" className="icon-line" />
            </svg>
          </RoundButton>
          {next && (
            <RoundButton label={`Les ${next.number}`} onClick={onNext!} primary>
              <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true">
                <path d="M5 5l7 7-7 7M12 5l7 7-7 7" className="icon-line" />
              </svg>
            </RoundButton>
          )}
        </div>
      </div>

      <div className="results-buddy">
        <p className="speech">{buddySays(result.stars, next !== undefined)}</p>
        <Hippo size={160} mood={result.stars >= 2 ? 'happy' : 'idle'} />
      </div>
      <p className="small results-hint">Druk op Enter om {next ? 'door te gaan' : 'het nog een keer te doen'}</p>
    </section>
  )
}

function RoundButton({
  label,
  onClick,
  primary = false,
  children,
}: {
  label: string
  onClick: () => void
  primary?: boolean
  children: ReactNode
}) {
  return (
    <div className="round-button-wrap">
      <button className={`round-button ${primary ? 'primary' : ''}`} onClick={onClick} aria-label={label}>
        {children}
      </button>
      <span>{label}</span>
    </div>
  )
}
