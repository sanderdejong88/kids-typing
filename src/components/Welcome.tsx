import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { Art } from './Art'
import { Hands } from './Hands'
import { ANCHOR_SAY, AnchorCheck, POSTURE } from './Ready'
import { Seal } from './Seal'
import { Keyboard } from './Keyboard'
import { play } from '../lib/sound'

type Props = {
  onDone: () => void
  onBack: () => void
}

const HOME_ROW = ['a', 's', 'd', 'f', 'j', 'k', 'l', ';']

type Step = {
  say: ReactNode
  // She can only go on once her fingers are on the home row
  anchor?: boolean
  show: (anchored: () => void) => ReactNode
}

const STEPS: Step[] = [
  {
    say: (
      <>
        Hoi! Ik ben <strong>Snuf</strong>. Ik leer je typen met al je tien vingers, zonder naar de toetsen te kijken.
        Zo word je supersnel!
      </>
    ),
    show: () => <Surfacing />,
  },
  ...POSTURE,
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
        terug zonder te kijken. {ANCHOR_SAY}
      </>
    ),
    anchor: true,
    show: (anchored) => <AnchorCheck onDone={anchored} />,
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
  const [anchored, setAnchored] = useState(false)
  const current = STEPS[step]
  const ready = !current.anchor || anchored
  const last = step === STEPS.length - 1

  useEffect(() => {
    const next = () => (last ? onDone() : setStep(step + 1))
    function onKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      if (event.key === 'Enter' && ready) return next()
      if (event.key === 'Escape') return onBack()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [step, last, ready, onDone, onBack])

  return (
    <section className="intro welcome">
      <div className="welcome-dots" aria-label={`Stap ${step + 1} van ${STEPS.length}`}>
        {STEPS.map((_, i) => (
          <span key={i} className={i <= step ? 'welcome-dot on' : 'welcome-dot'} />
        ))}
      </div>

      <div className="intro-tip">
        {/* It points at what it explains, and cheers once she has pressed the keys */}
        {step > 0 && (
          <Seal
            size={84}
            className="fit-seal"
            mood={ready && current.anchor ? 'happy' : 'idle'}
            pose={ready && current.anchor ? 'sit' : 'point'}
          />
        )}
        <p className="speech">{current.say}</p>
      </div>

      <div className="welcome-show" key={step}>
        {current.show(() => setAnchored(true))}
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

// The seal says hello by coming up from the sea: bubbles, a splash, a little swim,
// then a leap onto an ice floe where it sits and hops for joy
type Phase = 'under' | 'up' | 'leap' | 'sit'

export function Surfacing() {
  const [phase, setPhase] = useState<Phase>('under')

  useEffect(() => {
    const timers = [
      setTimeout(() => {
        setPhase('up')
        play('splash')
      }, 700),
      setTimeout(() => {
        setPhase('leap')
        play('splash')
      }, 2300),
      setTimeout(() => setPhase('sit'), 2900),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const swimming = phase === 'under' || phase === 'up'
  return (
    <div className={`welcome-scene ${phase}`} aria-label="Een zeehond duikt op uit de zee" role="img">
      <svg viewBox="0 0 300 300" className="welcome-sea" aria-hidden="true">
        <defs>
          <linearGradient id="welcome-sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5cc0ff" />
            <stop offset="1" stopColor="#1f86d8" />
          </linearGradient>
        </defs>
        {/* A round patch of sea with a foamy edge, so it floats on the page like the islands */}
        <path
          d="M14 214 Q4 184 40 177 q27 -8 55 0 t55 0 t55 0 t55 -2 Q298 186 288 216 Q300 278 150 294 Q0 278 14 214 Z"
          fill="#d6efff"
        />
        <path
          d="M22 214 Q14 188 44 182 q26 -8 53 0 t53 0 t53 0 t53 -2 Q290 190 280 216 Q290 272 150 286 Q10 272 22 214 Z"
          fill="url(#welcome-sea)"
        />
        <g fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.5">
          <path d="M44 226 q10 -6 20 0" />
          <path d="M232 232 q10 -6 20 0" />
          <path d="M76 268 q10 -6 20 0" />
          <path d="M200 272 q10 -6 20 0" />
        </g>
        {/* The ice floe the seal leaps onto */}
        <path d="M68 180 H234 L222 197 H82 Z" fill="#c4e4f6" />
        <path d="M68 180 Q70 166 100 164 H204 Q232 166 234 180 Z" fill="#fff" stroke="#a9d3ec" strokeWidth="2.5" />
        <path d="M110 170 h30 M168 172 h22" stroke="#d9eefa" strokeWidth="3" strokeLinecap="round" />
      </svg>

      {phase === 'under' && (
        <span className="welcome-bubbles" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      )}
      {(phase === 'up' || phase === 'leap') && (
        <span className="welcome-splash" key={phase} aria-hidden="true">
          {[-70, -40, -15, 15, 40, 70].map((angle) => (
            <i key={angle} style={{ '--angle': `${angle}deg` } as CSSProperties} />
          ))}
        </span>
      )}

      <Seal
        size={180}
        className="welcome-seal"
        pose={swimming ? 'swim' : 'sit'}
        mood={phase === 'sit' || phase === 'leap' ? 'happy' : 'idle'}
      />
    </div>
  )
}
