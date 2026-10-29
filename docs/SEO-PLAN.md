# SEO plan (draft v0.1, 2026-10-29)

**TL;DR:** Google can barely read the game (one empty `<div id="root">`), and the people who search are parents and teachers, not children. So we add a technical base (phase 1, done), then a few real pages for parents, free tools that earn links, and outreach to schools. Expect results after 3–6 months on a domain this new.

_Status: draft. Search volumes are **not verified**; check them in Google Keyword Planner, or after 4 weeks in Search Console. Assumptions are marked **(A)**._

## Where we stand

- Our edge: the paid courses (Typetuin, Typeworld, Typetopia, TypeMission) cost money and need an account. We are free, with no account and no ads. That message goes on every page.
- The domain name itself matches the query "gratis typen leren".

## Target queries (A)

`gratis typen leren`, `typen leren kinderen gratis`, `blind typen leren`, `typecursus gratis`, `typediploma gratis`, `typen leren groep 6`, `typetest apm`, `welke vinger welke toets`.

## Phase 1: technical base (done 2026-10-29)

- [x] `public/robots.txt` and `public/sitemap.xml`
- [x] Canonical URL, Open Graph and Twitter tags, share image `public/og-image.png` (1200×630)
- [x] JSON-LD: `WebSite` and `WebApplication` (free, Dutch, from group 6)
- [x] `<noscript>` text and a short card for parents below the map
- [ ] Google Search Console and Bing Webmaster Tools via a DNS record, then submit the sitemap (needs the domain owner)
- [ ] Check that `sanderdejong88.github.io/kids-typing` redirects to the domain, so Google doesn't see two copies
- [ ] Cookieless analytics (GoatCounter or Plausible), no Google Analytics on a site for children. Goal event: first lesson started

## Phase 2: pages for parents and teachers (built 2026-10-29)

The pages are React components in `src/site/` that `site-pages.ts` turns into plain HTML: on every request in the dev server, as extra HTML entries in a build. They load only CSS, no JavaScript. The lesson pages are built from `src/lib/lessons.ts`, so keys, example words and speed goals always match the game. `sitemap.xml` is generated from the same list.

| Page | Purpose | Target query (A) |
|---|---|---|
| `/hoe-werkt-het/` | How the game works: posture check, rounds, stars, daily practice, games | typen leren kinderen |
| `/lessen/` + 9 island pages | The islands, their keys, lessons, example words and speed goal | typecursus gratis |
| `/voor-ouders/` | Cost, age, time per day, unlearning two-finger typing, where progress is kept | typen leren kind gratis |
| `/voor-leerkrachten/` | Use in class, no accounts, progress per Chromebook profile | typen leren in de klas |
| `/typediploma/` | apm explained, certificates at 75 and 100, diploma at 120 at 95% | typediploma gratis |
| `/vingerzetting/` | Which finger types which key, table generated from the keyboard | welke vinger welke toets |
| `/blind-typen-leren/` | 8 tips | blind typen leren |
| `/typen-leren-op-chromebook/` | Chromebook keyboard, school Chromebooks | typen leren chromebook |
| `/veelgestelde-vragen/` | FAQ, with FAQPage structured data | – |

Still open: real screenshots of the game on `/hoe-werkt-het/`, and a check in Search Console after a few weeks of which pages get impressions.

## Phase 3: free tools that earn links (month 2)

- Typing speed test in apm
- Printable keyboard colouring page with a colour per finger
- Printable practice diploma

## Phase 4: links and awareness (months 2–3)

- Listings on sites for teachers and digiboard collections
- School newsletters (start with our own school), parent forums and blogs
- The story "a dad and his 9-year-old build a free typing course" on LinkedIn or Reddit

## Notes

- Write for the parent, not the child. Long text stays out of the game itself.
- FAQ schema adds little: since 2023 Google shows FAQ rich results almost only for government and health sites.
- Measure: impressions and clicks in Search Console, position for the 5 main queries, first lessons started per week.
