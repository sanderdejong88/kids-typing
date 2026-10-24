import { useEffect } from 'react'
import { combine, resultFor, type Attempt } from '../lib/attempt'
import type { Lesson } from '../lib/lessons'
import { charactersPerMinute } from '../lib/stats'
import { Art } from './Art'
import { Hippo } from './Hippo'

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
      <div className="results-hero">
        <Art name="party-popper" size={44} className="pop" />
        <Hippo size={100} mood={result.stars >= 2 ? 'happy' : 'idle'} />
        <Art name="party-popper" size={44} className="pop flip" />
      </div>
      <h2>{PRAISE[result.stars - 1]}</h2>
      <div className="stars" aria-label={`${result.stars} van de 3 sterren`}>
        {[1, 2, 3].map((n) => (
          <Art key={n} name="star" size={52} className={n <= result.stars ? 'star on' : 'star off'} />
        ))}
      </div>

      {next ? (
        <div className="next-card">
          <span>
            Les {next.number}:{' '}
            {next.review ? 'herhaling' : `nieuwe letters ${next.newKeys.map((key) => key.toUpperCase()).join(' ')}`}
          </span>
          <button className="button primary big" onClick={onNext}>
            Op naar de volgende! →
          </button>
        </div>
      ) : (
        result.stars < 2 && (
          <p className="tip">Haal 2 sterren om de volgende les te openen. Rustig aan: eerst goed, dan snel.</p>
        )
      )}

      <div className="scores">
        <div className="score">
          <span className="score-value">{result.accuracy}%</span>
          <span className="score-label">goed</span>
        </div>
        <div className="score">
          <span className="score-value">{result.apm}</span>
          <span className="score-label">aanslagen per minuut</span>
        </div>
        <div className="score">
          <span className="score-value">{result.wpm}</span>
          <span className="score-label">woorden per minuut</span>
        </div>
      </div>

      {/* Speed per round: the first round is always slow, so show how she warmed up */}
      <div className="round-bars" aria-label="Aanslagen per minuut per ronde">
        {speeds.map((apm, i) => (
          <div key={i} className="round-bar">
            <span className="round-bar-value">{apm}</span>
            <span className="round-bar-fill" style={{ height: `${(apm / fastest) * 100}%` }} />
            <span className="round-bar-label">ronde {i + 1}</span>
          </div>
        ))}
      </div>
      {speeds.length > 1 && speeds[speeds.length - 1] > speeds[0] && (
        <p className="tip">
          Je werd steeds sneller: van {speeds[0]} naar {speeds[speeds.length - 1]} aanslagen per minuut!
        </p>
      )}

      <div className="buttons">
        <button className={next ? 'button' : 'button primary big'} onClick={onAgain}>
          Nog een keer
        </button>
        <button className="link" onClick={onHome}>
          Naar de kaart
        </button>
      </div>
      <p className="small">Druk op Enter om {next ? 'door te gaan' : 'het nog een keer te doen'}</p>
    </section>
  )
}
