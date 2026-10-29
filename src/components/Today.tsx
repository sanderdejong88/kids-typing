import { streak, todayMs, type Days } from '../lib/days'
import { Art } from './Art'

// Her streak top right beside the stars, like Duolingo's flame in the top bar (REQUIREMENTS M2).
// The week shows on the streak screen after her first lesson, and the daily goal is the ring
// around the daily practice in the dock.
export function Today({ days }: { days: Days }) {
  const count = streak(days)
  // Like Duolingo's flame: it only burns once she has practised today, so the home screen
  // reminds her instead of a push message
  const lit = todayMs(days) > 0
  const state = count === 0 ? 'off' : lit ? '' : 'waiting'

  return (
    <span
      className={`today ${state}`}
      key={count}
      aria-label={`${count} ${count === 1 ? 'dag' : 'dagen'} op rij geoefend, ${lit ? 'vandaag gelukt' : 'vandaag nog niet'}`}
    >
      <Art name="fire" size={28} />
      {count}
      {state === 'waiting' && <span className="today-status">nog niet vandaag</span>}
    </span>
  )
}
