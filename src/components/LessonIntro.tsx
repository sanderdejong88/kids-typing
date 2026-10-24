import { useEffect, useState } from 'react'
import { FINGER_NAMES, fingerFor, shiftFor } from '../lib/keyboard'
import { ISLANDS, type Lesson } from '../lib/lessons'
import { Hands } from './Hands'
import { Hippo } from './Hippo'
import { Keyboard } from './Keyboard'

type Props = {
  lesson: Lesson
  // Before her first finished lesson every instruction is spelled out
  beginner: boolean
  onStart: () => void
  onBack: () => void
}

// Shown before every lesson: which new keys, and which finger types each (REQUIREMENTS L1)
export function LessonIntro({ lesson, beginner, onStart, onBack }: Props) {
  const [pressed, setPressed] = useState<string[]>([])
  // Capitals and symbols like ? are shown per Shift key, the other keys per finger
  const withShift = lesson.newKeys.filter((key) => shiftFor(key))
  const plain = lesson.newKeys.filter((key) => !shiftFor(key))

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      if (event.key === 'Enter') return onStart()
      if (event.key === 'Escape') return onBack()
      // Capitals only count with Shift; small letters also count with Caps Lock on
      const key = lesson.newKeys.includes(event.key) ? event.key : event.key.toLowerCase()
      if (!lesson.newKeys.includes(key)) return
      event.preventDefault()
      // Re-adding the key restarts its bounce
      setPressed((previous) => [...previous.filter((k) => k !== key), key])
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [lesson, onStart, onBack])

  const allTried = lesson.newKeys.every((key) => pressed.includes(key))

  return (
    <section className="intro">
      <h2>
        {lesson.review
          ? `Herhaling: ${ISLANDS[lesson.island].name.toLowerCase()}`
          : `Les ${lesson.number}: ${lesson.topic}`}
      </h2>

      {/* After the first lesson she knows the drill; only something new, like Shift, gets explained */}
      {(beginner || (lesson.tip && !lesson.review)) && (
        <div className="intro-tip">
          <Hippo size={84} className="fit-hippo" mood={allTried ? 'happy' : 'idle'} />
          <p className="speech">
            {beginner && (
              <>
                Leg je vingers op de thuisrij en voel de bobbeltjes op <strong>F</strong> en <strong>J</strong>.
              </>
            )}
            {lesson.tip && !lesson.review && ` ${lesson.tip}`}
            {beginner && (lesson.review ? ' Nu oefenen we alles van dit eiland!' : ' Druk de nieuwe letters maar eens in!')}
          </p>
        </div>
      )}

      <Hands keys={lesson.newKeys} pressed={pressed}>
        {!lesson.review && withShift.length > 0 && <CapitalGroups keys={withShift} pressed={pressed} />}
        {!lesson.review && plain.length > 0 && (
          <ul className="intro-keys">
            {plain.map((key) => {
              const finger = fingerFor(key)!
              return (
                <li key={key} className={`intro-key finger-${finger} ${pressed.includes(key) ? 'tried' : ''}`}>
                  <span className="intro-key-cap">{key.toUpperCase()}</span>
                  <span>
                    met je <strong>{FINGER_NAMES[finger]}</strong>
                  </span>
                  {pressed.includes(key) && <span className="intro-check">✓</span>}
                </li>
              )
            })}
          </ul>
        )}
      </Hands>

      <Keyboard keys={lesson.keys} highlight={lesson.newKeys} />

      <div className="buttons">
        <button className="button primary" onClick={onStart}>
          Start! (Enter)
        </button>
        <button className="button" onClick={onBack}>
          Terug naar de kaart
        </button>
      </div>
      {beginner && <p className="small">of druk op Enter om te beginnen</p>}
    </section>
  )
}

// Capitals and symbols like ? come in two groups, one per hand, each with its Shift on the other side
function CapitalGroups({ keys, pressed }: { keys: string[]; pressed: string[] }) {
  const groups = ['ShiftRight', 'ShiftLeft']
    .map((shift) => keys.filter((key) => shiftFor(key)?.key === shift))
    .filter((group) => group.length > 0)
  return (
    <ul className="intro-keys">
      {groups.map((group) => {
        const finger = shiftFor(group[0])!.finger
        const tried = group.every((key) => pressed.includes(key))
        return (
          <li key={finger} className={`intro-key finger-${finger} ${tried ? 'tried' : ''}`}>
            <span className="intro-key-cap">⇧</span>
            <span>
              <strong>{group.join(' ')}</strong>
              <br />
              shift met je <strong>{FINGER_NAMES[finger]}</strong>
            </span>
            {tried && <span className="intro-check">✓</span>}
          </li>
        )
      })}
    </ul>
  )
}
