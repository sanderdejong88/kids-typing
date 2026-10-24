import { useEffect, useState, type ReactNode } from 'react'
import { Art } from './Art'
import { Hands } from './Hands'
import { Seal } from './Seal'
import { Keyboard } from './Keyboard'

type Props = {
  onDone: () => void
  onBack: () => void
}

const HOME_ROW = ['a', 's', 'd', 'f', 'j', 'k', 'l', ';']

type Step = {
  say: ReactNode
  // Keys she has to press before she can go on
  press?: string[]
  show: (pressed: string[]) => ReactNode
}

const STEPS: Step[] = [
  {
    say: (
      <>
        Hoi! Ik ben <strong>Nijl</strong>. Ik leer je typen met al je tien vingers, zonder naar de toetsen te kijken.
        Zo word je supersnel!
      </>
    ),
    show: () => <Seal size={200} mood="happy" className="welcome-seal" />,
  },
  {
    say: (
      <>
        Elke vinger heeft zijn eigen toetsen. Leg je vingers op de <strong>thuisrij</strong>: links op A S D F, rechts
        op J K L ;. Je duimen rusten op de spatiebalk.
      </>
    ),
    show: () => (
      <>
        <Hands keys={HOME_ROW} />
        <Keyboard keys={HOME_ROW} highlight={HOME_ROW} />
      </>
    ),
  },
  {
    say: (
      <>
        Voel je de <strong>bobbeltjes</strong> op F en J? Daar horen je wijsvingers. Zo vind je de thuisrij altijd
        terug zonder te kijken. Druk maar op <strong>F</strong> en <strong>J</strong>!
      </>
    ),
    press: ['f', 'j'],
    show: (pressed) => (
      <>
        <Hands keys={['f', 'j']} pressed={pressed}>
          <ul className="intro-keys">
            {['f', 'j'].map((key) => (
              <li key={key} className={`intro-key finger-${key === 'f' ? 'left' : 'right'}-index`}>
                <span className="intro-key-cap">{key.toUpperCase()}</span>
                {pressed.includes(key) ? <span className="intro-check">✓</span> : <span>druk!</span>}
              </li>
            ))}
          </ul>
        </Hands>
        <Keyboard keys={HOME_ROW} highlight={['f', 'j']} />
      </>
    ),
  },
  {
    say: (
      <>
        Zo gaat een les: typ steeds de letter die <strong>geel</strong> is. Fout? Dan wordt hij rood, en probeer je het
        gewoon nog een keer. Kijk naar het scherm, niet naar je handen.
      </>
    ),
    show: () => (
      <p className="line welcome-line" aria-hidden="true">
        <span className="done">fj</span>
        <span className="current">f</span>
        <span className="todo">jf jjf</span>
      </p>
    ),
  },
  {
    say: (
      <>
        Een les heeft 4 rondes. Daarna krijg je <strong>sterren</strong>. Met 2 sterren gaat de volgende les open. Klaar?
        Daar gaan we!
      </>
    ),
    show: () => (
      <div className="welcome-stars" aria-hidden="true">
        <Art name="star" size={70} />
        <Art name="star" size={96} />
        <Art name="star" size={70} />
      </div>
    ),
  },
]

// The full explanation, only before her very first lesson
export function Welcome({ onDone, onBack }: Props) {
  const [step, setStep] = useState(0)
  const [pressed, setPressed] = useState<string[]>([])
  const current = STEPS[step]
  const ready = (current.press ?? []).every((key) => pressed.includes(key))
  const last = step === STEPS.length - 1

  useEffect(() => {
    const next = () => (last ? onDone() : setStep(step + 1))
    function onKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      if (event.key === 'Enter' && ready) return next()
      if (event.key === 'Escape') return onBack()
      const key = event.key.toLowerCase()
      if (!current.press?.includes(key)) return
      event.preventDefault()
      setPressed((previous) => [...previous.filter((k) => k !== key), key])
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [step, last, ready, current, onDone, onBack])

  return (
    <section className="intro welcome">
      <div className="welcome-dots" aria-label={`Stap ${step + 1} van ${STEPS.length}`}>
        {STEPS.map((_, i) => (
          <span key={i} className={i <= step ? 'welcome-dot on' : 'welcome-dot'} />
        ))}
      </div>

      <div className="intro-tip">
        {step > 0 && <Seal size={84} className="fit-seal" mood={ready && current.press ? 'happy' : 'idle'} />}
        <p className="speech">{current.say}</p>
      </div>

      <div className="welcome-show" key={step}>
        {current.show(pressed)}
      </div>

      <div className="buttons">
        <button className="button primary" onClick={() => (last ? onDone() : setStep(step + 1))} disabled={!ready}>
          {last ? 'Naar les 1!' : 'Verder'} (Enter)
        </button>
        {step > 0 && (
          <button className="button" onClick={() => setStep(step - 1)}>
            Terug
          </button>
        )}
      </div>
    </section>
  )
}
