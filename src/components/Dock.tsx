import type { ReactNode } from 'react'
import type { Certificates } from '../lib/awards'
import { DAY_GOAL_MS } from '../lib/days'
import type { Lesson } from '../lib/lessons'
import { play } from '../lib/sound'
import { Art } from './Art'
import { BeachBall } from './Seal'

type Props = {
  daily: Lesson
  // Typing time today: the daily practice turns gold once the daily goal is met
  todayMs: number
  onDaily: () => void
  onGame: (game: 'balloons' | 'ball' | 'fish') => void
  certificates: Certificates
  onCertificate: (level: number) => void
}

// Big round buttons beside the map, like the side buttons in Duolingo: the daily practice,
// the three games and her certificates. Her progress has its own card (Today).
export function Dock({ daily, todayMs, onDaily, onGame, certificates, onCertificate }: Props) {
  const done = todayMs >= DAY_GOAL_MS
  const levels = Object.keys(certificates).map(Number)
  const highest = Math.max(...levels)

  return (
    <nav className="dock" aria-label="Oefenen en spelen">
      <DockButton
        label="Oefen vandaag"
        sub={done ? 'dagdoel gehaald!' : 'lastige letters'}
        className={done ? 'dock-daily done' : 'dock-daily'}
        onClick={onDaily}
      >
        <span className="dock-keys">{daily.newKeys.map((key) => key.toUpperCase()).join(' ')}</span>
      </DockButton>

      <DockButton label="Ballonnen" sub="spelletje" className="dock-game" onClick={() => onGame('balloons')}>
        <Art name="balloon" size={48} />
      </DockButton>

      <DockButton label="Hooghouden" sub="spelletje" className="dock-ball" onClick={() => onGame('ball')}>
        <BeachBall className="dock-ball-art" />
      </DockButton>

      <DockButton label="Vissen vangen" sub="spelletje" className="dock-fish" onClick={() => onGame('fish')}>
        <Art name="fish" size={48} />
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
