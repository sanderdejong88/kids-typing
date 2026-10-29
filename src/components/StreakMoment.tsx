import { useEffect, useState, type CSSProperties } from 'react'
import { MILESTONES, cameBack, streak, streakBefore, week, type Days } from '../lib/days'
import { play } from '../lib/sound'
import { Art } from './Art'
import { Confetti } from './Confetti'
import { Seal } from './Seal'

type Props = {
  days: Days
  onDone: () => void
}

// What Snuf says at a milestone (REQUIREMENTS M3)
const MILESTONE_SAYS: Record<number, string> = {
  3: 'Drie dagen op rij! Je bent goed op dreef.',
  7: 'Een hele week! Wauw, wat zet jij door.',
  14: 'Twee weken op rij! Je vingers worden echte typ-vingers.',
  30: 'Een hele maand! Jij bent een typ-held.',
  50: 'Vijftig dagen! Dat is echt heel knap.',
  100: 'Honderd dagen! Jij bent een legende.',
}

// The flame catches, the count goes up, today's flame lights up in the week, then Snuf talks
const CATCH_MS = 500
const COUNT_MS = 900
const TODAY_MS = 1150
const TALK_MS = 1400
const SPARKS = 10

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// After the first lesson of the day, like Duolingo's streak screen: one big moment a day,
// so the flame stays special. A broken streak gets a warm welcome back, not a lost count.
export function StreakMoment({ days, onDone }: Props) {
  const count = streak(days)
  const from = streakBefore(days)
  const back = cameBack(days)
  const milestone = MILESTONES.includes(count) && count > from
  const upcoming = MILESTONES.find((m) => m > count)

  const [phase, setPhase] = useState(() => (reducedMotion() ? 4 : 0))
  useEffect(() => {
    if (reducedMotion()) return
    const timers = [
      setTimeout(() => {
        setPhase(1)
        play('flame')
      }, CATCH_MS),
      setTimeout(() => {
        setPhase(2)
        play('tick', count)
      }, COUNT_MS),
      setTimeout(() => setPhase(3), TODAY_MS),
      setTimeout(() => {
        setPhase(4)
        if (milestone) play('complete')
      }, TALK_MS),
    ]
    return () => timers.forEach(clearTimeout)
  }, [count, milestone])

  // A somersault for a milestone
  const [salto, setSalto] = useState(false)
  useEffect(() => {
    if (phase < 4 || !milestone) return
    const timers = [setTimeout(() => setSalto(true), 200), setTimeout(() => setSalto(false), 1200)]
    return () => timers.forEach(clearTimeout)
  }, [phase, milestone])

  // Space or Enter goes on, once the flame is lit, so a space typed after the last word doesn't skip it
  const done = phase >= 4
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === ' ' || event.key === 'Enter' || event.key === 'Escape') {
        event.preventDefault()
        if (done && !event.repeat) onDone()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [done, onDone])

  const shown = phase >= 2 ? count : from
  // The number already says how many days, so the title says what it means
  const title = count === 1 ? (back ? 'Welkom terug!' : 'Je eerste vlammetje!') : milestone ? 'Hoera, een mijlpaal!' : 'Je vlam brandt!'
  const says = milestone
    ? MILESTONE_SAYS[count]
    : back
      ? 'Fijn dat je er weer bent! Vandaag brandt je vlam weer. Kom morgen terug, dan worden het er 2.'
      : count === 1
        ? 'Elke dag dat je oefent, brandt je vlam. Kom morgen terug, dan worden het er 2! Een dagje overslaan mag.'
        : `Kom morgen terug, dan worden het er ${count + 1}!`
  const after = (ms: number): CSSProperties => ({ animationDelay: `${reducedMotion() ? 0 : ms}ms` })

  return (
    <section className={milestone ? 'streak milestone' : 'streak'}>
      <Confetti fire={phase >= 4 ? 1 : 0} amount={milestone ? 220 : 70} />

      <div className="streak-card">
        <div className={phase >= 1 ? 'streak-flame lit' : 'streak-flame'}>
          {phase >= 1 && (
            <>
              <span className="burst streak-burst" />
              {Array.from({ length: SPARKS }, (_, k) => (
                <span key={k} className="spark streak-spark" style={{ '--angle': `${(k * 360) / SPARKS}deg` } as CSSProperties} />
              ))}
            </>
          )}
          <Art name="fire" size={150} />
        </div>

        <p className="streak-count" aria-live="polite">
          <strong key={shown}>{shown}</strong>
          <span>{count === 1 ? 'dag op rij' : 'dagen op rij'}</span>
        </p>

        <ol className="streak-week">
          {week(days).map((day, i) => {
            const lit = day.practised && (!day.today || phase >= 3)
            return (
              <li
                key={day.label}
                className={['streak-day', lit && 'lit', day.today && 'now', day.future && 'later'].filter(Boolean).join(' ')}
                style={after(200 + i * 60)}
              >
                <span className="streak-mark">{lit && <Art name="fire" size={26} />}</span>
                {day.label}
              </li>
            )
          })}
        </ol>

        <h2 className="reveal pop" style={after(TALK_MS)}>
          {title}
        </h2>
        {upcoming && (
          <p className="streak-next reveal" style={after(TALK_MS + 200)}>
            Nog {upcoming - count} {upcoming - count === 1 ? 'dag' : 'dagen'} tot {upcoming} op rij
          </p>
        )}

        <button className="button primary reveal pop" style={after(TALK_MS + 400)} onClick={onDone}>
          Verder (spatiebalk)
        </button>
      </div>

      <div className="streak-buddy reveal" style={after(TALK_MS + 100)}>
        <p className="speech">{says}</p>
        <Seal size={140} mood={done ? 'happy' : 'idle'} salto={salto} />
      </div>
    </section>
  )
}
