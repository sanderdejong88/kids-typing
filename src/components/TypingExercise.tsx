import { useEffect, useRef, useState } from 'react'
import type { Attempt } from '../lib/attempt'
import type { KeySample } from '../lib/keystats'
import { FINGER_NAMES, fingerFor, shiftFor } from '../lib/keyboard'
import type { Lesson } from '../lib/lessons'
import { play } from '../lib/sound'
import { Art } from './Art'
import { Hippo } from './Hippo'
import { Keyboard } from './Keyboard'

type Props = {
  lesson: Lesson
  text: string
  // Which round of the lesson this is, counting from 0
  round: number
  rounds: number
  // Before her first finished lesson every instruction is spelled out
  beginner: boolean
  onDone: (attempt: Attempt) => void
  onStop: () => void
}

// Keys right the first time in a row that earn a cheer
const COMBO_STEP = 10

// "Stop on error" mode (REQUIREMENTS P5): the cursor waits until she types the right key.
export function TypingExercise({ lesson, text, round, rounds, beginner, onDone, onStop }: Props) {
  const [position, setPosition] = useState(0)
  const [wrong, setWrong] = useState(false)
  // Counts every miss, so the line shakes again on the next one
  const [misses, setMisses] = useState(0)
  // The key she pressed last, for the keyboard to show it going down
  const [pressed, setPressed] = useState<{ key: string; ok: boolean; n: number }>()
  // Keys right the first time in a row, and the cheer when that reaches 10, 20, ...
  const [streak, setStreak] = useState(0)
  const [combo, setCombo] = useState(0)
  // After a finished round the bar cheers until she starts typing again
  const cheering = round > 0 && position === 0 && !wrong
  const stats = useRef({ keystrokes: 0, firstTry: 0, missedHere: false, startedAt: 0, lastAt: 0, samples: [] as KeySample[] })

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      if (event.key === 'Escape') return onStop()
      if (event.key.length !== 1) return
      event.preventDefault()

      const s = stats.current
      const now = performance.now()
      if (s.keystrokes === 0) s.startedAt = now
      s.keystrokes++

      setPressed({ key: event.key, ok: event.key === text[position], n: s.keystrokes })
      if (event.key !== text[position]) {
        s.missedHere = true
        setWrong(true)
        setMisses((n) => n + 1)
        setStreak(0)
        play('wrong')
        return
      }
      if (!s.missedHere) {
        s.firstTry++
        const nextStreak = streak + 1
        setStreak(nextStreak)
        if (nextStreak % COMBO_STEP === 0) {
          setCombo(nextStreak)
          play('combo')
        }
      } else {
        setStreak(0)
      }
      // The first key has nothing before it to time from
      if (position > 0) s.samples.push({ key: text[position], ms: now - s.lastAt, miss: s.missedHere })
      s.lastAt = now
      s.missedHere = false
      setWrong(false)

      const nextPosition = position + 1
      if (nextPosition < text.length) play('key', position % 8)
      if (nextPosition === text.length) {
        play('round')
        onDone({
          text,
          keystrokes: s.keystrokes,
          firstTry: s.firstTry,
          elapsedMs: now - s.startedAt,
          samples: s.samples,
        })
      }
      setPosition(nextPosition)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [position, text, streak, onDone, onStop])

  // The combo cheer floats away after a moment
  useEffect(() => {
    if (!combo) return
    const timer = setTimeout(() => setCombo(0), 1300)
    return () => clearTimeout(timer)
  }, [combo])

  const next = text[position]
  const finger = next ? fingerFor(next) : undefined
  const shift = next ? shiftFor(next) : undefined
  const progress = position / text.length

  return (
    <section className="exercise">
      {/* One stretch per round; the current one fills as she types correct keys (REQUIREMENTS M5) */}
      <div className="progress" aria-label={`Ronde ${round + 1} van ${rounds}`}>
        <div className="progress-track">
          {Array.from({ length: rounds }, (_, i) => (
            <span key={i} className={i < round ? `progress-part done${i === round - 1 ? ' latest' : ''}` : 'progress-part'}>
              {i === round && <span className="progress-fill" style={{ width: `${progress * 100}%` }} />}
            </span>
          ))}
        </div>
        <Art name="flag" size={34} className="progress-goal" />
        <span className={cheering ? 'progress-label cheer' : 'progress-label'}>
          {cheering ? 'Goed zo! ' : ''}Ronde {round + 1} van {rounds}
        </span>
      </div>

      <div className="line-wrap">
        <p
          className={wrong ? `line wrong shake-${misses % 2}` : 'line'}
          aria-label={text}
        >
          <span className="done">{text.slice(0, Math.max(position - 1, 0))}</span>
          {/* The letter she just typed pops, so every right key feels like a little win */}
          {position > 0 && (
            <span className="done just" key={position}>
              {text[position - 1]}
            </span>
          )}
          <span className="current" key={`c${position}`}>
            {next === ' ' ? '␣' : next}
          </span>
          <span className="todo">{text.slice(position + 1)}</span>
        </p>
        {combo > 0 && (
          <span className="combo" key={combo}>
            <Art name="fire" size={30} />
            {combo} op rij!
          </span>
        )}
      </div>

      {/* Nijl types along: a little "oops" on a miss, a happy hop on a combo or a finished round */}
      <div className="hint-row">
        <Hippo size={64} className="exercise-hippo" mood={wrong ? 'oops' : combo || cheering ? 'happy' : 'idle'} />
        {/* After the first lesson she knows how it works: only the finger colours stay */}
        <p className="hint">
          {beginner && (wrong ? <>Oeps! Probeer nog eens met je </> : <>Gebruik je </>)}
          {shift && (
            <>
              <strong className={`finger-text finger-${shift.finger}`}>
                {beginner ? FINGER_NAMES[shift.finger] : `⇧ ${FINGER_NAMES[shift.finger]}`}
              </strong>
              {beginner ? ' op shift en je ' : ' '}
            </>
          )}
          <strong className={finger ? `finger-text finger-${finger}` : ''}>
            {finger ? FINGER_NAMES[finger] : ''}
          </strong>
        </p>
      </div>

      <Keyboard next={next} keys={lesson.keys} pressed={pressed} />

      {beginner && (
        <p className="small">Kijk naar het scherm, niet naar je handen. Voel de bobbeltjes op F en J. · Esc = stoppen</p>
      )}
    </section>
  )
}
