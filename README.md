# Typen maar!

A free typing tutor that a 9-year-old and her dad are building together.

- Live: https://sanderdejong88.github.io/kids-typing/
- Research: [docs/RESEARCH.md](docs/RESEARCH.md)
- Requirements: [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md)

## Develop

```bash
npm install
npm run dev
```

`npm run lint`, `npm test` and `npm run build` run the same checks as CI.

## Pipeline

- Every pull request: lint, test, typecheck and build.
- Every push to `main`: the same checks, then deploy to GitHub Pages.
