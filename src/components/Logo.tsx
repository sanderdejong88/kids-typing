import type { CSSProperties } from 'react'

// One colour per key of "typen", from the colours of the fingers. Not the finger that types
// each letter: T, Y and N are all index fingers, and three red keys looked odd.
export const KEY_COLOURS = ['var(--coral)', 'var(--gold)', 'var(--violet)', 'var(--mint)', 'var(--blue)']

// The name of the site (gratistypenleren.nl) as a logo: the letters of "typen" are
// colourful keys, like on the keyboard in a lesson
export function Logo() {
  return (
    <h1 className="logo" aria-label="Gratis typen leren">
      <LogoParts />
    </h1>
  )
}

// The logo without its place on the map, for on a certificate
export function LogoParts() {
  return (
    <>
      <span className="logo-free" aria-hidden="true">
        gratis
      </span>
      <span className="logo-keys" aria-hidden="true">
        {[...'typen'].map((letter, i) => (
          <span key={i} className="logo-key" style={{ '--i': i, '--finger': KEY_COLOURS[i] } as CSSProperties}>
            {letter}
          </span>
        ))}
      </span>
      <span className="logo-word" aria-hidden="true">
        leren
      </span>
    </>
  )
}
