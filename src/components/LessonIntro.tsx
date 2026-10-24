import { useEffect, useState } from 'react'
import { FINGER_NAMES, fingerFor } from '../lib/keyboard'
import { ISLANDS, type Lesson } from '../lib/lessons'
import { Hands } from './Hands'
import { Hippo } from './Hippo'
import { Keyboard } from './Keyboard'

type Props = {
  lesson: Lesson
  onStart: () => void
  onBack: () => void
}

// Shown before every lesson: which new keys, and which finger types each (REQUIREMENTS L1)
export function LessonIntro({ lesson, onStart, onBack }: Props) {
  const [pressed, setPressed] = useState<string[]>([])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      if (event.key === 'Enter') return onStart()
      if (event.key === 'Escape') return onBack()
      const key = event.key.toLowerCase()
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
        {lesson.review ? `Herhaling: ${ISLANDS[lesson.island].name.toLowerCase()}` : `Les ${lesson.number}: nieuwe letters`}
      </h2>

      <div className="intro-tip">
        <Hippo size={84} mood={allTried ? 'happy' : 'idle'} />
        <p className="speech">
          Leg je vingers op de thuisrij en voel de bobbeltjes op <strong>F</strong> en <strong>J</strong>.
          {lesson.review ? ' Nu oefenen we alles van dit eiland!' : ' Druk de nieuwe letters maar eens in!'}
        </p>
      </div>

      <Hands keys={lesson.newKeys} pressed={pressed} />

      {!lesson.review && (
        <ul className="intro-keys">
          {lesson.newKeys.map((key) => {
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

      <Keyboard keys={lesson.keys} highlight={lesson.newKeys} />

      <div className="buttons">
        <button className="button primary" onClick={onStart}>
          Start!
        </button>
        <button className="button" onClick={onBack}>
          Terug naar de kaart
        </button>
      </div>
      <p className="small">of druk op Enter om te beginnen</p>
    </section>
  )
}
