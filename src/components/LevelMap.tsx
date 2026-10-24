import { useEffect, useRef, useState } from 'react'
import { ISLANDS, LESSONS, isUnlocked, type Lesson } from '../lib/lessons'
import { Art, type ArtName } from './Art'
import { Hippo } from './Hippo'

type Props = {
  best: Record<string, number>
  onStart: (lesson: Lesson) => void
}

// The map is laid out in a 600-unit wide coordinate space and scales with the screen
// (font sizes too, see .map in index.css), so one whole island always fits on the screen.
// Every island has its own road: a ring, a zigzag, a W, a spiral, a horseshoe and more. Dots lead across
// the water to the next island. Level 1 sits at the top, the trophy waits at the bottom.
const WIDTH = 600
const CENTER = WIDTH / 2
const ISLAND_RX = 215
const ISLAND_RY = 240
const WATER = 150
const MARGIN = 70
const FINISH_RADIUS = 85
// The dots run past the island in the water, on this distance from the middle
const SIDE_LANE = 262

type Point = { x: number; y: number }
type Stop = Point & { lesson: Lesson }
type House = Point & { color: string; flip?: boolean }

// One island's road and decoration, relative to the middle of the island.
// The sign holds the island's name, and Nijl's instruction on the island she is on.
type Plan = {
  route: Point[]
  sign: Point
  // Where the road leaves the island, through the water towards the next one
  exit: Point[]
  // Where the road from the previous island comes in
  entry: Point[]
  houses: House[]
  decor: (Point & { name: ArtName; size: number })[]
}

const ring = (count: number): Point[] =>
  Array.from({ length: count }, (_, k) => {
    const angle = ((-120 - (k * 300) / (count - 1)) * Math.PI) / 180
    return { x: 150 * Math.cos(angle), y: 160 * Math.sin(angle) }
  })

const PLANS: Plan[] = [
  // De thuisrij: a ring around the village square
  {
    route: ring(6),
    sign: { x: 0, y: 0 },
    entry: [],
    exit: [
      { x: SIDE_LANE, y: -60 },
      { x: SIDE_LANE, y: 160 },
    ],
    houses: [
      { x: -42, y: 92, color: '#ff8a65' },
      { x: 42, y: 88, color: '#7cb3ff', flip: true },
    ],
    decor: [
      { x: 0, y: -100, name: 'palm-tree', size: 46 },
      { x: -170, y: 150, name: 'shell', size: 34 },
    ],
  },
  // De bovenrij: a zigzag along two streets, with the sign at the bottom
  {
    route: [
      { x: 125, y: -150 },
      { x: -125, y: -150 },
      { x: -140, y: 0 },
      { x: 140, y: 0 },
    ],
    sign: { x: 0, y: 128 },
    entry: [{ x: 250, y: -215 }],
    exit: [
      { x: SIDE_LANE, y: 80 },
      { x: SIDE_LANE, y: 260 },
    ],
    houses: [
      { x: -55, y: -78, color: '#ffb74d' },
      { x: 0, y: -74, color: '#ef6f8f', flip: true },
      { x: 55, y: -78, color: '#8fd16a' },
    ],
    decor: [
      { x: -155, y: 110, name: 'palm-tree', size: 44 },
      { x: 160, y: 100, name: 'lotus', size: 34 },
    ],
  },
  // De onderrij: a big W, entered on the right and left on the left
  {
    route: [
      { x: 160, y: -30 },
      { x: 80, y: 130 },
      { x: 0, y: 30 },
      { x: -80, y: 130 },
      { x: -160, y: -30 },
    ],
    sign: { x: 0, y: -135 },
    entry: [{ x: SIDE_LANE, y: -110 }],
    exit: [
      { x: -SIDE_LANE, y: 70 },
      { x: -SIDE_LANE, y: 260 },
    ],
    houses: [
      { x: -82, y: 28, color: '#7cb3ff' },
      { x: 82, y: 28, color: '#ff8a65', flip: true },
    ],
    decor: [
      { x: 0, y: 170, name: 'palm-tree', size: 44 },
      { x: 150, y: -120, name: 'shell', size: 32 },
    ],
  },
  // De laatste letters: a spiral that ends in the middle
  {
    route: [
      { x: -160, y: -20 },
      { x: -60, y: 140 },
      { x: 100, y: 120 },
      { x: 140, y: -10 },
      { x: 20, y: 10 },
    ],
    sign: { x: 0, y: -140 },
    entry: [{ x: -SIDE_LANE, y: -110 }],
    exit: [{ x: 20, y: 300 }],
    houses: [
      { x: -62, y: 38, color: '#ef6f8f' },
      { x: 150, y: -95, color: '#ffb74d', flip: true },
    ],
    decor: [
      { x: -150, y: -100, name: 'palm-tree', size: 44 },
      { x: 175, y: 85, name: 'lotus', size: 32 },
    ],
  },
  // Hoofdletters: a horseshoe, open at the top, with the sign inside
  {
    route: [
      { x: -150, y: -120 },
      { x: -150, y: 50 },
      { x: 0, y: 155 },
      { x: 150, y: 50 },
      { x: 150, y: -120 },
    ],
    sign: { x: 0, y: -45 },
    entry: [{ x: -60, y: -280 }],
    exit: [
      { x: SIDE_LANE, y: -40 },
      { x: SIDE_LANE, y: 200 },
    ],
    houses: [
      { x: -55, y: 65, color: '#8fd16a' },
      { x: 55, y: 65, color: '#ef6f8f', flip: true },
    ],
    decor: [
      { x: 0, y: -175, name: 'palm-tree', size: 44 },
      { x: -175, y: 150, name: 'shell', size: 32 },
    ],
  },
  // Zinnetjes: a diamond around the sign
  {
    route: [
      { x: 0, y: -160 },
      { x: 165, y: 0 },
      { x: 0, y: 165 },
      { x: -165, y: 0 },
    ],
    sign: { x: 0, y: 0 },
    entry: [{ x: 200, y: -250 }],
    exit: [
      { x: -SIDE_LANE, y: 60 },
      { x: -SIDE_LANE, y: 260 },
    ],
    houses: [
      { x: 110, y: -110, color: '#7cb3ff' },
      { x: -105, y: 120, color: '#ffb74d', flip: true },
    ],
    decor: [
      { x: -110, y: -115, name: 'palm-tree', size: 44 },
      { x: 115, y: 120, name: 'lotus', size: 32 },
    ],
  },
  // Leestekens: the zigzag of the second island, the other way round
  {
    route: [
      { x: -125, y: -150 },
      { x: 125, y: -150 },
      { x: 140, y: 0 },
      { x: -140, y: 0 },
    ],
    sign: { x: 0, y: 128 },
    entry: [{ x: -250, y: -215 }],
    exit: [
      { x: -SIDE_LANE, y: 80 },
      { x: -SIDE_LANE, y: 260 },
    ],
    houses: [
      { x: -55, y: -78, color: '#ef6f8f' },
      { x: 0, y: -74, color: '#8fd16a', flip: true },
      { x: 55, y: -78, color: '#7cb3ff' },
    ],
    decor: [
      { x: 155, y: 110, name: 'palm-tree', size: 44 },
      { x: -160, y: 100, name: 'shell', size: 32 },
    ],
  },
  // Cijfers: a saw, up and down like a row of numbers
  {
    route: [
      { x: -160, y: 30 },
      { x: -96, y: -120 },
      { x: -32, y: 30 },
      { x: 32, y: -120 },
      { x: 96, y: 30 },
      { x: 160, y: -120 },
    ],
    sign: { x: 0, y: 135 },
    entry: [{ x: -SIDE_LANE, y: -80 }],
    exit: [
      { x: SIDE_LANE, y: -40 },
      { x: SIDE_LANE, y: 200 },
    ],
    houses: [
      { x: -32, y: -125, color: '#ffb74d' },
      { x: 96, y: -125, color: '#ef6f8f', flip: true },
    ],
    decor: [
      { x: -150, y: -110, name: 'palm-tree', size: 44 },
      { x: 165, y: 110, name: 'lotus', size: 32 },
    ],
  },
]

// An island without a plan of its own still gets a ring road, so a new island never breaks the map
const fallbackPlan = (count: number): Plan => ({
  route: ring(count),
  sign: { x: 0, y: 0 },
  entry: [],
  exit: [
    { x: SIDE_LANE, y: -60 },
    { x: SIDE_LANE, y: 160 },
  ],
  houses: [],
  decor: [],
})

type IslandLayout = { index: number; center: Point; top: number; bottom: number; plan: Plan; nodes: Stop[] }

function layout() {
  let height = MARGIN
  const islands: IslandLayout[] = []
  ISLANDS.forEach((_, index) => {
    const center = { x: CENTER, y: height + ISLAND_RY }
    const lessons = LESSONS.filter((l) => l.island === index)
    const plan = PLANS[index]?.route.length === lessons.length ? PLANS[index] : fallbackPlan(lessons.length)
    const nodes = lessons.map((lesson, k) => ({ ...move(plan.route[k], center), lesson }))
    islands.push({ index, center, top: height, bottom: height + 2 * ISLAND_RY, plan, nodes })
    height += 2 * ISLAND_RY + WATER
  })
  const finish = { x: CENTER, y: height + FINISH_RADIUS - 30 }
  height = finish.y + FINISH_RADIUS + MARGIN
  return { height, islands, finish }
}

const move = (p: Point, by: Point): Point => ({ x: p.x + by.x, y: p.y + by.y })

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

// The road on each island, and the dotted trail from its last lesson, through the
// water, to the first lesson of the next island
const ROADS = MAP.islands.map(({ nodes }) => openPath(nodes))
const CROSSINGS = MAP.islands.map(({ index, center, plan, nodes }) => {
  const nextIsland = MAP.islands[index + 1]
  const next = nextIsland?.nodes ?? [MAP.finish]
  // The lessons either side of the trail only steer its bends, so it leaves and
  // arrives in the direction the road is going
  const points = [
    nodes[nodes.length - 2],
    nodes[nodes.length - 1],
    ...plan.exit.map((p) => move(p, center)),
    ...(nextIsland?.plan.entry.map((p) => move(p, nextIsland.center)) ?? []),
    ...next.slice(0, 2),
  ]
  const target = points.length - Math.min(next.length, 2)
  return `M ${points[1].x} ${points[1].y}` + points.slice(1, target).map((_, i) => curve(points, i + 1)).join('')
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

// Little things in the water between the islands, on the side the dots don't pass:
// a tiny island with a palm tree, a fish in the middle and a few waves
const SEA = MAP.islands.map(({ index, center, bottom, plan }) => {
  const crossingSide = Math.sign(plan.exit[0].x) || 1
  const gap = bottom + WATER / 2
  return {
    islet: { x: CENTER - crossingSide * 245, y: gap + (index % 2 ? 10 : -10) },
    swimmer: { x: CENTER - crossingSide * 60, y: gap + 15, name: (index % 2 ? 'dolphin' : 'fish') as ArtName },
    waves: [
      { x: CENTER + crossingSide * 40, y: gap - 30 },
      { x: CENTER - crossingSide * 150, y: center.y - 30 },
      { x: CENTER + crossingSide * 150, y: gap + 40 },
    ],
  }
})

// The map is drawn 800px wide and zoomed so one island (with its beach) fills the screen height
const MAP_PX = 800
const ISLAND_VIEW = 2 * ISLAND_RY + 80

function useMapZoom(): number {
  const fit = () =>
    Math.min(1.3, (window.innerWidth - 32) / MAP_PX, (window.innerHeight - 16) / ((ISLAND_VIEW / WIDTH) * MAP_PX))
  const [zoom, setZoom] = useState(fit)
  useEffect(() => {
    const onResize = () => setZoom(fit())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return zoom
}

const at = (p: Point) => ({ left: `${(p.x / WIDTH) * 100}%`, top: `${(p.y / MAP.height) * 100}%` })

export function LevelMap({ best, onStart }: Props) {
  const current = LESSONS.find((lesson) => isUnlocked(lesson, best) && (best[lesson.id] ?? 0) < 2)
  const currentIsland = useRef<HTMLDivElement>(null)
  // An island opens together with its first lesson; the trophy once every lesson is done
  const open = MAP.islands.map((island) => isUnlocked(island.nodes[0].lesson, best))
  const allDone = LESSONS.every((lesson) => (best[lesson.id] ?? 0) >= 2)
  const locked = (isOpen: boolean) => (isOpen ? '' : ' locked')
  const firstTime = Object.keys(best).length === 0
  const zoom = useMapZoom()

  // Show the whole island she is on
  useEffect(() => {
    currentIsland.current?.scrollIntoView({ block: 'center' })
  }, [zoom])

  return (
    <div className="map" style={{ width: MAP_PX, zoom, aspectRatio: `${WIDTH} / ${MAP.height}` }}>
      <svg className="map-path" viewBox={`0 0 ${WIDTH} ${MAP.height}`} aria-hidden="true">
        <defs>
          {LANDS.map((land, i) => (
            <clipPath key={i} id={`coast-${i}`}>
              <path d={land.coast} />
            </clipPath>
          ))}
        </defs>

        {SEA.map((sea, i) => (
          <g key={i}>
            {sea.waves.map((w, k) => (
              <path key={k} d={`M ${w.x - 24} ${w.y} q 8 -9 16 0 t 16 0 t 16 0`} className="sea-wave" />
            ))}
            <ellipse cx={sea.islet.x} cy={sea.islet.y + 4} rx={46} ry={22} className="land-shallow" />
            <ellipse cx={sea.islet.x} cy={sea.islet.y} rx={34} ry={15} className="land-sand" />
          </g>
        ))}

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
            {MAP.islands[i]?.plan.houses.map((house, k) => (
              <HouseDrawing key={k} {...move(house, MAP.islands[i].center)} color={house.color} flip={house.flip} />
            ))}
          </g>
        ))}
      </svg>

      {SEA.map((sea, i) => (
        <Art key={`islet-${i}`} name="palm-tree" size={40} className="map-decor islet-palm" style={at(sea.islet)} />
      ))}
      {SEA.map((sea, i) => (
        <Art
          key={`swim-${i}`}
          name={sea.swimmer.name}
          size={44}
          className="map-decor swimmer"
          style={{ ...at(sea.swimmer), animationDelay: `${i * 0.5}s` }}
        />
      ))}

      {MAP.islands.flatMap(({ index, center, plan }) =>
        plan.decor.map((d, k) => (
          <Art
            key={`decor-${index}-${k}`}
            name={d.name}
            size={d.size}
            className={'map-decor' + locked(open[index])}
            style={{ ...at(move(d, center)), animationDelay: `${index * 0.4 + k * 0.7}s` }}
          />
        )),
      )}

      {MAP.islands.map(({ index, center }) => (
        <div
          key={`anchor-${index}`}
          ref={current?.island === index ? currentIsland : undefined}
          className="map-anchor"
          style={at(center)}
        />
      ))}

      {MAP.islands.map(({ index, center, plan, nodes }) => (
        <div
          key={index}
          className={'map-banner' + locked(open[index]) + (current?.island === index ? ' here' : '')}
          style={at(move(plan.sign, center))}
        >
          <span className="map-banner-island">
            {!open[index] && <Art name="lock" size={16} />}
            Eiland {index + 1}
          </span>
          {ISLANDS[index].name}
          {current?.island === index ? (
            <span className="map-banner-say">
              {firstTime ? 'Hoi, ik ben Nijl! Klik op het gouden rondje.' : 'Klik op het gouden rondje!'}
            </span>
          ) : (
            <span className="map-banner-count">{nodes.length} lessen</span>
          )}
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
                {lesson.label}
              </span>
            </div>
          )
        })}
    </div>
  )
}

// Our own little house: walls, a roof, a door and a window
function HouseDrawing({ x, y, color, flip }: Point & { color: string; flip?: boolean }) {
  return (
    <g className="house" transform={`translate(${x} ${y})${flip ? ' scale(-1 1)' : ''}`}>
      <ellipse cx="0" cy="17" rx="24" ry="5" className="house-shadow" />
      <rect x="-17" y="-6" width="34" height="23" rx="3" className="house-wall" />
      <rect x="7" y="-22" width="6" height="12" fill={color} className="house-chimney" />
      <path d="M -22 -4 L 0 -24 L 22 -4 Z" fill={color} className="house-roof" />
      <rect x="-11" y="3" width="9" height="14" rx="2" fill={color} />
      <rect x="4" y="1" width="9" height="8" rx="1.5" className="house-window" />
    </g>
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
