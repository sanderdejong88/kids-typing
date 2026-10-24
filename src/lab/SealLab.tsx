// Playground for the mascot: every mood and move side by side, to try and tune them
import { useState } from 'react'
import { Seal, type Mood } from '../components/Seal'

const moods: { value: Mood; label: string }[] = [
  { value: 'idle', label: 'Rustig' },
  { value: 'happy', label: 'Blij' },
  { value: 'oops', label: 'Oeps' },
]

export function SealLab() {
  const [mood, setMood] = useState<Mood>('idle')
  // A new key replays a one-off move such as "oops"
  const [replay, setReplay] = useState(0)

  return (
    <main className="lab">
      <h1>Zeehond-speeltuin</h1>

      <div className="lab-stage">
        <Seal key={replay} size={300} mood={mood} />
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

      <div className="lab-row lab-sizes">
        <Seal size={52} still />
        <Seal size={64} mood={mood} />
        <Seal size={96} mood={mood} />
      </div>
    </main>
  )
}
