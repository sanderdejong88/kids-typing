import { useEffect, useRef, useState } from 'react'
import type { Attempt } from '../lib/attempt'
import { FINGER_NAMES, fingerFor } from '../lib/keyboard'
import type { Lesson } from '../lib/lessons'
import { Art } from './Art'
import { Hippo } from './Hippo'
import { Keyboard } from './Keyboard'

type Props = {
  lesson: Lesson
  text: string
  onDone: (attempt: Attempt) => void
  onStop: () => void
}

// "Stop on error" mode (REQUIREMENTS P5): the cursor waits until she types the right key.
export function TypingExercise({ lesson, text, onDone, onStop }: Props) {
  const [position, setPosition] = useState(0)
  const [wrong, setWrong] = useState(false)
  const stats = useRef({ keystrokes: 0, firstTry: 0, missedHere: false, startedAt: 0 })

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      if (event.key === 'Escape') return onStop()
      if (event.key.length !== 1) return
      event.preventDefault()

      const s = stats.current
      if (s.keystrokes === 0) s.startedAt = performance.now()
      s.keystrokes++

      if (event.key !== text[position]) {
        s.missedHere = true
        setWrong(true)
        return
      }
      if (!s.missedHere) s.firstTry++
      s.missedHere = false
      setWrong(false)

      const nextPosition = position + 1
      if (nextPosition === text.length) {
        onDone({
          text,
          keystrokes: s.keystrokes,
          firstTry: s.firstTry,
          elapsedMs: performance.now() - s.startedAt,
        })
      }
      setPosition(nextPosition)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [position, text, onDone, onStop])

  const next = text[position]
  const finger = next ? fingerFor(next) : undefined
  const progress = position / text.length

  return (
    <section className="exercise">
      <div className="river" aria-hidden="true">
        <div className="river-water" />
        <Art name="lotus" size={44} className="river-goal" />
        {/* The hippo only swims forward on correct keys (REQUIREMENTS M5) */}
        <div className="river-hippo" style={{ left: `calc(${progress} * (100% - 8rem))` }}>
          <Hippo size={84} mood={wrong ? 'oops' : 'idle'} />
        </div>
      </div>

      <p className={wrong ? 'line wrong' : 'line'} aria-label={text}>
        <span className="done">{text.slice(0, position)}</span>
        <span className="current">{next === ' ' ? '␣' : next}</span>
        <span className="todo">{text.slice(position + 1)}</span>
      </p>

      <p className="hint">
        {wrong ? (
          <>Oeps! Probeer nog eens met je </>
        ) : (
          <>Gebruik je </>
        )}
        <strong className={finger ? `finger-text finger-${finger}` : ''}>
          {finger ? FINGER_NAMES[finger] : ''}
        </strong>
      </p>

      <Keyboard next={next} keys={lesson.keys} />

      <p className="small">Kijk naar het scherm, niet naar je handen. Voel de bobbeltjes op F en J. · Esc = stoppen</p>
    </section>
  )
}
