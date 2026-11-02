import { useEffect, useState, type ReactNode } from 'react'
import { LogoParts } from './Logo'
import { Surfacing } from './Welcome'
import { track } from '../lib/analytics'

type Props = {
  onKeyboard: () => void
  // The card for parents, the same one as below the map
  children: ReactNode
}

const SHOTS = [
  { file: 'kaart', alt: 'De kaart met eilanden en lessen' },
  { file: 'typen', alt: 'Een les: typ de gele letter' },
]

// On a phone or tablet without a keyboard there is nothing to type with. Mostly a parent
// finds the site this way, so Snuf says hello and helps to come back on a computer.
export function Phone({ onKeyboard, children }: Props) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    track('mobiel/getoond')
    // A key pressed on a real keyboard is proof enough
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.length === 1 || event.key === 'Enter') onKeyboard()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onKeyboard])

  // The share sheet sends the link by WhatsApp or mail; without it the link is copied
  const share = async () => {
    const url = `${location.origin}/`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Gratis typen leren', text: 'Typen leren met Snuf, op de computer:', url })
        track('mobiel/link-gedeeld')
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        track('mobiel/link-gekopieerd')
      }
    } catch {
      // Cancelled, or not allowed: the link is still on the screen
    }
  }

  return (
    <section className="phone">
      <h1 className="phone-logo" aria-label="Gratis typen leren">
        <LogoParts />
      </h1>

      <Surfacing />

      <p className="speech">
        Hoi! Ik ben <strong>Snuf</strong>. Typen leer je op een <strong>echt toetsenbord</strong>. Kom terug op een
        computer, laptop of Chromebook, dan gaan we samen oefenen!
      </p>

      <button className="button primary" onClick={share}>
        {copied ? 'Link gekopieerd!' : 'Stuur de link naar jezelf'}
      </button>
      <p className="phone-url">gratistypenleren.nl</p>

      <div className="phone-shots">
        {SHOTS.map((shot) => (
          <img key={shot.file} src={`/screenshots/${shot.file}.jpg`} alt={shot.alt} width={800} height={537} />
        ))}
      </div>

      {children}

      <button
        className="reset"
        onClick={() => {
          track('mobiel/toch-toetsenbord')
          onKeyboard()
        }}
      >
        Ik heb toch een toetsenbord
      </button>
    </section>
  )
}
