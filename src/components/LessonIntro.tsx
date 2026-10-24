import { useEffect, useState } from 'react'
import { FINGER_NAMES, fingerFor, shiftFor } from '../lib/keyboard'
import { ISLANDS, type Lesson } from '../lib/lessons'
import { play } from '../lib/sound'
import { Hands } from './Hands'
import { Seal } from './Seal'
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
      // A chime the first time each new key is found, a soft tick after that
      play(pressed.includes(key) ? 'key' : 'round')
      // Re-adding the key restarts its bounce
      setPressed((previous) => [...previous.filter((k) => k !== key), key])
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [lesson, pressed, onStart, onBack])

  const allTried = lesson.newKeys.every((key) => pressed.includes(key))

  return (
    <section className="intro">
      <h2>{titleOf(lesson)}</h2>

      {/* After the first lesson she knows the drill; only something new, like Shift, gets explained */}
      {(beginner || lesson.tip) && (
        <div className="intro-tip">
          <Seal size={84} className="fit-seal" mood={allTried ? 'happy' : 'idle'} />
          <p className="speech">
            {beginner && (
              <>
                Leg je vingers op de thuisrij en voel de bobbeltjes op <strong>F</strong> en <strong>J</strong>.
              </>
            )}
            {lesson.tip && ` ${lesson.tip}`}
            {beginner && lesson.kind === 'lesson' && ' Druk de nieuwe letters maar eens in!'}
          </p>
        </div>
      )}

      <Hands keys={lesson.newKeys} pressed={pressed}>
        {lesson.kind !== 'test' && withShift.length > 0 && <CapitalGroups keys={withShift} pressed={pressed} />}
        {lesson.kind !== 'test' && plain.length > 0 && (
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

function titleOf(lesson: Lesson): string {
  switch (lesson.kind) {
    case 'test':
      return `Eilandtoets: ${ISLANDS[lesson.island].name.toLowerCase()}`
    case 'speed':
      return `Snelheid: ${lesson.goalApm} aanslagen per minuut`
    case 'exam':
      return 'Het typediploma'
    case 'daily':
      return 'Oefen vandaag: je lastige letters'
    default:
      return `Les ${lesson.number}: ${lesson.topic}`
  }
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
