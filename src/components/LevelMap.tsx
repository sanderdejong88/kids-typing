import { useEffect, useRef, useState } from 'react'
import { ISLANDS, LESSONS, isUnlocked, type Lesson } from '../lib/lessons'
import { Art, type ArtName } from './Art'
import { Hippo } from './Hippo'

type Props = {
  best: Record<string, number>
  onStart: (lesson: Lesson) => void
}

// The map is laid out in a 600-unit wide coordinate space and scales with the screen.
// Every island is a round piece of land that fits on one screen. Its lessons lie in a
// ring around the island's name; dots lead across the water to the next island.
// Level 1 sits at the top, the trophy waits at the bottom.
const WIDTH = 600
const CENTER = WIDTH / 2
const ISLAND_RX = 215
const ISLAND_RY = 240
const RING_RX = 150
const RING_RY = 160
// The ring is open at the top: the road enters top-left and leaves top-right
// (or the other way round on every second island)
const RING_SWEEP = 300
const WATER = 150
const MARGIN = 70
const FINISH_RADIUS = 85
// The dots run past the island in the water, on this distance from the middle
const SIDE_LANE = 262
const LAND_DECOR: ArtName[] = ['palm-tree', 'shell', 'lotus', 'gift']
const SEA_DECOR: ArtName[] = ['dolphin', 'fish']

type Point = { x: number; y: number }
type Stop = Point & { lesson: Lesson }
type IslandLayout = { index: number; center: Point; top: number; bottom: number; nodes: Stop[] }

const radians = (degrees: number) => (degrees * Math.PI) / 180

function layout() {
  let height = MARGIN
  const islands: IslandLayout[] = []
  ISLANDS.forEach((_, index) => {
    const center = { x: CENTER, y: height + ISLAND_RY }
    const lessons = LESSONS.filter((l) => l.island === index)
    // Even islands go round anticlockwise from top-left, odd ones clockwise from top-right
    const turn = index % 2 === 0 ? -1 : 1
    const start = index % 2 === 0 ? -120 : -60
    const nodes = lessons.map((lesson, k) => {
      const angle = radians(start + (turn * k * RING_SWEEP) / (lessons.length - 1))
      return { x: center.x + RING_RX * Math.cos(angle), y: center.y + RING_RY * Math.sin(angle), lesson }
    })
    islands.push({ index, center, top: height, bottom: height + 2 * ISLAND_RY, nodes })
    height += 2 * ISLAND_RY + WATER
  })
  const finish = { x: CENTER, y: height + FINISH_RADIUS - 30 }
  height = finish.y + FINISH_RADIUS + MARGIN
  return { height, islands, finish }
}

const MAP = layout()

// Catmull-Rom curve from points[i] to points[i + 1], as one cubic Bézier.
// With wrap the points form a closed loop.
function curve(points: Point[], i: number, wrap = false): string {
  const n = points.length
  const get = (j: number) => (wrap ? points[(j + n) % n] : points[Math.min(Math.max(j, 0), n - 1)])
  const [p0, p1, p2, p3] = [get(i - 1), get(i), get(i + 1), get(i + 2)]
  const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 }
  const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 }
  return ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`
}

function closedPath(points: Point[]): string {
  return `M ${points[0].x} ${points[0].y}` + points.map((_, i) => curve(points, i, true)).join('') + ' Z'
}

function openPath(points: Point[]): string {
  return `M ${points[0].x} ${points[0].y}` + points.slice(1).map((_, i) => curve(points, i)).join('')
}

// A wobbly round coastline, the same every time
function coastline(center: Point, rx: number, ry: number, seed: number): string {
  const points = Array.from({ length: 14 }, (_, k) => {
    const angle = (k / 14) * 2 * Math.PI
    const wobble = 1 - 0.05 * (1 + Math.sin(k * 2.1 + seed * 2.3))
    return { x: center.x + rx * wobble * Math.cos(angle), y: center.y + ry * wobble * Math.sin(angle) }
  })
  return closedPath(points)
}

// The road around each island, and the dotted trail from its last lesson,
// past its side in the water, to the first lesson of the next island
const ROADS = MAP.islands.map(({ nodes }) => openPath(nodes))
const CROSSINGS = MAP.islands.map(({ index, center, nodes }) => {
  const last = nodes[nodes.length - 1]
  const side = index % 2 === 0 ? 1 : -1
  const next = MAP.islands[index + 1]?.nodes[0] ?? MAP.finish
  // The lesson before the last one only steers the first bend, so the trail
  // leaves in the direction the road was going
  const points = [nodes[nodes.length - 2], last, ...[-60, 160].map((dy) => ({ x: center.x + side * SIDE_LANE, y: center.y + dy })), next]
  return `M ${last.x} ${last.y}` + points.slice(1, -1).map((_, i) => curve(points, i + 1)).join('')
})

// Every piece of land (the islands, then the trophy island) with the roads on it.
// The crossings are drawn as road too, cut off at the coast, so the road
// runs down to the beach and the dots carry on over the water.
const LANDS = [
  ...MAP.islands.map((island) => coastline(island.center, ISLAND_RX, ISLAND_RY, island.index)),
  coastline(MAP.finish, FINISH_RADIUS, FINISH_RADIUS, 9),
].map((coast, i) => ({
  coast,
  roads: [ROADS[i], CROSSINGS[i - 1], CROSSINGS[i]].filter((d) => d !== undefined),
}))

const at = (p: Point) => ({ left: `${(p.x / WIDTH) * 100}%`, top: `${(p.y / MAP.height) * 100}%` })

export function LevelMap({ best, onStart }: Props) {
  const current = LESSONS.find((lesson) => isUnlocked(lesson, best) && (best[lesson.id] ?? 0) < 2)
  const currentIsland = useRef<HTMLDivElement>(null)
  // An island opens together with its first lesson; the trophy once every lesson is done
  const open = MAP.islands.map((island) => isUnlocked(island.nodes[0].lesson, best))
  const allDone = LESSONS.every((lesson) => (best[lesson.id] ?? 0) >= 2)
  const locked = (isOpen: boolean) => (isOpen ? '' : ' locked')

  // Show the whole island she is on
  useEffect(() => {
    currentIsland.current?.scrollIntoView({ block: 'center' })
  }, [])

  return (
    <div className="map" style={{ aspectRatio: `${WIDTH} / ${MAP.height}` }}>
      <svg className="map-path" viewBox={`0 0 ${WIDTH} ${MAP.height}`} aria-hidden="true">
        <defs>
          {LANDS.map((land, i) => (
            <clipPath key={i} id={`coast-${i}`}>
              <path d={land.coast} />
            </clipPath>
          ))}
        </defs>

        {/* The dots go under the land, so they only show on the water */}
        {CROSSINGS.map((d, i) => (
          <path key={i} d={d} className={'crossing' + locked(open[i + 1] ?? allDone)} />
        ))}

        {LANDS.map((land, i) => (
          <g key={i} className={'land' + locked(open[i] ?? allDone)}>
            <path d={land.coast} className="land-shallow" />
            <path d={land.coast} className="land-sand" />
            <path d={land.coast} className="land-grass" />
            <g clipPath={`url(#coast-${i})`}>
              {land.roads.map((d, k) => (
                <g key={k}>
                  <path d={d} className="path-edge" />
                  <path d={d} className="path-road" />
                  <path d={d} className="path-dash" />
                </g>
              ))}
            </g>
          </g>
        ))}
      </svg>

      {MAP.islands.flatMap(({ index, center }) =>
        [-1, 1].map((side) => (
          <Art
            key={`decor-${index}-${side}`}
            name={LAND_DECOR[(2 * index + (side + 1) / 2) % LAND_DECOR.length]}
            size={side < 0 ? 52 : 44}
            className={'map-decor' + locked(open[index])}
            style={{
              ...at({ x: center.x, y: center.y + side * 92 }),
              animationDelay: `${index * 0.4 + side * 0.3}s`,
            }}
          />
        )),
      )}

      {MAP.islands.map(({ index, bottom }) => (
        <Art
          key={`sea-${index}`}
          name={SEA_DECOR[index % SEA_DECOR.length]}
          size={52}
          className="map-decor"
          style={{
            ...at({ x: index % 2 ? WIDTH - 70 : 70, y: bottom + WATER / 2 }),
            animationDelay: `${index * 0.5}s`,
          }}
        />
      ))}

      {MAP.islands.map(({ index, center, nodes }) => (
        <div
          key={index}
          ref={current?.island === index ? currentIsland : undefined}
          className={'map-banner' + locked(open[index])}
          style={at(center)}
        >
          <span className="map-banner-island">
            {!open[index] && <Art name="lock" size={16} />}
            Eiland {index + 1}
          </span>
          {ISLANDS[index].name}
          <span className="map-banner-count">{nodes.length} lessen</span>
        </div>
      ))}

      <div className={'map-finish' + locked(allDone)} style={at(MAP.finish)}>
        <Art name="trophy" size={72} />
      </div>

      {MAP.islands
        .flatMap((island) => island.nodes)
        .map(({ x, y, lesson }) => {
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
