import type { CSSProperties, ReactNode } from 'react'
import { fingerFor } from '../lib/keyboard'

export type Question = { q: string; a: ReactNode; text: string }

export type Page = {
  // Starts and ends with a slash, such as /voor-ouders/
  path: string
  // The <title>, without the site name
  title: string
  description: string
  h1: string
  // A short name for the menu, the footer and the breadcrumbs
  name: string
  // The page one level up, for the breadcrumbs (the home page is always first)
  parent?: { path: string; name: string }
  lead: ReactNode
  body: ReactNode
  // Questions with answers, for FAQ structured data
  faq?: Question[]
}

// The menu at the top: the pages a parent looks for first
export const MENU = [
  { path: '/hoe-werkt-het/', name: 'Hoe werkt het?' },
  { path: '/lessen/', name: 'Lessen' },
  { path: '/voor-ouders/', name: 'Voor ouders' },
  { path: '/voor-leerkrachten/', name: 'Voor leerkrachten' },
  { path: '/veelgestelde-vragen/', name: 'Vragen' },
]

// The logo of the game, as a link home: "typen" in the colours of the fingers that type it
function SiteLogo() {
  return (
    <a className="site-logo" href="/" aria-label="Gratis typen leren, naar het spel">
      <span className="logo-free">gratis</span>
      <span className="logo-keys">
        {[...'typen'].map((letter, i) => (
          <span key={i} className={`logo-key finger-${fingerFor(letter)}`} style={{ '--i': i } as CSSProperties}>
            {letter}
          </span>
        ))}
      </span>
      <span className="logo-word">leren</span>
    </a>
  )
}

export function Start({ children = 'Begin met typen' }: { children?: ReactNode }) {
  return (
    <a className="button primary site-start" href="/">
      {children}
    </a>
  )
}

export function Layout({ page, footer }: { page: Page; footer: { path: string; name: string }[] }) {
  const crumbs = [{ path: '/', name: 'Home' }, ...(page.parent ? [page.parent] : [])]
  return (
    <>
      <header className="site-header">
        <SiteLogo />
        <nav className="site-menu" aria-label="Menu">
          {MENU.map((item) => (
            <a key={item.path} href={item.path} aria-current={item.path === page.path ? 'page' : undefined}>
              {item.name}
            </a>
          ))}
        </nav>
      </header>

      <main className="site-main">
        <nav className="site-crumbs" aria-label="Kruimelpad">
          {crumbs.map((crumb) => (
            <span key={crumb.path}>
              <a href={crumb.path}>{crumb.name}</a> ›{' '}
            </span>
          ))}
          <span aria-current="page">{page.name}</span>
        </nav>
        <article className="site-card">
          <h1>{page.h1}</h1>
          <div className="site-lead">{page.lead}</div>
          {page.body}
          {page.faq && (
            <div className="site-faq">
              {page.faq.map((item) => (
                <details key={item.q}>
                  <summary>{item.q}</summary>
                  <div>{item.a}</div>
                </details>
              ))}
            </div>
          )}
        </article>
        <aside className="site-cta">
          <p>
            <strong>Gratis, zonder account en zonder reclame.</strong> Je kind kan meteen beginnen.
          </p>
          <Start />
        </aside>
      </main>

      <footer className="site-footer">
        <nav aria-label="Alle pagina's">
          {footer.map((item) => (
            <a key={item.path} href={item.path}>
              {item.name}
            </a>
          ))}
        </nav>
        <p>Gratistypenleren.nl is gemaakt door een vader en dochter. Gratis voor iedereen, zonder reclame.</p>
      </footer>
    </>
  )
}
