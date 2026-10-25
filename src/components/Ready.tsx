import { useEffect, useState, type ReactNode } from 'react'
import { fingerFor } from '../lib/keyboard'
import { ANCHORS, START, TAPS, anchorDone, anchorDown, anchorUp } from '../lib/ready'
import { play } from '../lib/sound'
import { Hands } from './Hands'
import { Keyboard } from './Keyboard'
import { Seal } from './Seal'

const HOME_ROW = [...ANCHORS, ...TAPS]

// How to sit, explained once in full: in the welcome and the first time the daily check comes
export const POSTURE: { say: ReactNode; show: () => ReactNode }[] = [
  {
    say: (
      <>
        Zo zit je goed: met je <strong>rug recht</strong> en je voeten plat op de grond. Je buik zit precies voor het{' '}
        <strong>midden</strong> van het toetsenbord, tussen G en H.
      </>
    ),
    show: () => <SitScene />,
  },
  {
    say: (
      <>
        Schuif je laptop een stukje naar achteren. Je <strong>ellebogen</strong> hangen ontspannen langs je lijf en je
        handen liggen <strong>recht</strong> voor de toetsen, niet scheef.
      </>
    ),
    show: () => <ArmsScene />,
  },
]

export const ANCHOR_SAY = (
  <>
    Houd je wijsvingers op <strong>F</strong> en <strong>J</strong> (voel de bobbeltjes!) en tik dan met je andere
    vingers <strong>D K S L A ;</strong>
  </>
)

type Props = {
  // The first time she gets the full explanation of how to sit, after that only a reminder
  full: boolean
  onDone: () => void
  onBack: () => void
}

// Once a day, before her first lesson or game: sit up straight and put the fingers on the home row (REQUIREMENTS G4)
export function ReadyCheck({ full, onDone, onBack }: Props) {
  const steps = full ? POSTURE.length + 1 : 1
  const [step, setStep] = useState(0)
  const [ready, setReady] = useState(false)
  const posture = full ? POSTURE[step] : undefined
  const checking = step === steps - 1

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') return onBack()
      if (event.key === 'Enter' && !checking) setStep(step + 1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [step, checking, onBack])

  // A moment to see the seal cheer, then on to where she was going
  useEffect(() => {
    if (!ready) return
    const timer = setTimeout(onDone, 1200)
    return () => clearTimeout(timer)
  }, [ready, onDone])

  return (
    <section className="intro welcome ready">
      <h2>Klaarzitten!</h2>
      {full && (
        <div className="welcome-dots" aria-label={`Stap ${step + 1} van ${steps}`}>
          {Array.from({ length: steps }, (_, i) => (
            <span key={i} className={i <= step ? 'welcome-dot on' : 'welcome-dot'} />
          ))}
        </div>
      )}

      <div className="intro-tip">
        <Seal size={84} className="fit-seal" mood={ready ? 'happy' : 'idle'} pose={ready ? 'sit' : 'point'} />
        <p className="speech">
          {posture?.say}
          {!full && <>Daar ben je weer! Eerst even goed gaan zitten: rug recht, midden voor je laptop, ellebogen los. </>}
          {checking && (ready ? <strong>Top, je zit klaar!</strong> : ANCHOR_SAY)}
        </p>
      </div>

      <div className="welcome-show" key={step}>
        {posture ? posture.show() : <AnchorCheck onDone={() => setReady(true)} />}
      </div>

      <div className="buttons">
        {!checking && (
          <button className="button primary" onClick={() => setStep(step + 1)}>
            Verder (Enter)
          </button>
        )}
        {full && step > 0 && (
          <button className="button" onClick={() => setStep(step - 1)}>
            Terug
          </button>
        )}
        {(!full || step === 0) && (
          <button className="button" onClick={onBack}>
            Terug naar de kaart
          </button>
        )}
      </div>
    </section>
  )
}

// Both index fingers hold F and J while the other fingers tap their home keys one by one.
// No timer: with F and J held down there is no way to do it with two fingers.
export function AnchorCheck({ onDone }: { onDone: () => void }) {
  const [state, setState] = useState(START)
  const [last, setLast] = useState<string>()
  const done = anchorDone(state)

  useEffect(() => {
    if (done) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      const key = event.key.toLowerCase()
      if (!HOME_ROW.includes(key)) return
      event.preventDefault()
      // Holding a key repeats it; only the first press counts
      if (event.repeat) return
      const next = anchorDown(state, key)
      if (next.done > state.done) play(anchorDone(next) ? 'unlock' : 'key')
      setState(next)
      setLast(key)
    }
    function onKeyUp(event: KeyboardEvent) {
      setState(anchorUp(state, event.key.toLowerCase()))
    }
    // Keys let go in another window never send a keyup here
    const reset = () => setState(START)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', reset)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', reset)
    }
  }, [state, done])

  useEffect(() => {
    if (done) onDone()
  }, [done, onDone])

  const anchored = state.held.length === ANCHORS.length
  // First the index fingers, then each finger in turn
  const wanted = done ? [] : anchored ? [TAPS[state.done]] : ANCHORS.filter((key) => !state.held.includes(key))

  return (
    <>
      <Hands keys={wanted} pressed={last ? [last] : []}>
        <ul className="anchor-keys">
          {HOME_ROW.map((key, i) => {
            const ok = i < ANCHORS.length ? state.held.includes(key) || done : i - ANCHORS.length < state.done
            return (
              <li key={key} className={`anchor-key finger-${fingerFor(key)} ${ok ? 'ok' : ''}`}>
                {key.toUpperCase()}
              </li>
            )
          })}
        </ul>
      </Hands>
      <p className={state.slipped ? 'anchor-hint slipped' : 'anchor-hint'}>
        {state.slipped ? 'Oeps, je liet los! Houd F en J vast en begin opnieuw.' : anchored || done ? ' ' : 'Houd F en J vast…'}
      </p>
      <Keyboard keys={HOME_ROW} highlight={wanted} />
    </>
  )
}

// Seen from across the desk: the seal sits up straight, right behind the middle of the laptop
function SitScene() {
  return (
    <div className="ready-scene" role="img" aria-label="Snuf zit rechtop, precies in het midden achter de laptop">
      <Seal size={170} className="ready-seal" still />
      <svg viewBox="0 0 300 80" className="ready-desk" aria-hidden="true">
        <rect x="0" y="54" width="300" height="26" rx="6" className="ready-table" />
        <path d="M76 6 H224 Q230 6 230 12 V56 H70 V12 Q70 6 76 6 Z" className="ready-lid" />
        <circle cx="150" cy="31" r="8" className="ready-logo" />
        <line x1="150" y1="-150" x2="150" y2="80" className="ready-middle" />
      </svg>
      <span className="ready-label">midden</span>
    </div>
  )
}

// Seen from above: arms that hang loose with straight hands, and a laptop so close the hands bend
function ArmsScene() {
  return (
    <div className="ready-arms">
      <TopView good />
      <TopView good={false} />
    </div>
  )
}

function TopView({ good }: { good: boolean }) {
  // The laptop further away lets the elbows hang and the hands lie straight
  const y = good ? 46 : 96
  const arms = good
    ? ['M40 168 L32 140 L54 102 L56 84', 'M100 168 L108 140 L86 102 L84 84']
    : ['M40 168 L6 162 L48 142 L62 126', 'M100 168 L134 162 L92 142 L78 126']
  return (
    <figure className={good ? 'ready-top good' : 'ready-top bad'}>
      <svg viewBox="0 0 140 190" aria-hidden="true">
        <rect x="0" y="0" width="140" height="190" rx="14" className="ready-table" />
        <rect x="26" y={y - 10} width="88" height="7" rx="3" className="ready-lid" />
        <rect x="26" y={y} width="88" height="36" rx="5" className="ready-keys" />
        {/* Each arm twice: a darker edge underneath, the skin on top */}
        {arms.map((d) => (
          <path key={`${d}-edge`} d={d} className="ready-arm-edge" />
        ))}
        {arms.map((d) => (
          <path key={d} d={d} className="ready-arm" />
        ))}
        <ellipse cx="70" cy="196" rx="48" ry="28" className="ready-body" />
      </svg>
      <figcaption>{good ? '✓ Zo wel' : '✗ Te dichtbij'}</figcaption>
    </figure>
  )
}
