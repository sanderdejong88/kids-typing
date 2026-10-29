import { useEffect, useState } from 'react'
import { band, loadName, saveName, type Certificate as Earned } from '../lib/awards'
import { play } from '../lib/sound'
import { Art } from './Art'
import { Confetti } from './Confetti'
import { LogoParts } from './Logo'
import { Seal } from './Seal'

type Props = {
  // 75 and 100 give a certificate, 120 the diploma (REQUIREMENTS D3)
  level: number
  earned: Earned
  onBack: () => void
}

const DIPLOMA = 120

// A certificate to print or save as a PDF (via the browser's print dialog), with her name,
// the date, her speed and accuracy, and for the diploma the band she reached
export function Certificate({ level, earned, onBack }: Props) {
  const [name, setName] = useState(loadName)
  const diploma = level >= DIPLOMA
  const date = new Date(earned.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })

  useEffect(() => {
    play('complete')
  }, [])

  // Escape goes back, unless she is typing her name
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !(event.target instanceof HTMLInputElement)) onBack()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onBack])

  return (
    <section className="certificate-screen">
      <Confetti fire={1} amount={diploma ? 260 : 140} />

      <div className={diploma ? 'certificate diploma' : 'certificate'}>
        <div className="certificate-arts">
          <Art name={diploma ? 'trophy' : 'medal'} size={64} />
          <Art name="diploma" size={84} />
          <Art name={diploma ? 'crown' : 'glowing-star'} size={64} />
        </div>
        <div className="certificate-logo" role="img" aria-label="Gratis typen leren">
          <LogoParts />
        </div>
        <h1>{diploma ? 'Typediploma' : 'Oorkonde'}</h1>
        <p>Dit is voor</p>
        <input
          className="certificate-name"
          value={name}
          placeholder="Typ hier je naam"
          aria-label="Je naam"
          maxLength={40}
          onChange={(event) => {
            setName(event.target.value)
            saveName(event.target.value)
          }}
        />
        <p className="certificate-what">
          {diploma ? (
            <>
              want jij kunt blind typen met tien vingers, op het niveau{' '}
              <strong>{band(earned.apm) >= 175 ? '175 en meer' : band(earned.apm)}</strong>!
            </>
          ) : (
            <>want jij typt al {level} aanslagen per minuut met tien vingers!</>
          )}
        </p>
        <div className="certificate-facts">
          <span>
            <strong>{earned.apm}</strong> aanslagen per minuut
          </span>
          <span>
            <strong>{earned.accuracy}%</strong> goed
          </span>
          <span>{date}</span>
        </div>
        <div className="certificate-sign">
          <span className="certificate-site">gratistypenleren.nl</span>
          <Seal size={72} still />
          <span>Snuf de zeehond</span>
        </div>
      </div>

      <div className="certificate-buttons">
        <button className="button" onClick={onBack}>
          Terug
        </button>
        <button
          className="button primary"
          onClick={() => {
            play('tap')
            window.print()
          }}
        >
          Printen
        </button>
      </div>
    </section>
  )
}
