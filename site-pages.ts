import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { createServer, type Plugin, type ViteDevServer } from 'vite'

// The pages for parents and teachers (docs/SEO-PLAN.md, phase 2) are React components that
// become plain HTML: in the dev server on every request, in a build as extra HTML entries.
// They load only CSS, no React, so they are quick and every word is readable for Google.

const RENDER = '/src/site/render.tsx'
const ORIGIN = 'https://gratistypenleren.nl'

type Render = { PATHS: string[]; renderPage: (path: string) => string }

// The HTML entry for a path, such as /voor-ouders/ → <root>/voor-ouders/index.html
const entryFor = (root: string, path: string) => resolve(root, `.${path}index.html`)

// A build has no dev server to render with, so it starts a small one of its own
async function renderAll(root: string): Promise<Map<string, string>> {
  const server = await createServer({
    root,
    configFile: false,
    plugins: [react()],
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: 'custom',
    logLevel: 'error',
  })
  try {
    const { PATHS, renderPage } = (await server.ssrLoadModule(RENDER)) as Render
    return new Map(PATHS.map((path) => [path, renderPage(path)]))
  } finally {
    await server.close()
  }
}

function sitemap(paths: string[]): string {
  const urls = ['/', ...paths].map((path) => `  <url>\n    <loc>${ORIGIN}${path}</loc>\n  </url>`)
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
}

export function sitePages(): Plugin {
  let root = process.cwd()
  // HTML per entry file, during a build
  const pages = new Map<string, string>()
  let paths: string[] = []

  return {
    name: 'site-pages',

    async config(config, { command }) {
      if (command !== 'build') return
      root = config.root ? resolve(config.root) : process.cwd()
      const rendered = await renderAll(root)
      paths = [...rendered.keys()]
      const input: Record<string, string> = { main: resolve(root, 'index.html') }
      for (const [path, html] of rendered) {
        const entry = entryFor(root, path)
        pages.set(entry, html)
        input[path.slice(1, -1).replaceAll('/', '-')] = entry
      }
      return { build: { rollupOptions: { input } } }
    },

    resolveId(id) {
      if (pages.has(id)) return id
    },

    load(id) {
      return pages.get(id)
    },

    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap(paths) })
    },

    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0] ?? '/'
        if (url === '/' || (/\.\w+$/.test(url) && url !== '/sitemap.xml')) return next()
        try {
          const { PATHS, renderPage } = (await server.ssrLoadModule(RENDER)) as Render
          if (url === '/sitemap.xml') {
            res.setHeader('Content-Type', 'application/xml')
            return res.end(sitemap(PATHS))
          }
          const path = url.endsWith('/') ? url : `${url}/`
          if (!PATHS.includes(path)) return next()
          if (path !== url) {
            res.writeHead(301, { Location: path })
            return res.end()
          }
          res.setHeader('Content-Type', 'text/html')
          res.end(await server.transformIndexHtml(url, renderPage(path)))
        } catch (error) {
          next(error)
        }
      })
    },
  }
}
