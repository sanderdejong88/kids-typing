import { useEffect, useState } from 'react'

const WAKE_EVENTS = ['keydown', 'pointerdown', 'wheel', 'scroll', 'touchstart'] as const

// The seal dozes off when nothing happens for a while, and wakes up on any key, click or scroll
export function useDozing(afterMs: number, enabled = true): boolean {
  const [asleep, setAsleep] = useState(false)

  useEffect(() => {
    if (!enabled) return
    let timer = setTimeout(() => setAsleep(true), afterMs)
    const wake = () => {
      setAsleep(false)
      clearTimeout(timer)
      timer = setTimeout(() => setAsleep(true), afterMs)
    }
    WAKE_EVENTS.forEach((name) => window.addEventListener(name, wake, { passive: true }))
    return () => {
      clearTimeout(timer)
      WAKE_EVENTS.forEach((name) => window.removeEventListener(name, wake))
    }
  }, [afterMs, enabled])

  return enabled && asleep
}
