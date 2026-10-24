import type { ReactNode } from 'react'
import type { Certificates } from '../lib/awards'
import { DAY_GOAL_MS } from '../lib/days'
import type { Lesson } from '../lib/lessons'
import { play } from '../lib/sound'
import { Art } from './Art'
import { BeachBall } from './Seal'

type Props = {
  daily: Lesson
  // Typing time today, for the ring around the daily practice (REQUIREMENTS M2)
  todayMs: number
  onDaily: () => void
  onGame: (game: 'balloons' | 'ball') => void
  certificates: Certificates
  onCertificate: (level: number) => void
}

const R = 40
const CIRCUMFERENCE = 2 * Math.PI * R

// Big round buttons beside the map, like the side buttons in Duolingo: the daily practice
// with a ring that fills up to the daily goal, the two games and her certificates
export function Dock({ daily, todayMs, onDaily, onGame, certificates, onCertificate }: Props) {
  const share = Math.min(todayMs / DAY_GOAL_MS, 1)
  const done = share >= 1
  const minutes = Math.floor(todayMs / 60_000)
  const levels = Object.keys(certificates).map(Number)
  const highest = Math.max(...levels)

  return (
    <nav className="dock" aria-label="Oefenen en spelen">
      <DockButton
        label="Oefen vandaag"
        sub={done ? 'dagdoel gehaald!' : `${minutes} van ${DAY_GOAL_MS / 60_000} minuten`}
        className={done ? 'dock-daily done' : 'dock-daily'}
        onClick={onDaily}
      >
        <svg viewBox="0 0 100 100" className="dock-ring" aria-hidden="true">
          <circle cx="50" cy="50" r={R} className="dock-ring-track" />
          <circle
            cx="50"
            cy="50"
            r={R}
            className="dock-ring-fill"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - share)}
          />
        </svg>
        <span className="dock-keys">{daily.newKeys.map((key) => key.toUpperCase()).join(' ')}</span>
      </DockButton>

      <DockButton label="Ballonnen" sub="spelletje" className="dock-game" onClick={() => onGame('balloons')}>
        <Art name="balloon" size={48} />
      </DockButton>

      <DockButton label="Hooghouden" sub="spelletje" className="dock-ball" onClick={() => onGame('ball')}>
        <BeachBall className="dock-ball-art" />
      </DockButton>

      {levels.length > 0 && (
        <DockButton
          label={highest >= 120 ? 'Diploma' : 'Oorkonde'}
          sub={`${highest} apm`}
          className="dock-award"
          onClick={() => onCertificate(highest)}
        >
          <Art name="diploma" size={48} />
        </DockButton>
      )}
    </nav>
  )
}

function DockButton({
  label,
  sub,
  className,
  onClick,
  children,
}: {
  label: string
  sub: string
  className: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <div className="dock-item">
      <button
        className={`dock-button ${className}`}
        onClick={() => {
          play('tap')
          onClick()
        }}
        aria-label={`${label}, ${sub}`}
      >
        {children}
      </button>
      <span className="dock-label">
        {label}
        <small>{sub}</small>
      </span>
    </div>
  )
}
