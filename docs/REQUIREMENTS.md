# Requirements (draft v0.2)

**TL;DR:** A free, ad-free web app that teaches a 9-year-old to touch-type through short daily lessons. Keys unlock adaptively, starting from the home row, with a playful reward layer and a simple parent view. Open questions at the bottom need answers before we pick a tech stack.

_Status: draft. Everything here is a proposal. Assumptions are marked **(A)**._

## 1. Goal and success

- **Goal:** she can type with all ten fingers without looking at the keyboard.
- **Success criteria (proposal):**
  - Touch-types the full alphabet at ≥ 95% accuracy.
  - ~15 WPM after 6–8 weeks, ~25 WPM after 3 months. (Rough targets; adult average is ~40.)
  - She *wants* to open it: practises ≥ 4 days/week without being pushed.

## 2. Users

- **Child (primary):** 9 years old, Dutch-speaking, types on a **Chromebook**. Already types a bit with a couple of fingers while looking at the keys, so the app must actively *unlearn* that habit. Short attention span for drills, so it needs fun and quick wins.
- **Parent (secondary):** wants to see progress and maybe set a daily goal, without a big dashboard.

## 3. Must have (MVP)

**Learning**
- R1. Lesson path: home row → top row → bottom row → capitals (Shift) → punctuation → numbers. New keys come in groups of 2–4.
- R2. Adaptive unlocking: the next key unlocks only when current keys meet an accuracy/speed threshold (keybr-style).
- R3. Extra practice on weak keys, which show up more often in exercises.
- R4. On-screen keyboard that highlights the next key, plus colour-coding per finger and a hand diagram showing which finger to use.
- R5. Accuracy before speed: errors are shown gently. Choose between "must correct" and "continue" modes.
- R6. Sessions of about 10 minutes, made up of 1–2 minute exercises.
- R7. Practice content in **Dutch**: letter drills → real words → short sentences and mini stories, all age-appropriate. Words are filtered so they contain only unlocked keys. Accented letters (é, ë) are left out until late.
- R7b. Short intake test at the start (1 min) to measure her current level, plus a "don't look" reminder (hands on the home row, F/J bumps).

**Motivation**
- R8. 1–3 stars per exercise (accuracy + speed).
- R9. Daily streak and daily goal (e.g. 10 min).
- R10. Badges and unlockables (avatar items, themes) earned through practice.
- R11. At least 1 mini-game as a reward (e.g. falling words / balloons) that only uses already-unlocked keys.

**Parent / data**
- R12. Progress screen: accuracy and WPM over time, time practised per day, heatmap of weak keys.
- R13. Progress saved without an account, locally in the browser (one profile), plus export/import as a backup file, because clearing Chromebook data or a Powerwash erases local storage.

**Non-functional**
- R14. Primary target: **Chrome on a Chromebook** (screens are often small, 11–14", 1366×768). Must also work in other modern browsers. Physical keyboard required; tablets are out of scope.
- R15. On-screen keyboard follows the **Chromebook US-QWERTY layout**: a Search/Launcher key where Caps Lock usually is, no function-key row. Use `KeyboardEvent.key` for input, not key codes.
- R15b. Hosted online as a static site (e.g. GitHub Pages / Netlify / Cloudflare Pages), with no backend.
- R16. No ads, no tracking, no external data sharing, privacy-friendly for a child.
- R17. Large, readable font, calm colours, sound on/off.

## 4. Should / could have (later)

- Certificate ("typediploma") at the end of each level, printable.
- Typing stories that she can choose or co-create, with personalised content (her name, her pets, her favourite topics).
- Multiple profiles (siblings, friends).
- Sync between devices (needs a small backend or a cloud store).
- Race against her own "ghost" (previous best) instead of against other people.
- English mode.
- PWA / offline support.

## 5. Out of scope

- Multiplayer or online competition with strangers.
- Teacher/class management.
- Mobile/touchscreen typing.

## 6. Decisions (2026-10-24)

- Language: Dutch.
- Hosting: online static site, one profile, progress in the browser.
- Device: Chromebook.
- Starting level: hunt-and-peck.

## 7. Open questions

1. **Theme / interests:** what does she like? (animals, space, horses, games…) This drives the visual theme and story content.
2. ~~Your role~~: decided, we build it together with her.
3. **Chromebook layout:** confirm it's US-QWERTY (most common in NL). Check the key above Enter: a single `\` key, or a different layout?
4. ~~Tech stack~~: decided, Vite + React + TypeScript, public GitHub repo, GitHub Pages via GitHub Actions.
