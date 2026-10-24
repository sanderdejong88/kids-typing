// Playground for the mascot: every mood and move side by side, to try and tune them
import { useEffect, useState } from 'react'
import { LevelMap } from '../components/LevelMap'
import { Seal, type Mood, type Pose } from '../components/Seal'
import { LESSONS } from '../lib/lessons'
import type { BestStars } from '../lib/progress'

const moods: { value: Mood; label: string }[] = [
  { value: 'idle', label: 'Rustig' },
  { value: 'happy', label: 'Blij' },
  { value: 'oops', label: 'Oeps' },
]

// Stars for every lesson before `number`, so the map shows the moment that lesson opens
const doneUpTo = (number: number): BestStars =>
  Object.fromEntries(LESSONS.filter((l) => l.number < number).map((l) => [l.id, 3]))

// The map right after finishing a lesson: the seal travels from it to the lesson it opened
const trips = [
  { label: 'Naar les 3', before: doneUpTo(2), after: doneUpTo(3) },
  {
    label: 'Naar eiland 2',
    before: doneUpTo(LESSONS.find((l) => l.island === 1)!.number - 1),
    after: doneUpTo(LESSONS.find((l) => l.island === 1)!.number),
  },
]

export function SealLab() {
  const [trip, setTrip] = useState<(typeof trips)[number]>()

  useEffect(() => {
    document.body.dataset.screen = trip ? 'home' : 'lab'
  }, [trip])

  if (trip) {
    return (
      <div className="app">
        <button className="lab-chip lab-back" onClick={() => setTrip(undefined)}>
          Terug naar de speeltuin
        </button>
        <section className="home">
          <LevelMap best={trip.after} before={trip.before} onStart={() => {}} />
        </section>
      </div>
    )
  }

  return <Playground onTrip={setTrip} />
}

function Playground({ onTrip }: { onTrip: (trip: (typeof trips)[number]) => void }) {
  const [mood, setMood] = useState<Mood>('idle')
  const [pose, setPose] = useState<Pose>('sit')
  // A new key replays a one-off move such as "oops"
  const [replay, setReplay] = useState(0)

  return (
    <main className="lab">
      <h1>Zeehond-speeltuin</h1>

      <div className="lab-stage">
        <Seal key={replay} size={300} mood={mood} pose={pose} />
      </div>

      <div className="lab-row">
        {moods.map((m) => (
          <button
            key={m.value}
            className={`lab-chip ${mood === m.value ? 'on' : ''}`}
            onClick={() => {
              setMood(m.value)
              setReplay((n) => n + 1)
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="lab-row">
        {(['sit', 'swim'] as const).map((p) => (
          <button key={p} className={`lab-chip ${pose === p ? 'on' : ''}`} onClick={() => setPose(p)}>
            {p === 'sit' ? 'Zitten' : 'Zwemmen'}
          </button>
        ))}
      </div>

      <div className="lab-row">
        <span>Op reis over de kaart:</span>
        {trips.map((t) => (
          <button key={t.label} className="lab-chip" onClick={() => onTrip(t)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="lab-row lab-sizes">
        <Seal size={52} still />
        <Seal size={64} mood={mood} pose={pose} />
        <Seal size={96} mood={mood} pose={pose} />
      </div>
    </main>
  )
}
