import { DAY_GOAL_MS, streak, todayMs, week, type Days } from '../lib/days'
import { Art } from './Art'

// Her progress in one place on the home screen, like Duolingo's streak panel: the days in a
// row, this week's flames and the daily goal (REQUIREMENTS M2). The dock beside the map only
// holds things to play.
export function Today({ days }: { days: Days }) {
  const count = streak(days)
  const share = Math.min(todayMs(days) / DAY_GOAL_MS, 1)
  const done = share >= 1
  const minutes = Math.floor(todayMs(days) / 60_000)

  return (
    <aside
      className="today"
      aria-label={`${count} dagen op rij geoefend, ${minutes} van ${DAY_GOAL_MS / 60_000} minuten vandaag`}
    >
      <div className={count > 0 ? 'today-streak' : 'today-streak off'} key={count}>
        <span className="today-count">
          <Art name="fire" size={30} />
          <strong>{count}</strong>
        </span>
        <span>{count === 1 ? 'dag op rij' : 'dagen op rij'}</span>
      </div>

      <div className="today-days">
        <ol className="today-week">
          {week(days).map((day, i) => (
            <li
              key={day.label}
              className={['today-day', day.practised && 'lit', day.today && 'now', day.future && 'later']
                .filter(Boolean)
                .join(' ')}
              style={{ animationDelay: `${0.15 + i * 0.06}s` }}
            >
              <span className="today-mark">{day.practised && <Art name="fire" size={18} />}</span>
              {day.label}
            </li>
          ))}
        </ol>

        <div className={done ? 'today-goal done' : 'today-goal'}>
          <div className="today-bar">
            <div className="today-bar-fill" style={{ width: `${share * 100}%` }} />
          </div>
          <span>{done ? 'dagdoel gehaald!' : `${minutes} van ${DAY_GOAL_MS / 60_000} min`}</span>
        </div>
      </div>
    </aside>
  )
}
