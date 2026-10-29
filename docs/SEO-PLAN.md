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

## Phase 2: pages for parents and teachers (weeks 2–6)

Static HTML pages (Vite multi-page), no React needed.

| Page | Purpose |
|---|---|
| `/hoe-werkt-het` | How the game works: map, stars, streak, Snuf, with screenshots |
| `/voor-ouders` | Why touch typing, from what age, how long per day, no account |
| `/lessen` + one per level | The 9 levels, the new keys, a "tip from Snuf" per level |
| `/typediploma` | The goal (120 apm at 95%) and how the diploma works |
| `/vingerzetting` | Which finger types which key, with the hands illustration |
| `/typen-leren-op-chromebook` | Niche with little competition; many schools use Chromebooks |
| `/voor-leerkrachten` | Using it in class; progress stays on the device |
| `/veelgestelde-vragen` | Really free? Where is progress kept? Which keyboard? |

Every new page goes into `sitemap.xml`.

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
