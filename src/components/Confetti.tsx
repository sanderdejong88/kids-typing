import { useEffect, useRef } from 'react'

type Props = {
  // Starts the shower; a new value starts a new one
  fire: number
  // Pieces per shower
  amount?: number
}

const COLORS = ['#ffc21a', '#2f7ff0', '#ff6b6b', '#3cc98a', '#8b6cf2', '#ff9ad5']

type Piece = { x: number; y: number; vx: number; vy: number; spin: number; angle: number; w: number; h: number; color: string; round: boolean }

// Paper confetti shot up from both bottom corners, falling with a little flutter.
// Drawn on one canvas over the page, so a few hundred pieces stay smooth on a Chromebook.
export function Confetti({ fire, amount = 140 }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = canvas.current
    if (!fire || !el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = el.getContext('2d')
    if (!ctx) return

    const ratio = window.devicePixelRatio || 1
    const width = window.innerWidth
    const height = window.innerHeight
    el.width = width * ratio
    el.height = height * ratio
    ctx.scale(ratio, ratio)

    const pieces: Piece[] = Array.from({ length: amount }, (_, i) => {
      const left = i % 2 === 0
      const power = 9 + Math.random() * 9
      const angle = ((left ? -60 : -120) + (Math.random() - 0.5) * 40) * (Math.PI / 180)
      return {
        x: left ? -10 : width + 10,
        y: height * 0.85,
        vx: Math.cos(angle) * power * (width / 900 + 0.4),
        vy: Math.sin(angle) * power * 1.6,
        spin: (Math.random() - 0.5) * 0.4,
        angle: Math.random() * Math.PI,
        w: 7 + Math.random() * 7,
        h: 4 + Math.random() * 5,
        color: COLORS[i % COLORS.length],
        round: Math.random() < 0.25,
      }
    })

    let frame = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 16.7, 3)
      last = now
      ctx.clearRect(0, 0, width, height)
      let alive = 0
      for (const p of pieces) {
        p.vy += 0.32 * dt
        p.vx *= 0.985 ** dt
        p.vy *= 0.985 ** dt
        p.x += (p.vx + Math.sin(p.angle * 2) * 0.6) * dt
        p.y += p.vy * dt
        p.angle += p.spin * dt
        if (p.y > height + 20) continue
        alive++
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.angle)
        ctx.fillStyle = p.color
        if (p.round) {
          ctx.beginPath()
          ctx.arc(0, 0, p.h, 0, Math.PI * 2)
          ctx.fill()
        } else {
          // Squashing the width makes the paper look like it turns over
          ctx.fillRect(-p.w / 2, (-p.h / 2) * Math.cos(p.angle * 3), p.w, p.h * Math.cos(p.angle * 3))
        }
        ctx.restore()
      }
      if (alive > 0) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, el.width, el.height)
    }
  }, [fire, amount])

  return <canvas ref={canvas} className="confetti" aria-hidden="true" />
}
