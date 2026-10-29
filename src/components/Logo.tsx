import type { CSSProperties } from 'react'
import { fingerFor } from '../lib/keyboard'

// The name of the site (gratistypenleren.nl) as a logo: the letters of "typen" are keys in
// the colour of the finger that types them, like on the keyboard in a lesson
export function Logo() {
  return (
    <h1 className="logo" aria-label="Gratis typen leren">
      <span className="logo-free" aria-hidden="true">
        gratis
      </span>
      <span className="logo-keys" aria-hidden="true">
        {[...'typen'].map((letter, i) => (
          <span key={i} className={`logo-key finger-${fingerFor(letter)}`} style={{ '--i': i } as CSSProperties}>
            {letter}
          </span>
        ))}
      </span>
      <span className="logo-word" aria-hidden="true">
        leren
      </span>
    </h1>
  )
}
