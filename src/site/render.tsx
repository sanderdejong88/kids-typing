import { renderToStaticMarkup } from 'react-dom/server'
import { GOATCOUNTER } from '../lib/analytics'
import { Layout, type Page } from './Layout'
import { PAGES } from './pages'

// Turns the pages for parents and teachers into whole HTML documents (see site-pages.ts)

const ORIGIN = 'https://gratistypenleren.nl'

export const PATHS = PAGES.map((page) => page.path)

const escape = (text: string) =>
  text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

// Breadcrumbs, and for a page with questions the questions and answers
function structuredData(page: Page): object[] {
  const crumbs = [{ path: '/', name: 'Home' }, ...(page.parent ? [page.parent] : []), page]
  const data: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((crumb, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: crumb.name,
        item: ORIGIN + crumb.path,
      })),
    },
  ]
  if (page.faq) {
    data.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.text },
      })),
    })
  }
  return data
}

export function renderPage(path: string): string {
  const page = PAGES.find((candidate) => candidate.path === path)
  if (!page) throw new Error(`No page for ${path}`)
  const footer = PAGES.filter((other) => !other.parent || other.parent.path === '/').map(({ path, name }) => ({ path, name }))
  const body = renderToStaticMarkup(<Layout page={page} footer={footer} />)
  const title = escape(`${page.title} | Gratis typen leren`)
  const description = escape(page.description)
  const url = ORIGIN + page.path
  const json = structuredData(page)
    .map((item) => `<script type="application/ld+json">${JSON.stringify(item).replaceAll('<', '\\u003c')}</script>`)
    .join('\n    ')
  return `<!doctype html>
<html lang="nl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${url}" />
    <meta name="theme-color" content="#2f7ff0" />
    <meta property="og:type" content="article" />
    <meta property="og:locale" content="nl_NL" />
    <meta property="og:site_name" content="Gratis typen leren" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${ORIGIN}/og-image.png" />
    <meta name="twitter:card" content="summary_large_image" />
    ${json}
    <script type="module" src="/src/site/styles.ts"></script>
    <script data-goatcounter="${GOATCOUNTER}" async src="https://gc.zgo.at/count.js"></script>
  </head>
  <body class="site">
    ${body}
  </body>
</html>
`
}
