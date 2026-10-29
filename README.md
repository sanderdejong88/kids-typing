# Typen maar!

A free typing tutor that a 9-year-old and her dad are building together.

- Live: https://gratistypenleren.nl/
- Research: [docs/RESEARCH.md](docs/RESEARCH.md)
- Requirements: [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md)
- SEO plan: [docs/SEO-PLAN.md](docs/SEO-PLAN.md)
- Credits for illustrations and font: [CREDITS.md](CREDITS.md)

## Develop

```bash
npm install
npm run dev
```

`npm run lint`, `npm test` and `npm run build` run the same checks as CI.

## Pipeline

- Every push to `main`: lint, test, typecheck and build, then deploy to GitHub Pages. We commit straight to `main`, with no PRs.
