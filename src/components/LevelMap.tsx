import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ISLANDS, LESSONS, isUnlocked, type Lesson } from '../lib/lessons'
import type { BestStars } from '../lib/progress'
import { play } from '../lib/sound'
import { Art, type ArtName } from './Art'
import { Hippo } from './Hippo'

type Props = {
  best: BestStars
  // The stars before the lesson she just played: the map first shows those,
  // then the new stars land one by one, a lock breaks open and Nijl hops on
  before?: BestStars
  onStart: (lesson: Lesson) => void
  // Opens the diploma, once she has it
  onTrophy?: () => void
}

// When the map shows what changed after a lesson
const CHANGE_DELAY_MS = 700
const STAR_GAP_MS = 380

// The map is laid out in a 1200-unit wide coordinate space and scales with the screen
// (font sizes too, see .map in index.css), so one whole island always fits on the screen.
// The game is played on laptops, so the islands are wide. Every island has its own coast,
// with bays, capes, a harbour and sometimes a lighthouse, and its own road: a ring, a zigzag,
// a W, a spiral, a horseshoe and more. The roads go left to right, then right to left, and
// from each harbour dots lead across the water to the next island. The trophy waits at the bottom.
const WIDTH = 1200
const CENTER = WIDTH / 2
const ISLAND_RX = 490
const ISLAND_RY = 290
const WATER = 160
const MARGIN = 70
const FINISH_RADIUS = 85
// How far the pier sticks out into the water
const PIER = 64
// How far a lighthouse stands back from the tip of its cape
const LIGHTHOUSE_INLAND = 34

type Point = { x: number; y: number }
type Stop = Point & { lesson: Lesson }
type House = Point & { color: string; flip?: boolean }

// A dent in the coast (size below 0: a bay) or a bulge (above 0: a cape), at an angle in
// degrees around the island (0 is right, 90 is down). A harbour gets a pier and a boat, and
// the dots to the next island leave from it; a lighthouse stands on the tip of its cape.
type Feature = { at: number; size: number; width?: number; kind?: 'harbour' | 'lighthouse' }

// One island's coast, road and decoration, relative to the middle of the island.
// The sign holds the island's name, and Nijl's instruction on the island she is on.
type Plan = {
  coast: Feature[]
  route: Point[]
  sign: Point
  // Where the road goes after the harbour, through the water towards the next island
  exit: Point[]
  // Where the road from the previous island comes in
  entry: Point[]
  houses: House[]
  decor: (Point & { name: ArtName; size: number })[]
}

const ring = (count: number): Point[] =>
  Array.from({ length: count }, (_, k) => {
    const angle = ((165 + (k * 270) / (count - 1)) * Math.PI) / 180
    return { x: 330 * Math.cos(angle), y: 165 * Math.sin(angle) }
  })

const PLANS: Plan[] = [
  // De thuisrij: a ring around the village square, out to the harbour at the bottom
  {
    coast: [
      { at: 205, size: -0.24, width: 13 },
      { at: 75, size: -0.14, width: 12, kind: 'harbour' },
      { at: -40, size: 0.12, width: 9, kind: 'lighthouse' },
      { at: 128, size: 0.1, width: 8 },
      { at: -115, size: -0.12, width: 14 },
    ],
    route: ring(6),
    sign: { x: 0, y: 0 },
    entry: [],
    exit: [],
    houses: [
      { x: -190, y: 45, color: '#ff8a65' },
      { x: 190, y: 40, color: '#7cb3ff', flip: true },
    ],
    decor: [
      { x: -385, y: 80, name: 'palm-tree', size: 46 },
      { x: -250, y: 215, name: 'shell', size: 34 },
    ],
  },
  // De bovenrij: a zigzag along two streets, from right to left
  {
    coast: [
      { at: 120, size: -0.14, width: 11, kind: 'harbour' },
      { at: -12, size: -0.3, width: 10 },
      { at: 222, size: -0.18, width: 15 },
      { at: 60, size: 0.1, width: 9 },
      { at: -70, size: 0.1, width: 8 },
    ],
    route: [
      { x: 240, y: -150 },
      { x: -190, y: -160 },
      { x: 50, y: 40 },
      { x: -310, y: 120 },
    ],
    sign: { x: 190, y: 110 },
    entry: [],
    exit: [],
    houses: [
      { x: -20, y: -205, color: '#ffb74d' },
      { x: 45, y: -210, color: '#ef6f8f', flip: true },
      { x: 110, y: -205, color: '#8fd16a' },
    ],
    decor: [
      { x: -390, y: -20, name: 'palm-tree', size: 44 },
      { x: 380, y: 30, name: 'lotus', size: 34 },
    ],
  },
  // De onderrij: a big W, from left to right, with a bay between its legs
  {
    coast: [
      { at: 90, size: -0.36, width: 13 },
      { at: 22, size: -0.14, width: 11, kind: 'harbour' },
      { at: -140, size: 0.12, width: 10 },
      { at: 160, size: -0.16, width: 13 },
      { at: -60, size: -0.1, width: 14 },
    ],
    route: [
      { x: -320, y: -40 },
      { x: -180, y: 140 },
      { x: 0, y: -30 },
      { x: 180, y: 140 },
      { x: 330, y: -60 },
    ],
    sign: { x: 0, y: -170 },
    entry: [],
    exit: [],
    houses: [
      { x: -180, y: -40, color: '#7cb3ff' },
      { x: 180, y: -40, color: '#ff8a65', flip: true },
    ],
    decor: [
      { x: -330, y: -190, name: 'palm-tree', size: 44 },
      { x: 420, y: 20, name: 'shell', size: 32 },
    ],
  },
  // De laatste letters: a spiral from the right that ends in the middle, then down to the harbour
  {
    coast: [
      { at: 95, size: -0.14, width: 10, kind: 'harbour' },
      { at: 32, size: -0.26, width: 11 },
      { at: -150, size: 0.12, width: 10, kind: 'lighthouse' },
      { at: 240, size: -0.16, width: 14 },
      { at: -40, size: 0.08, width: 10 },
    ],
    route: [
      { x: 360, y: -60 },
      { x: 170, y: 150 },
      { x: -200, y: 150 },
      { x: -340, y: -40 },
      { x: -40, y: -70 },
    ],
    sign: { x: 170, y: -150 },
    entry: [],
    exit: [],
    houses: [
      { x: 90, y: 50, color: '#ef6f8f' },
      { x: -200, y: 40, color: '#ffb74d', flip: true },
    ],
    decor: [
      { x: -150, y: -165, name: 'palm-tree', size: 44 },
      { x: 400, y: 120, name: 'lotus', size: 32 },
    ],
  },
  // Hoofdletters: a horseshoe, open at the top, with the sign inside
  {
    coast: [
      { at: -90, size: -0.32, width: 17 },
      { at: 0, size: -0.12, width: 9, kind: 'harbour' },
      { at: 150, size: 0.12, width: 9 },
      { at: 200, size: -0.12, width: 13 },
      { at: 60, size: 0.08, width: 12 },
    ],
    route: [
      { x: -300, y: -110 },
      { x: -310, y: 80 },
      { x: 0, y: 180 },
      { x: 310, y: 80 },
      { x: 300, y: -110 },
    ],
    sign: { x: 0, y: -30 },
    entry: [],
    exit: [],
    houses: [
      { x: -160, y: 40, color: '#8fd16a' },
      { x: 160, y: 40, color: '#ef6f8f', flip: true },
    ],
    decor: [
      { x: -180, y: -200, name: 'palm-tree', size: 44 },
      { x: -290, y: 165, name: 'shell', size: 32 },
    ],
  },
  // Zinnetjes: a diamond around the sign
  {
    coast: [
      { at: 112, size: -0.14, width: 11, kind: 'harbour' },
      { at: -150, size: -0.2, width: 10 },
      { at: 25, size: 0.12, width: 9, kind: 'lighthouse' },
      { at: -60, size: -0.14, width: 17 },
      { at: 160, size: 0.08, width: 10 },
    ],
    route: [
      { x: 370, y: -20 },
      { x: 0, y: -190 },
      { x: -350, y: 10 },
      { x: -60, y: 175 },
    ],
    sign: { x: 0, y: -10 },
    entry: [],
    exit: [],
    houses: [
      { x: 250, y: -160, color: '#7cb3ff' },
      { x: 230, y: 160, color: '#ffb74d', flip: true },
    ],
    decor: [
      { x: -300, y: -170, name: 'palm-tree', size: 44 },
      { x: 120, y: 220, name: 'lotus', size: 32 },
    ],
  },
  // Leestekens: the zigzag of the second island, the other way round, on an island with a waist
  {
    coast: [
      { at: -90, size: -0.22, width: 13 },
      { at: 90, size: -0.24, width: 13 },
      { at: 58, size: -0.13, width: 10, kind: 'harbour' },
      { at: 195, size: 0.1, width: 10 },
      { at: -20, size: 0.08, width: 10 },
    ],
    route: [
      { x: -240, y: -150 },
      { x: 190, y: -160 },
      { x: -50, y: 40 },
      { x: 310, y: 120 },
    ],
    sign: { x: -200, y: 110 },
    entry: [],
    exit: [],
    houses: [
      { x: -110, y: -200, color: '#ef6f8f' },
      { x: 400, y: -40, color: '#8fd16a', flip: true },
      { x: 330, y: -150, color: '#7cb3ff' },
    ],
    decor: [
      { x: 170, y: 195, name: 'palm-tree', size: 44 },
      { x: -400, y: -40, name: 'shell', size: 32 },
    ],
  },
  // Cijfers: a saw, up and down like a row of numbers, from right to left
  {
    coast: [
      { at: 135, size: -0.14, width: 11, kind: 'harbour' },
      { at: 0, size: -0.26, width: 10 },
      { at: 30, size: 0.12, width: 9, kind: 'lighthouse' },
      { at: 75, size: -0.12, width: 14 },
      { at: 200, size: -0.14, width: 14 },
    ],
    route: [
      { x: 330, y: -120 },
      { x: 200, y: 40 },
      { x: 70, y: -130 },
      { x: -70, y: 40 },
      { x: -200, y: -130 },
      { x: -330, y: 40 },
    ],
    sign: { x: 0, y: 165 },
    entry: [],
    exit: [],
    houses: [
      { x: 140, y: -205, color: '#ffb74d' },
      { x: -140, y: -205, color: '#ef6f8f', flip: true },
    ],
    decor: [
      { x: -300, y: -175, name: 'palm-tree', size: 44 },
      { x: 280, y: 170, name: 'lotus', size: 32 },
    ],
  },
  // Snelheid: a race track from the top left, round to the exam and down to the trophy
  {
    coast: [
      { at: 90, size: -0.1, width: 12, kind: 'harbour' },
      { at: 145, size: -0.2, width: 13 },
      { at: -20, size: -0.2, width: 11 },
      { at: -120, size: 0.1, width: 10, kind: 'lighthouse' },
      { at: 40, size: 0.08, width: 10 },
    ],
    route: [
      { x: -330, y: -100 },
      { x: 260, y: -150 },
      { x: 300, y: 70 },
      { x: 0, y: 160 },
    ],
    sign: { x: -40, y: 0 },
    entry: [],
    exit: [{ x: 0, y: 400 }],
    houses: [{ x: -300, y: 100, color: '#ffb74d' }],
    decor: [
      { x: 140, y: 40, name: 'flag', size: 44 },
      { x: -180, y: 200, name: 'palm-tree', size: 44 },
    ],
  },
]

// An island without a plan of its own still gets a ring road, so a new island never breaks the map
const fallbackPlan = (count: number): Plan => ({
  coast: [{ at: 75, size: -0.13, width: 12, kind: 'harbour' }],
  route: ring(count),
  sign: { x: 0, y: 0 },
  entry: [],
  exit: [],
  houses: [],
  decor: [],
})

// A coastline as a ring of points: an oval with a little wobble, and the plan's bays and capes
const COAST_POINTS = 72
function coastAt(center: Point, rx: number, ry: number, seed: number, features: Feature[], degrees: number): Point {
  const angle = (degrees * Math.PI) / 180
  let scale = 1 - 0.035 * (1 + Math.sin(angle * 5 + seed * 2.3)) - 0.02 * Math.sin(angle * 9 + seed)
  for (const f of features) {
    const off = ((((degrees - f.at) % 360) + 540) % 360) - 180
    scale += f.size * Math.exp(-((off / (f.width ?? 12)) ** 2))
  }
  return { x: center.x + rx * scale * Math.cos(angle), y: center.y + ry * scale * Math.sin(angle) }
}

function coastPoints(center: Point, rx: number, ry: number, seed: number, features: Feature[]): Point[] {
  return Array.from({ length: COAST_POINTS }, (_, k) =>
    coastAt(center, rx, ry, seed, features, (k / COAST_POINTS) * 360),
  )
}

// Where a feature meets the sea, and the direction straight out to sea from there
function shore(center: Point, seed: number, features: Feature[], f: Feature) {
  const p = coastAt(center, ISLAND_RX, ISLAND_RY, seed, features, f.at)
  const a = coastAt(center, ISLAND_RX, ISLAND_RY, seed, features, f.at - 1)
  const b = coastAt(center, ISLAND_RX, ISLAND_RY, seed, features, f.at + 1)
  let out = { x: b.y - a.y, y: a.x - b.x }
  if (out.x * (p.x - center.x) + out.y * (p.y - center.y) < 0) out = { x: -out.x, y: -out.y }
  const length = Math.hypot(out.x, out.y)
  return { ...p, out: { x: out.x / length, y: out.y / length } }
}

type Shore = ReturnType<typeof shore>
type IslandLayout = {
  index: number
  center: Point
  top: number
  bottom: number
  plan: Plan
  nodes: Stop[]
  coast: Point[]
  harbour?: Shore
  lighthouses: Shore[]
}

function layout() {
  let height = MARGIN
  const islands: IslandLayout[] = []
  ISLANDS.forEach((_, index) => {
    const center = { x: CENTER, y: height + ISLAND_RY }
    const lessons = LESSONS.filter((l) => l.island === index)
    const plan = PLANS[index]?.route.length === lessons.length ? PLANS[index] : fallbackPlan(lessons.length)
    const nodes = lessons.map((lesson, k) => ({ ...move(plan.route[k], center), lesson }))
    const harbour = plan.coast.find((f) => f.kind === 'harbour')
    islands.push({
      index,
      center,
      top: height,
      bottom: height + 2 * ISLAND_RY,
      plan,
      nodes,
      coast: coastPoints(center, ISLAND_RX, ISLAND_RY, index, plan.coast),
      harbour: harbour && shore(center, index, plan.coast, harbour),
      lighthouses: plan.coast.filter((f) => f.kind === 'lighthouse').map((f) => shore(center, index, plan.coast, f)),
    })
    height += 2 * ISLAND_RY + WATER
  })
  const finish = { x: CENTER, y: height + FINISH_RADIUS - 30 }
  height = finish.y + FINISH_RADIUS + MARGIN
  return { height, islands, finish }
}

const move = (p: Point, by: Point): Point => ({ x: p.x + by.x, y: p.y + by.y })
const along = (p: Point, dir: Point, distance: number): Point => ({ x: p.x + dir.x * distance, y: p.y + dir.y * distance })

const MAP = layout()

// Catmull-Rom curve from points[i] to points[i + 1], as one cubic Bézier.
// With wrap the points form a closed loop.
function bezier(points: Point[], i: number, wrap = false): [Point, Point, Point, Point] {
  const n = points.length
  const get = (j: number) => (wrap ? points[(j + n) % n] : points[Math.min(Math.max(j, 0), n - 1)])
  const [p0, p1, p2, p3] = [get(i - 1), get(i), get(i + 1), get(i + 2)]
  const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 }
  const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 }
  return [p1, c1, c2, p2]
}

function curve(points: Point[], i: number, wrap = false): string {
  const [, c1, c2, p2] = bezier(points, i, wrap)
  return ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`
}

// Points along curve segments from..to, so the scenery can keep off the roads
function sample(points: Point[], from: number, to: number): Point[] {
  const out: Point[] = []
  for (let i = from; i < to; i++) {
    const [a, b, c, d] = bezier(points, i)
    for (let t = 0; t <= 1; t += 0.1) {
      const u = 1 - t
      out.push({
        x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x,
        y: u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y,
      })
    }
  }
  return out
}

function closedPath(points: Point[]): string {
  return `M ${points[0].x} ${points[0].y}` + points.map((_, i) => curve(points, i, true)).join('') + ' Z'
}

function openPath(points: Point[]): string {
  return `M ${points[0].x} ${points[0].y}` + points.slice(1).map((_, i) => curve(points, i)).join('')
}

// Whether a point lies on the land inside a coastline, and how far it is from the beach
function inside(coast: Point[], p: Point): boolean {
  let hit = false
  for (let i = 0, j = coast.length - 1; i < coast.length; j = i++) {
    const [a, b] = [coast[i], coast[j]]
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) hit = !hit
  }
  return hit
}

function toCoast(coast: Point[], p: Point): number {
  let best = Infinity
  for (let i = 0, j = coast.length - 1; i < coast.length; j = i++) {
    const [a, b] = [coast[i], coast[j]]
    const dx = b.x - a.x
    const dy = b.y - a.y
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)))
    best = Math.min(best, Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy))
  }
  return best
}

// The road on each island, and the dotted trail from its last lesson, down to the harbour,
// over the end of the pier and through the water to the first lesson of the next island
const ROADS = MAP.islands.map(({ nodes }) => openPath(nodes))
const TRAILS = MAP.islands.map(({ index, center, plan, nodes, harbour }) => {
  const nextIsland = MAP.islands[index + 1]
  const next = nextIsland?.nodes ?? [MAP.finish]
  const pier = harbour ? [along(harbour, harbour.out, -10), along(harbour, harbour.out, PIER + 40)] : []
  // The lessons either side of the trail only steer its bends, so it leaves and
  // arrives in the direction the road is going
  const points = [
    nodes[nodes.length - 2],
    nodes[nodes.length - 1],
    ...pier,
    ...plan.exit.map((p) => move(p, center)),
    ...(nextIsland?.plan.entry.map((p) => move(p, nextIsland.center)) ?? []),
    ...next.slice(0, 2),
  ]
  const target = points.length - Math.min(next.length, 2)
  return {
    d: `M ${points[1].x} ${points[1].y}` + points.slice(1, target).map((_, i) => curve(points, i + 1)).join(''),
    along: sample(points, 1, target),
  }
})
const CROSSINGS = TRAILS.map((trail) => trail.d)
const ALONG_ROADS = [...MAP.islands.flatMap(({ nodes }) => sample(nodes, 0, nodes.length - 1)), ...TRAILS.flatMap((t) => t.along)]

// The same "random" numbers every time, so the scenery never jumps around
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

type Scenery = Point & { kind: 'tuft' | 'flower' | 'bush' | 'rock'; size: number; hue: number }

// Grass tufts, flowers, bushes and rocks spread over each island, keeping clear of the
// beach, the roads, the lessons, the sign, the houses and the lighthouses
const SCENERY = MAP.islands.map(({ index, center, plan, nodes, coast, lighthouses }) => {
  const random = seeded(index * 7919 + 13)
  const away = (p: Point, list: Point[], distance: number) =>
    list.every((q) => (p.x - q.x) ** 2 + (p.y - q.y) ** 2 > distance ** 2)
  const sign = move(plan.sign, center)
  const labels = nodes.map((n) => ({ x: n.x, y: n.y + 48 }))
  const towers = lighthouses.map((l) => along(l, l.out, -LIGHTHOUSE_INLAND))
  const items: Scenery[] = []
  for (let gy = -ISLAND_RY; gy <= ISLAND_RY; gy += 30) {
    for (let gx = -ISLAND_RX; gx <= ISLAND_RX; gx += 30) {
      const p = { x: center.x + gx + (random() - 0.5) * 22, y: center.y + gy + (random() - 0.5) * 22 }
      const roll = random()
      if (roll < 0.12 || !inside(coast, p)) continue
      const beach = toCoast(coast, p)
      if (beach < 28) continue
      if (Math.abs(p.x - sign.x) < 125 && Math.abs(p.y - sign.y) < 72) continue
      if (!away(p, ALONG_ROADS, 26) || !away(p, nodes, 58) || !away(p, labels, 40)) continue
      if (!away(p, plan.houses.map((h) => move(h, center)), 40) || !away(p, plan.decor.map((d) => move(d, center)), 36)) continue
      if (!away(p, towers, 40) || !away(p, items, 24)) continue
      const kind = roll < 0.55 ? 'tuft' : roll < 0.75 ? 'flower' : roll < 0.93 ? (beach > 70 ? 'bush' : 'flower') : 'rock'
      items.push({ ...p, kind, size: 0.8 + random() * 0.45, hue: Math.floor(random() * 3) })
    }
  }
  return items
})

// Every piece of land (the islands, then the trophy island) with the roads on it.
// The crossings are drawn as road too, cut off at the coast, so the road
// runs down to the harbour and the dots carry on over the water.
const LANDS = [
  ...MAP.islands.map((island) => closedPath(island.coast)),
  closedPath(coastPoints(MAP.finish, FINISH_RADIUS, FINISH_RADIUS, 9, [])),
].map((coast, i) => ({
  coast,
  roads: [ROADS[i], CROSSINGS[i - 1], CROSSINGS[i]].filter((d) => d !== undefined),
}))

// Little things in the water between the islands, away from where the dots cross:
// a tiny island with a palm tree, a fish or a dolphin and a few waves
const SEA = MAP.islands.map(({ index, center, bottom, harbour }) => {
  const crossingSide = Math.sign((harbour?.x ?? CENTER) - CENTER) || 1
  const gap = bottom + WATER / 2
  return {
    islet: { x: CENTER - crossingSide * 420, y: gap + (index % 2 ? 10 : -10) },
    swimmer: { x: CENTER - crossingSide * 140, y: gap + 15, name: (index % 2 ? 'dolphin' : 'fish') as ArtName },
    sparkles: [
      { x: CENTER + crossingSide * 380, y: gap - 10 },
      { x: CENTER - crossingSide * 260, y: gap + 50 },
      { x: CENTER - crossingSide * 560, y: center.y + 60 },
      { x: CENTER + crossingSide * 560, y: center.y - 120 },
    ],
    waves: [
      { x: CENTER + crossingSide * 60 - 300 * crossingSide, y: gap - 30 },
      { x: CENTER - crossingSide * 555, y: center.y - 60 },
      { x: CENTER + crossingSide * 470, y: gap + 40 },
      { x: CENTER + crossingSide * 555, y: center.y + 140 },
    ],
  }
})

// The map is drawn 1200px wide and zoomed so one island (with its beach) fills the screen
const MAP_PX = WIDTH
const ISLAND_VIEW = 2 * ISLAND_RY + 80

function useMapZoom(): number {
  const fit = () => Math.min(1.3, (window.innerWidth - 24) / MAP_PX, (window.innerHeight - 16) / ISLAND_VIEW)
  const [zoom, setZoom] = useState(fit)
  useEffect(() => {
    const onResize = () => setZoom(fit())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return zoom
}

const at = (p: Point) => ({ left: `${(p.x / WIDTH) * 100}%`, top: `${(p.y / MAP.height) * 100}%` })

// Stars newly earned in a lesson, counted from the stars she had before
const newStars = (lesson: Lesson, before: BestStars, after: BestStars) =>
  Math.max(0, (after[lesson.id] ?? 0) - (before[lesson.id] ?? 0))

export function LevelMap({ best, before, onStart, onTrophy }: Props) {
  // What the map shows: first the old stars, a moment later the new ones
  const [settled, setSettled] = useState(false)
  const shown = before && !settled ? before : best
  const changing = before !== undefined && settled
  const current = LESSONS.find((lesson) => isUnlocked(lesson, shown) && (shown[lesson.id] ?? 0) < 2)
  const currentIsland = useRef<HTMLDivElement>(null)
  const currentNode = useRef<HTMLDivElement>(null)
  // Where Nijl is when off screen: above or below what she sees
  const [hippoAway, setHippoAway] = useState<'above' | 'below'>()
  const [nudged, setNudged] = useState<string>()
  // An island opens together with its first lesson; the trophy once every lesson is done
  const open = MAP.islands.map((island) => isUnlocked(island.nodes[0].lesson, shown))
  const allDone = LESSONS.every((lesson) => (shown[lesson.id] ?? 0) >= 2)
  const locked = (isOpen: boolean) => (isOpen ? '' : ' locked')
  const firstTime = Object.keys(shown).length === 0
  const zoom = useMapZoom()
  const earnedTotal = before ? LESSONS.reduce((sum, lesson) => sum + newStars(lesson, before, best), 0) : 0
  const opened = before ? LESSONS.filter((lesson) => !isUnlocked(lesson, before) && isUnlocked(lesson, best)) : []
  // The lock breaks once the last new star has landed
  const unlockDelayMs = earnedTotal * STAR_GAP_MS + 250

  // After a lesson: the new stars land (with a ding each), then the next lesson opens
  useEffect(() => {
    if (!before) return
    const timers = [setTimeout(() => setSettled(true), CHANGE_DELAY_MS)]
    for (let i = 0; i < earnedTotal; i++) {
      timers.push(setTimeout(() => play('star', i), CHANGE_DELAY_MS + i * STAR_GAP_MS + 150))
    }
    if (opened.length > 0) timers.push(setTimeout(() => play('unlock'), CHANGE_DELAY_MS + unlockDelayMs))
    return () => timers.forEach(clearTimeout)
  }, [before, earnedTotal, opened.length, unlockDelayMs])

  // Show the whole island she is on; when she moved on to a new island, glide there
  const firstScroll = useRef(true)
  useEffect(() => {
    const smooth = !firstScroll.current
    firstScroll.current = false
    const go = () => {
      currentIsland.current?.scrollIntoView({ block: 'center', behavior: smooth ? 'smooth' : 'instant' })
    }
    if (!smooth) {
      go()
      return
    }
    const timer = setTimeout(go, unlockDelayMs + 600)
    return () => clearTimeout(timer)
  }, [zoom, current?.island, unlockDelayMs])

  // A button to swim back to Nijl when she has scrolled away (like the arrow in Duolingo)
  useEffect(() => {
    const node = currentNode.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) =>
        setHippoAway(entry.isIntersecting ? undefined : entry.boundingClientRect.top < 0 ? 'above' : 'below'),
      { threshold: 0.2 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [current])

  // A locked lesson wiggles and says it is still closed
  useEffect(() => {
    if (!nudged) return
    const timer = setTimeout(() => setNudged(undefined), 1600)
    return () => clearTimeout(timer)
  }, [nudged])

  return (
    <>
      <div className="map" style={{ width: MAP_PX, zoom, aspectRatio: `${WIDTH} / ${MAP.height}` }}>
        <svg className="map-path" viewBox={`0 0 ${WIDTH} ${MAP.height}`} aria-hidden="true">
          <defs>
            {/* Sunlight from the top left: warm yellow-green in the light, cool blue-green in the shade */}
            <radialGradient id="grass-light" cx="0.38" cy="0.3" r="0.8">
              <stop offset="0" stopColor="#a3e35c" />
              <stop offset="0.55" stopColor="#74cc4e" />
              <stop offset="1" stopColor="#4fb455" />
            </radialGradient>
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
              {sea.sparkles.map((s, k) => (
                <path
                  key={k}
                  d={`M ${s.x} ${s.y - 7} Q ${s.x + 1.5} ${s.y - 1.5} ${s.x + 7} ${s.y} Q ${s.x + 1.5} ${s.y + 1.5} ${s.x} ${s.y + 7} Q ${s.x - 1.5} ${s.y + 1.5} ${s.x - 7} ${s.y} Q ${s.x - 1.5} ${s.y - 1.5} ${s.x} ${s.y - 7} Z`}
                  className="sea-sparkle"
                  style={{ animationDelay: `${(i * 3 + k) * 0.7}s` }}
                />
              ))}
              <ellipse cx={sea.islet.x} cy={sea.islet.y + 4} rx={50} ry={24} className="land-shallow" />
              <ellipse cx={sea.islet.x} cy={sea.islet.y + 3} rx={40} ry={18} className="land-foam" />
              <ellipse cx={sea.islet.x} cy={sea.islet.y + 5} rx={34} ry={15} className="land-sand-shade" />
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
              <path d={land.coast} className="land-foam" />
              <path d={land.coast} className="land-sand-shade" transform="translate(0 7)" />
              <path d={land.coast} className="land-sand" />
              <path d={land.coast} className="land-grass-shade" transform="translate(0 6)" />
              <path d={land.coast} className="land-grass" />
              <path d={land.coast} className="land-grass-rim" />
              {SCENERY[i]?.map((item, k) => (
                <SceneryDrawing key={k} {...item} />
              ))}
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
              {MAP.islands[i]?.lighthouses.map((l, k) => (
                <LighthouseDrawing key={k} {...along(l, l.out, -LIGHTHOUSE_INLAND)} />
              ))}
              {MAP.islands[i]?.harbour && <HarbourDrawing {...MAP.islands[i].harbour} index={i} />}
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
          {onTrophy ? (
            <button className="map-finish-button" onClick={onTrophy} aria-label="Bekijk je typediploma">
              <Art name="trophy" size={72} />
            </button>
          ) : (
            <Art name="trophy" size={72} />
          )}
        </div>

        {MAP.islands.flatMap((island) =>
          island.nodes.map(({ x, y, lesson }, k) => {
            const unlocked = isUnlocked(lesson, shown)
            const earned = shown[lesson.id] ?? 0
            const isCurrent = lesson === current
            const state = isCurrent ? 'current' : unlocked ? 'open' : 'locked'
            // Stars this lesson just won, and how many other new stars land before them
            const fresh = changing && before ? newStars(lesson, before, best) : 0
            const freshBefore = changing && before
              ? LESSONS.slice(0, lesson.number - 1).reduce((sum, l) => sum + newStars(l, before, best), 0)
              : 0
            const justOpened = changing && opened.includes(lesson)
            const classes = ['level', state, justOpened ? 'just-opened' : '', nudged === lesson.id ? 'nudged' : '']
            return (
              <div
                key={lesson.id}
                ref={isCurrent ? currentNode : undefined}
                className={classes.join(' ')}
                style={{ ...at({ x, y }), '--i': k, '--unlock-delay': `${unlockDelayMs}ms` } as CSSProperties}
              >
                {isCurrent ? (
                  <MapHippo key={lesson.id} arriving={justOpened} delayMs={unlockDelayMs + 300} />
                ) : !unlocked ? null : (
                  <div className="level-stars" aria-hidden="true">
                    {[1, 2, 3].map((n) => {
                      const landing = n > earned - fresh && n <= earned
                      return (
                        <Art
                          key={n}
                          name="star"
                          size={22}
                          className={n <= earned ? `star on${landing ? ' landing' : ''}` : 'star off'}
                          style={
                            landing ? { animationDelay: `${(freshBefore + n - (earned - fresh) - 1) * STAR_GAP_MS}ms` } : undefined
                          }
                        />
                      )
                    })}
                  </div>
                )}
                {nudged === lesson.id && <span className="level-nudge">Nog op slot!</span>}
                <button
                  className="level-node"
                  aria-disabled={!unlocked}
                  onClick={() => {
                    if (unlocked) return onStart(lesson)
                    play('wrong')
                    setNudged(lesson.id)
                  }}
                  aria-label={`Les ${lesson.number}${unlocked ? '' : ', nog op slot'}`}
                >
                  {justOpened && <Art name="lock" size={30} className="lock-breaking" />}
                  <span className="level-face" key={unlocked ? 'open' : 'locked'}>
                    {!unlocked ? (
                      <Art name="lock" size={30} />
                    ) : lesson.kind === 'test' ? (
                      <Art name="medal" size={36} />
                    ) : lesson.kind === 'exam' ? (
                      <Art name="diploma" size={38} />
                    ) : (
                      lesson.number
                    )}
                  </span>
                </button>
                <span className="level-keys">
                  {lesson.label}
                </span>
              </div>
            )
          }),
        )}
      </div>

      {current && hippoAway && (
        <button
          className={`to-hippo ${hippoAway}`}
          onClick={() => currentIsland.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })}
          aria-label="Terug naar Nijl"
        >
          <Hippo size={52} still duck={false} />
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" className="to-hippo-arrow">
            <path d="M12 19V5M6 11l6-6 6 6" className="icon-line" />
          </svg>
        </button>
      )}
    </>
  )
}

// Our own little house: walls, a roof, a door and a window. Flipped houses get their
// chimney on the other side; the light always comes from the top left.
function HouseDrawing({ x, y, color, flip }: Point & { color: string; flip?: boolean }) {
  return (
    <g className="house" transform={`translate(${x} ${y})`}>
      <ellipse cx="2" cy="18" rx="26" ry="5" className="house-shadow" />
      <rect x="-17" y="-6" width="34" height="23" rx="3" className="house-wall" />
      <rect x="5" y="-6" width="12" height="23" rx="3" className="house-wall-shade" />
      <rect x={flip ? -13 : 7} y="-22" width="6" height="12" fill={color} />
      <rect x={flip ? -10 : 10} y="-22" width="3" height="12" className="roof-shade" />
      <path d="M -23 -3 Q -24 -5 -22 -7 L -2 -24 Q 0 -26 2 -24 L 22 -7 Q 24 -5 23 -3 Z" fill={color} />
      <path d="M 0 -25 L 22 -7 Q 24 -5 23 -3 L 0 -3 Z" className="roof-shade" />
      <path d="M -18 -6 L -1 -20" className="roof-glint" />
      <rect x="-11" y="3" width="9" height="14" rx="2" fill={color} />
      <circle cx="-4.5" cy="10.5" r="1.1" fill="#fff8e6" />
      <rect x="4" y="1" width="9" height="8" rx="1.5" className="house-window" />
      <path d="M 8.5 1 v 8 M 4 5 h 9" className="house-window-bar" />
    </g>
  )
}

const SAILS = ['#ffffff', '#ffd54f', '#ff8a80']

// A wooden pier sticking out of the harbour, with a sailing boat moored beside it.
// The pier follows the coast; the boat always stays upright and rocks on the waves.
function HarbourDrawing({ x, y, out, index }: Shore & { index: number }) {
  const angle = (Math.atan2(out.y, out.x) * 180) / Math.PI
  // The boat lies on the side of the pier that faces down or right, so it's never hidden under it
  const side = out.x > 0.5 ? 1 : out.x < -0.5 ? -1 : out.y > 0 ? -1 : 1
  const boat = along(along({ x, y }, out, PIER - 18), { x: -out.y * side, y: out.x * side }, 30)
  return (
    <g>
      <g transform={`translate(${x} ${y}) rotate(${angle})`}>
        <rect x={-14} y={-7} width={PIER + 14} height={18} rx={3} className="pier-shadow" />
        {[8, 26, 44, PIER - 4].map((px) => (
          <g key={px}>
            <circle cx={px} cy={-9} r={3.4} className="pier-post" />
            <circle cx={px} cy={9} r={3.4} className="pier-post" />
          </g>
        ))}
        <rect x={-14} y={-9} width={PIER + 14} height={18} rx={2.5} className="pier-deck" />
        {Array.from({ length: Math.floor((PIER + 8) / 9) }, (_, k) => (
          <path key={k} d={`M ${-8 + k * 9} -9 v 18`} className="pier-plank" />
        ))}
      </g>
      <g transform={`translate(${boat.x} ${boat.y})`}>
        <g className="boat" style={{ animationDelay: `${index * 0.6}s` }}>
          <ellipse cx="2" cy="12" rx="26" ry="5" className="boat-shadow" />
          <path d="M -24 0 h 48 l -8 12 h -32 z" className="boat-hull" />
          <path d="M -24 0 h 48 l -2 3 h -44 z" className="boat-rim" />
          <path d="M 0 0 v -40" className="boat-mast" />
          <path d="M 3 -38 Q 22 -18 20 -4 L 3 -4 Z" fill={SAILS[index % SAILS.length]} className="boat-sail" />
          <path d="M -3 -32 Q -16 -16 -15 -4 L -3 -4 Z" fill={SAILS[(index + 1) % SAILS.length]} className="boat-sail" />
          <path d="M 0 -40 l 10 3 l -10 3 z" className="boat-flag" />
        </g>
      </g>
    </g>
  )
}

// A red and white lighthouse on a cape, with a light that glows on and off
function LighthouseDrawing({ x, y }: Point) {
  return (
    <g className="lighthouse" transform={`translate(${x} ${y})`}>
      <ellipse cx="3" cy="2" rx="20" ry="5" className="house-shadow" />
      <path d="M -11 0 L -7 -44 L 7 -44 L 11 0 Z" className="lighthouse-wall" />
      <path d="M -10 -11 L -9 -22 L 9 -22 L 10 -11 Z M -8 -33 L -7.4 -40 L 7.4 -40 L 8 -33 Z" className="lighthouse-stripe" />
      <path d="M 2 0 L 2 -44 L 7 -44 L 11 0 Z" className="lighthouse-shade" />
      <circle cx="0" cy="-51" r="13" className="lighthouse-glow" />
      <rect x="-7" y="-55" width="14" height="11" rx="2" className="lighthouse-lamp" />
      <path d="M -10 -55 L 0 -64 L 10 -55 Z" className="lighthouse-roof" />
      <rect x="-12" y="-46" width="24" height="4" rx="1.5" className="lighthouse-balcony" />
    </g>
  )
}

const FLOWERS = ['#ff8fab', '#fff3a0', '#ffffff']
const BUSHES = [
  ['#3f9e52', '#5cbf4f', '#8bdc5e'],
  ['#2f8f5a', '#4cad55', '#7fd060'],
  ['#3a9650', '#62c25a', '#9ee36a'],
]

// Small details on the grass, lit from the top left like the rest of the map
function SceneryDrawing({ x, y, kind, size, hue }: Scenery) {
  const transform = `translate(${x} ${y}) scale(${size})`
  switch (kind) {
    case 'tuft':
      return <path transform={transform} d="M -6 2 q 1 -6 -1 -9 M 0 2 q 0 -7 1 -11 M 6 2 q -1 -5 2 -8" className="scenery-tuft" />
    case 'flower':
      return (
        <g transform={transform}>
          <path d="M 0 6 q 1 -4 0 -7" className="scenery-stem" />
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx={3.4 * Math.cos((a * Math.PI) / 180)} cy={-2 + 3.4 * Math.sin((a * Math.PI) / 180)} r="2.6" fill={FLOWERS[hue]} />
          ))}
          <circle cx="0" cy="-2" r="2" fill="#ffb300" />
        </g>
      )
    case 'bush': {
      const [dark, base, light] = BUSHES[hue]
      return (
        <g transform={transform} className="scenery-bush">
          <ellipse cx="0" cy="9" rx="17" ry="4.5" className="scenery-shadow" />
          <circle cx="-8" cy="2" r="9" fill={dark} />
          <circle cx="8" cy="2" r="9" fill={dark} />
          <circle cx="0" cy="-4" r="11" fill={dark} />
          <circle cx="-8" cy="0" r="8" fill={base} />
          <circle cx="7" cy="0" r="8" fill={base} />
          <circle cx="-1" cy="-6" r="9.5" fill={base} />
          <circle cx="-4" cy="-9" r="4" fill={light} />
          <circle cx="-10" cy="-2" r="2.5" fill={light} />
          {hue === 0 && <circle cx="6" cy="-3" r="2.2" fill="#ff6b6b" />}
          {hue === 0 && <circle cx="-2" cy="2" r="2.2" fill="#ff6b6b" />}
        </g>
      )
    }
    case 'rock':
      return (
        <g transform={transform}>
          <ellipse cx="1" cy="6" rx="12" ry="3.5" className="scenery-shadow" />
          <path d="M -10 6 q -2 -10 6 -13 q 9 -3 14 4 q 3 6 -1 9 z" fill="#8391b8" />
          <path d="M -10 4 q -1 -9 6 -11 q 8 -2 12 4 q 2 4 -1 7 z" fill="#b2bdd8" />
          <path d="M -5 -3 q 2 -3 6 -3" className="scenery-glint" />
        </g>
      )
  }
}

// The hippo waits at the next lesson; click it and it hops for joy.
// When a new lesson has just opened it jumps in from above.
function MapHippo({ arriving = false, delayMs = 0 }: { arriving?: boolean; delayMs?: number }) {
  const [happy, setHappy] = useState(false)
  // Lands with a happy hop
  useEffect(() => {
    if (!arriving) return
    const timer = setTimeout(() => setHappy(true), delayMs + 350)
    return () => clearTimeout(timer)
  }, [arriving, delayMs])
  useEffect(() => {
    if (!happy) return
    const timer = setTimeout(() => setHappy(false), 1400)
    return () => clearTimeout(timer)
  }, [happy])
  return (
    <button
      className={arriving ? 'map-hippo arriving' : 'map-hippo'}
      style={arriving ? { animationDelay: `${delayMs}ms` } : undefined}
      onClick={() => {
        play('tap')
        setHappy(true)
      }}
      aria-label="Nijlpaard, klik voor een sprongetje"
    >
      <Hippo size={96} mood={happy ? 'happy' : 'idle'} />
    </button>
  )
}
