import { useEffect, useState } from 'react'

type Props = {
  apm: number
  goalApm: number
  // Waits until the stars have landed
  delayMs?: number
}

// The dial runs from 0 to one and a half times the goal, so the goal sits at two thirds
const ZONES = [
  { until: 0.6, color: 'var(--coral)', label: 'Nog wat langzaam' },
  { until: 1, color: 'var(--gold)', label: 'Goed op weg!' },
  { until: 1.5, color: 'var(--mint)', label: 'Supersnel!' },
]

const CX = 100
const CY = 100
const R = 78

// A point on the dial, 0 is far left and 1 is far right
function point(share: number, radius = R) {
  const angle = Math.PI * (1 - share)
  return { x: CX + radius * Math.cos(angle), y: CY - radius * Math.sin(angle) }
}

function arc(from: number, to: number) {
  const a = point(from)
  const b = point(to)
  return `M ${a.x} ${a.y} A ${R} ${R} 0 0 1 ${b.x} ${b.y}`
}

// Counts up from 0, like a scoreboard
function useCountUp(target: number, start: boolean) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target)
      return
    }
    const began = performance.now()
    let frame = requestAnimationFrame(function tick(now) {
      const t = Math.min((now - began) / 1200, 1)
      setValue(Math.round(target * (1 - (1 - t) ** 3)))
      if (t < 1) frame = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(frame)
  }, [target, start])
  return value
}

export function SpeedMeter({ apm, goalApm, delayMs = 0 }: Props) {
  const [started, setStarted] = useState(false)
  const shown = useCountUp(apm, started)
  const max = goalApm * 1.5
  const share = Math.min(apm / max, 1)
  const zone = ZONES.find((z) => apm / goalApm < z.until) ?? ZONES[ZONES.length - 1]
  const goal = point(1 / 1.5, R + 14)

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delayMs)
    return () => clearTimeout(timer)
  }, [delayMs])

  let from = 0
  return (
    <div className="meter" role="img" aria-label={`${apm} aanslagen per minuut, het doel is ${goalApm}`}>
      <svg viewBox="0 0 200 118">
        <path d={arc(0, 1)} className="meter-track" />
        {ZONES.map((z) => {
          const d = arc(from / 1.5, z.until / 1.5)
          from = z.until
          return <path key={z.until} d={d} className="meter-zone" style={{ stroke: z.color }} />
        })}
        <image href={`${import.meta.env.BASE_URL}art/flag.svg`} x={goal.x - 9} y={goal.y - 9} width="18" height="18" />
        <g className="meter-needle" style={{ rotate: `${started ? share * 180 - 90 : -90}deg` }}>
          <path d={`M ${CX - 6} ${CY} L ${CX} ${CY - R + 12} L ${CX + 6} ${CY} Z`} />
        </g>
        <circle cx={CX} cy={CY} r="11" className="meter-hub" />
      </svg>
      <div className="meter-value">
        <strong>{shown}</strong> aanslagen per minuut
      </div>
      <div className={`meter-verdict ${started ? 'show' : ''}`} style={{ background: zone.color }}>
        {zone.label}
      </div>
    </div>
  )
}
