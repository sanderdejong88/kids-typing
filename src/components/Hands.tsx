import type { ReactNode } from 'react'
import { fingerFor, shiftFor, type Finger } from '../lib/keyboard'

type Props = {
  // Keys to point out; their fingers light up with the letter above the fingertip
  keys: string[]
  // Keys she has just pressed, shown with a little bounce
  pressed?: string[]
  // Shown between the two hands
  children?: ReactNode
}

type Shape = { finger: Finger; x: number; y: number; w: number; h: number; rotate?: number; home: string }

// Our own drawing of a left hand seen from above, palm down; the right hand is its mirror image.
const LEFT: Shape[] = [
  { finger: 'left-pinky', x: 30, y: 92, w: 32, h: 80, home: 'A' },
  { finger: 'left-ring', x: 66, y: 56, w: 34, h: 114, home: 'S' },
  { finger: 'left-middle', x: 104, y: 40, w: 34, h: 128, home: 'D' },
  { finger: 'left-index', x: 142, y: 60, w: 34, h: 108, home: 'F' },
  { finger: 'thumb', x: 133, y: 156, w: 34, h: 74, rotate: 62, home: '' },
]

const WIDTH = 250
const PALM = { x: 30, y: 128, w: 146, h: 122 }

function mirror(shape: Shape): Shape {
  return {
    ...shape,
    finger: shape.finger.replace('left', 'right') as Finger,
    x: WIDTH - shape.x - shape.w,
    rotate: shape.rotate && -shape.rotate,
    home: { A: ';', S: 'L', D: 'K', F: 'J' }[shape.home] ?? '',
  }
}

const RIGHT = LEFT.map(mirror)

function Hand({ shapes, palmX, keys, pressed, label }: {
  shapes: Shape[]
  palmX: number
  keys: string[]
  pressed: string[]
  label: string
}) {
  const keysFor = (finger: Finger) => keys.filter((key) => fingerFor(key) === finger)
  // Capitals typed with the other hand need this finger on Shift
  const shiftsFor = (finger: Finger) => keys.filter((key) => shiftFor(key)?.finger === finger)
  return (
    <svg viewBox={`0 0 ${WIDTH} 260`} className="hand" role="img" aria-label={label}>
      <rect x={palmX} y={PALM.y} width={PALM.w} height={PALM.h} rx="52" className="palm" />
      {shapes.map((shape) => {
        const fingerKeys = keysFor(shape.finger)
        const shiftKeys = shiftsFor(shape.finger)
        const active = fingerKeys.length > 0 || shiftKeys.length > 0
        const bounce = [...fingerKeys, ...shiftKeys].some((key) => pressed.includes(key))
        const cx = shape.x + shape.w / 2
        // Fingers turn around their base, so the thumb can point sideways
        const turn = shape.rotate ? `rotate(${shape.rotate} ${cx} ${shape.y + shape.h})` : undefined
        // The outer group turns the thumb sideways; the inner one is free for CSS animations,
        // which would otherwise replace the turn
        return (
          <g key={shape.finger} transform={turn}>
            <g className={`hand-finger finger-${shape.finger} ${active ? 'active' : ''} ${bounce ? 'bounce' : ''}`}>
              <rect x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={shape.w / 2} className="finger-shape" />
              <rect x={shape.x + 6} y={shape.y + 26} width={5} height={Math.max(shape.h - 62, 8)} rx={2.5} className="finger-glint" />
              <ellipse cx={cx} cy={shape.y + 14} rx={9} ry={10} className="nail" />
              {shape.home && (
                <text x={cx} y={shape.y + shape.h - 26} className="home-key">
                  {shape.home}
                </text>
              )}
              {active && (
                <g className="tip-label" transform={turn && `rotate(${-shape.rotate!} ${cx} ${shape.y - 24})`}>
                  <circle cx={cx} cy={shape.y - 24} r={20} />
                  <text x={cx} y={shape.y - 16}>
                    {fingerKeys.map((key) => (key === ' ' ? '␣' : key.toUpperCase())).join('')}
                    {shiftKeys.length > 0 && '⇧'}
                  </text>
                </g>
              )}
            </g>
          </g>
        )
      })}
    </svg>
  )
}

// The hands take the height the screen has left (see .hands in index.css)
export function Hands({ keys, pressed = [], children }: Props) {
  return (
    <div className="hands">
      <Hand shapes={LEFT} palmX={PALM.x} keys={keys} pressed={pressed} label="Linkerhand" />
      {children}
      <Hand shapes={RIGHT} palmX={WIDTH - PALM.x - PALM.w} keys={keys} pressed={pressed} label="Rechterhand" />
    </div>
  )
}
