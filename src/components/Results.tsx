import { resultFor, type Attempt } from '../lib/attempt'
import type { Lesson } from '../lib/lessons'
import { Art } from './Art'

type Props = {
  lesson: Lesson
  attempt: Attempt
  onAgain: () => void
  onHome: () => void
}

const PRAISE = ['Goed gedaan!', 'Super!', 'Fantastisch, wat knap!']

export function Results({ lesson, attempt, onAgain, onHome }: Props) {
  const result = resultFor(lesson, attempt)
  return (
    <section className="results">
      <Art name="party-popper" size={64} className="pop" />
      <h2>{PRAISE[result.stars - 1]}</h2>
      <div className="stars" aria-label={`${result.stars} van de 3 sterren`}>
        {[1, 2, 3].map((n) => (
          <Art key={n} name="star" size={72} className={n <= result.stars ? 'star on' : 'star off'} />
        ))}
      </div>
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
      {result.stars < 3 && (
        <p className="tip">
          {result.accuracy < 95
            ? 'Tip: rustig aan, eerst goed en dan pas snel.'
            : `Tip: haal ${lesson.goalApm} aanslagen per minuut voor de derde ster.`}
        </p>
      )}
      <div className="buttons">
        <button className="button primary" onClick={onAgain}>
          Nog een keer
        </button>
        <button className="button" onClick={onHome}>
          Naar de lessen
        </button>
      </div>
    </section>
  )
}
