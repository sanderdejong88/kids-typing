import { useEffect, useRef, useState } from 'react'
import { ISLANDS, LESSONS, isUnlocked, type Lesson } from '../lib/lessons'
import { Art, type ArtName } from './Art'
import { Hippo } from './Hippo'

type Props = {
  best: Record<string, number>
  onStart: (lesson: Lesson) => void
}

// The map is laid out in a 600-unit wide coordinate space and scales with the screen.
// Level 1 sits at the top and the path winds downwards, towards the trophy.
const WIDTH = 600
const STEP = 145
const ISLAND_GAP = 170
const MARGIN = 110
const DECOR: ArtName[] = ['palm-tree', 'gift', 'shell', 'fish', 'lotus', 'island', 'dolphin']

type Point = { x: number; y: number }

function layout() {
  let height = MARGIN
  const nodes: (Point & { lesson: Lesson })[] = []
  const banners: (Point & { island: number })[] = []
  for (const lesson of LESSONS) {
    const firstOfIsland = nodes.length === 0 || nodes[nodes.length - 1].lesson.island !== lesson.island
    if (firstOfIsland) {
      banners.push({ x: WIDTH / 2, y: height, island: lesson.island })
      height += ISLAND_GAP
    }
    nodes.push({ x: WIDTH / 2 + 170 * Math.sin(lesson.number * 0.85), y: height, lesson })
    height += STEP
  }
  const finish = { x: WIDTH / 2, y: height }
  height += MARGIN
  return { height, nodes, banners, finish }
}

const MAP = layout()

// A smooth curve through the points (Catmull-Rom turned into cubic Béziers)
function smoothPath(points: Point[]): string {
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 }
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 }
    d += ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`
  }
  return d
}

const PATH = smoothPath([MAP.banners[0], ...MAP.nodes, MAP.finish])

const at = (p: Point) => ({ left: `${(p.x / WIDTH) * 100}%`, top: `${(p.y / MAP.height) * 100}%` })

export function LevelMap({ best, onStart }: Props) {
  const current = LESSONS.find((lesson) => isUnlocked(lesson, best) && (best[lesson.id] ?? 0) < 2)
  const currentRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: 'center' })
  }, [])

  return (
    <div className="map" style={{ aspectRatio: `${WIDTH} / ${MAP.height}` }}>
      <svg className="map-path" viewBox={`0 0 ${WIDTH} ${MAP.height}`} aria-hidden="true">
        <path d={PATH} className="path-edge" />
        <path d={PATH} className="path-road" />
        <path d={PATH} className="path-dash" />
      </svg>

      {MAP.nodes.map(({ x, y, lesson }, i) => (
        <Art
          key={`decor-${lesson.id}`}
          name={DECOR[i % DECOR.length]}
          size={i % 3 === 0 ? 64 : 48}
          className="map-decor"
          style={{
            ...at({ x: x > WIDTH / 2 ? 75 + (i % 2) * 40 : WIDTH - 75 - (i % 2) * 40, y: y + 20 }),
            animationDelay: `${(i % 4) * 0.4}s`,
          }}
        />
      ))}

      {MAP.banners.map((banner) => (
        <div key={banner.island} className="map-banner" style={at(banner)}>
          <span className="map-banner-island">Eiland {banner.island + 1}</span>
          {ISLANDS[banner.island].name}
        </div>
      ))}

      <div className="map-finish" style={at(MAP.finish)}>
        <Art name="trophy" size={72} />
      </div>

      {MAP.nodes.map(({ x, y, lesson }) => {
        const unlocked = isUnlocked(lesson, best)
        const earned = best[lesson.id] ?? 0
        const isCurrent = lesson === current
        const state = isCurrent ? 'current' : unlocked ? 'open' : 'locked'
        return (
          <div key={lesson.id} className={`level ${state}`} style={at({ x, y })}>
            {isCurrent ? (
              <MapHippo />
            ) : !unlocked ? null : (
              <div className="level-stars" aria-hidden="true">
                {[1, 2, 3].map((n) => (
                  <Art key={n} name="star" size={22} className={n <= earned ? 'star on' : 'star off'} />
                ))}
              </div>
            )}
            <button
              ref={isCurrent ? currentRef : undefined}
              className="level-node"
              disabled={!unlocked}
              onClick={() => onStart(lesson)}
              aria-label={`Les ${lesson.number}${unlocked ? '' : ', nog op slot'}`}
            >
              {!unlocked ? (
                <Art name="lock" size={30} />
              ) : lesson.review ? (
                <Art name="gift" size={36} />
              ) : (
                lesson.number
              )}
            </button>
            <span className="level-keys">
              {lesson.review
                ? 'herhaling'
                : lesson.newKeys.map((key) => key.toUpperCase()).join(' ')}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// The hippo waits at the next lesson; click it and it hops for joy
function MapHippo() {
  const [happy, setHappy] = useState(false)
  useEffect(() => {
    if (!happy) return
    const timer = setTimeout(() => setHappy(false), 1400)
    return () => clearTimeout(timer)
  }, [happy])
  return (
    <button className="map-hippo" onClick={() => setHappy(true)} aria-label="Nijlpaard, klik voor een sprongetje">
      <Hippo size={96} mood={happy ? 'happy' : 'idle'} />
    </button>
  )
}
