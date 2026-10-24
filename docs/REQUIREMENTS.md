# Requirements (draft v0.4)

**TL;DR:** A free, ad-free web app that teaches a 9-year-old to touch-type in Dutch, modelled on what the popular courses do: a fixed key order in small steps, weak keys coming back more often, stars that reward accuracy first, short daily sessions, games inside the lesson path and a typing diploma at the end. Speeds are shown in *aanslagen per minuut* (apm), like Dutch diplomas. Her choices are recorded in section 14.

_Status: draft. Each requirement says which course(s) it is based on; details and sources are in [RESEARCH.md](RESEARCH.md). Assumptions are marked **(A)**. Priority: **M** = MVP, **S** = soon after, **C** = could have._

## 1. Goal and success

- **Goal:** she types with ten fingers without looking at the keyboard.
- **Success criteria (proposal):**
  - All letters touch-typed at ≥ 95% accuracy.
  - First milestone **75 apm** (≈ 15 WPM) after about 8 weeks, then 100 apm, then diploma level **120 apm at ≥ 95%** (≈ 24 WPM) after about 4–5 months. Basis: the Dutch diplomas ask 100–120 apm (Typetuin, Typeworld, Typetopia, TypeMission), and Typetuin uses 75 apm as an adjusted norm. Vendor norms for age 9 are 12–20 WPM (Typesy, TypingClub). She is at the young end, since Dutch courses start from group 6 (age 9–10).
  - She *wants* to open it and practises ≥ 4 days a week without being pushed.

## 2. Users

- **Child (primary):** 9 years old, Dutch, types on a **Chromebook**. She already types with a few fingers while looking, so the app has to actively unlearn that habit.
- **Parent (secondary):** wants to see progress and set a daily goal, without a big dashboard.

## 3. Course structure

| # | Requirement | Prio | Based on |
|---|---|---|---|
| C1 | A **world map** of 8–10 levels ("islands"). Each level introduces a group of keys and ends with a level test that unlocks the next one. | M | Typeworld (20 islands), Typetuin (8 levels), Dance Mat (4×3 stages) |
| C2 | **Key order (proposal, US-QWERTY, tuned to Dutch letter frequency):**<br>1. `f j` → `d k` → `s l` → `a ;` → `g h`<br>2. `e i` → `r u` → `t o` → review<br>3. `n` space words → `v m` → `c ,` → `b .` → review<br>4. `w p` → `'` (for *auto's*) → `z y` → `q x /` → review<br>5. Capitals with Shift, using the opposite hand<br>6. `? ! : -`<br>7. Numbers: `4 7` → `3 8` → `2 9` → `1 0` → `5 6`<br>No course publishes a Dutch order, so this is our own design **(A)**. | M | TypingClub (pairs, row by row, opposite-hand Shift, numbers 4 7 first), Typetopia (letters → `, .` → capitals → `; : ? !` → numbers) |
| C3 | **2 new keys per step**, with a review step after every 3–4 steps. | M | TypingClub, Typing.com (3 per lesson), Dance Mat |
| C4 | **Dutch specifics:** practise `ij` as a two-letter combination once `i` and `j` are known (*blij, tijd, wij*). `IJ` at the start of a sentence counts as two capitals (*IJsland*). The apostrophe arrives early because of plurals (*auto's, foto's*). Accented letters (é, ë, ï) are left out, and practice words avoid them (decided 2026-10-24). | M | Dutch research report |
| C5 | Content in every exercise uses **only unlocked keys**. | M | keybr, TypingClub, Typetuin |

## 4. Lesson anatomy

Every step follows the same fixed order, like TypingClub and Typetuin:

| # | Requirement | Prio | Based on |
|---|---|---|---|
| L1 | **Intro before every lesson** (unscored): two drawn hands where the fingers for the new keys light up with the letter above the fingertip, a card per key with the finger name, and the keyboard with the new keys glowing. She can press the new keys to try them; Enter starts. | M | TypingClub, Jungle Junior, Typeworld (intro video per island) |
| L2 | **Drill:** single letters, then letter sequences (`fjfj jffj`). | M | Typetuin, Ratatype |
| L3 | **Anchor drill:** one hand keeps its index finger on F or J while the other hand types. This makes hunt-and-peck impossible. | S | TypingClub (anchoring) |
| L4 | **Words:** real Dutch words that fit the unlocked keys, then word sequences. | M | Typetuin, TypingClub |
| L5 | **Sentences and mini stories** once enough letters are known. They are age-appropriate and, where possible, about her interests. | M | TypingClub (story lessons), Typetopia (adventure story) |
| L6 | **Weak-key exercise:** generated from her slowest and least accurate keys. | M | TypingClub (Dynamic), keybr, every Dutch course |
| L7 | **Game** as part of the path, played with the current keys (see M5). | M | TypingClub, Typeworld, TypeMission |
| L8 | **Level test** at the end of each level: a longer text with a speed and accuracy threshold. | M | Typeworld, Typetuin, TypeMission (weekly test) |
| L9 | **A lesson is 4 short rounds** (about 30 characters each): 2× only the new keys, 1× mixed with known keys, 1× words. The result counts all rounds together and shows the speed per round, since the first round is always slow (feedback 2026-10-24). | M | TypingClub, Ratatype |

## 5. Pass rules and scoring

| # | Requirement | Prio | Based on |
|---|---|---|---|
| P1 | **Stars per exercise, accuracy first:** ★ finished, ★★ ≥ 90%, ★★★ ≥ 95% *and* the speed goal for the level reached. | M | Typing.com (90/95% thresholds), TypingClub (100% + speed for top stars) |
| P2 | **Speed goals rise per level**, from about 25 apm at level 1 to 120 apm at the final level (proposal: 25 → 35 → 50 → 65 → 80 → 95 → 110 → 120 apm). | M | Typetuin (L1 25 apm/50% → L9 100 apm/90%), TypingClub (beginner goal 10 WPM) |
| P3 | **A level unlocks** when the level test reaches ≥ 2 stars and every key in the level reaches its confidence target (keybr rule: rolling average time per correct keystroke is under the target). | M | keybr, Typetuin (≥ 3 stars per level) |
| P4 | Unlimited retries. The best result counts. | M | TypingClub, Typetuin |
| P5 | **Error handling, two modes:** "stop on error" (the cursor waits until the right key is typed, default) and "continue". Backspace on or off per exercise. | M | TypingClub (block on errors), Nitro Type, Typetuin (Backspace disabled in some exercises), Mavis Beacon |
| P6 | Two accuracy measures: **first-try accuracy** (used for stars) and accuracy after corrections. | S | TypingClub ("real accuracy") |
| P7 | Speeds shown in **apm** (characters including spaces per minute) **and WPM** (1 word = 5 characters). | M | Dutch courses (apm on diplomas) |

## 6. Guidance and "don't look"

| # | Requirement | Prio | Based on |
|---|---|---|---|
| G1 | **On-screen keyboard** in the Chromebook US-QWERTY layout (Search/Launcher key instead of Caps Lock, no function row). The next key is highlighted. | M | All courses |
| G2 | **Colour per finger, mirrored on both hands** (e.g. index red, middle yellow, ring green, pinky blue, thumbs grey), and a **hand diagram** showing which finger to use. | M | TypingClub/Jungle Junior, Typetuin |
| G3 | The on-screen keyboard **fades out** for keys she already knows well, so she stops looking. | S | Proposal (A); a software replacement for Typetopia's "Blindbox" |
| G4 | **Posture check** before each session: sit up straight, feet flat, wrists free, fingers on the F/J bumps. | M | Typetuin, TypingClub ("Sit straight" video), Gigakids |
| G5 | A **break reminder** after 10–15 minutes. | S | TypingClub ("Take a break") |
| G6 | **Look-up detection (experiment):** long pauses before keys she knows suggest she is looking down, which triggers a gentle "eyes on the screen" hint. | C | Proposal (A), unproven |
| G7 | Optional **read-aloud** for the new letter and instructions (browser speech synthesis). | S | TypingClub voice-over, Typetuin, Typeworld |
| G8 | "Say the letter in your head" tip. | C | Typetuin |

## 7. Motivation

| # | Requirement | Prio | Based on |
|---|---|---|---|
| M1 | Stars per exercise and a star total per level on the map. | M | TypingClub, Typing.com, Typetuin |
| M2 | A **daily goal** (default 10 minutes) and a **streak** (practice days in a row). Missing one day doesn't break the streak, so that a busy week doesn't hurt. **(A)** | M | TypingClub (5-day streak badge), Typetuin |
| M3 | **Badges** for streaks (3/7/14/30 days), speed milestones (25/50/75/100 apm), perfect exercises, minutes practised and a level completed. | M | TypingClub badges, Typing.com achievements |
| M4 | **Currency and unlockables:** points for error-free work, spent on avatar items, themes and keyboard skins. | S | Typetuin (diamonds → avatar), TypeMission (SpyShop), Nitro Type |
| M5 | **At least 1 mini-game** that uses only unlocked keys (falling words or balloons), placed in the lesson path and also playable as a reward. The game moves forward only on correct keystrokes, so accuracy feels physical. | M | TypingClub (Balloon Valley, Monster Attack), Nitro Type, Typeworld |
| M6 | **Theme and story:** a blue hippo mascot guides her through a world map of water and islands. The style is cheerful and kid-friendly, with bright colours led by blue and gold. | M | Typetopia (space), TypeMission (spies), Typeworld (islands), Typetuin (garden) |
| M7 | **Race against your own ghost** (previous best) instead of against other people. | C | Nitro Type (adapted, no strangers) |
| M8 | **Parent challenge:** a parent does the same exercise and gets compared with her. | C | Typetopia |

## 8. Diploma

| # | Requirement | Prio | Based on |
|---|---|---|---|
| D1 | **Practice exams** become available after all letters and capitals. | S | Typetuin, Typetopia (3 practice exams) |
| D2 | **Exam:** an 8-minute text. The score is correct apm, with ≥ 95% accuracy required. The diploma norm is **120 apm**. Three attempts; the best one counts. The exam opens only when the practice exams average ≥ 120 apm. | S | Typetuin (8 min, 3 attempts, practice average), Typetopia (95%) |
| D3 | **Printable diploma (PDF)** with her name, date, apm and accuracy, plus a band (120 / 150 / 175+ apm). Also milestone certificates at 75 and 100 apm. | S | Typetuin (apm bands), Ratatype, every Dutch course |

## 9. Progress and parent view

| # | Requirement | Prio | Based on |
|---|---|---|---|
| R1 | **Progress screen:** apm and accuracy over time, minutes per day, and a calendar of practice days. | M | TypingClub (calendar), Monkeytype, Typetopia parent account |
| R2 | **Heatmap of weak keys and fingers** on the keyboard. | M | TypingClub, keybr, Typetopia |
| R3 | Parent settings: daily goal, error mode, Backspace on or off, sound, font size. | M | TypingClub/Typing.com (teacher settings), Mavis Beacon |
| R4 | Weekly summary on screen (a "report card") with the trend for the week. Not by email, since there is no backend. | S | Typetuin and TypeMission (weekly parent email), adapted |
| R5 | Replay of an exercise. | C | TypingClub |

## 10. Settings and accessibility

| # | Requirement | Prio | Based on |
|---|---|---|---|
| A1 | Large, readable font with 3 sizes. Calm colours. | M | TypingClub (5 font sizes) |
| A2 | Sound on or off (key click and error sound). | M | TypingClub, Typing.com |
| A3 | Dyslexia option: a dyslexia-friendly font and extra letter spacing, with the current letter underlined in colour. | C | Typetuin (OpenDyslexic), Typeworld, Typing.com |
| A4 | Option to hide the live speed display, so she isn't under pressure. | S | Typing.com K-1, Mavis Beacon |

## 11. Technical and non-functional

| # | Requirement | Prio |
|---|---|---|
| T1 | Primary target is **Chrome on a Chromebook** (11–14" screens, 1366×768). It must also work in other modern browsers. A physical keyboard is required. | M |
| T2 | Input through `KeyboardEvent.key`, not key codes. Block browser shortcuts that get in the way (for example `'` Quick Find in Firefox). | M |
| T3 | **Static site** on GitHub Pages, with no backend. | M |
| T4 | Progress stored **locally** (localStorage/IndexedDB) for one profile, plus **export/import** as a backup file, because a Powerwash erases everything. | M |
| T5 | **No ads, no tracking, no external requests**. Fonts and sounds are bundled. | M |
| T6 | Works offline after the first visit (PWA). | C |
| T7 | Multiple profiles (siblings, friends). | C |

## 12. Open decisions

1. **Chromebook layout:** confirm US-QWERTY (a single `\` key above Enter).

## 13. Out of scope

- Multiplayer or competition with strangers, and chat.
- Teacher or class management.
- Mobile and touchscreen typing.
- Accounts and a backend (for now).

## 14. Decisions log

- 2026-10-24: Dutch; static site with one profile stored in the browser; Chromebook; she starts at hunt-and-peck level; Vite + React + TypeScript on GitHub Pages; we build it together with her.
- 2026-10-24 (her choices):
  - **Theme and mascot:** a hippo (*nijlpaard*). Cheerful and kid-friendly, with bright colours led by blue and gold.
  - **Illustrations:** open source only. We use Twemoji (CC BY 4.0). The mascot is our own drawing: a chubby pastel blue-lilac hippo with a pink snout and a yellow duckling on its head. It moves (breathing, blinking, ear wiggle, hopping for joy, a wobble on a mistake). Credits are in [CREDITS.md](../CREDITS.md).
  - **Accented letters:** left out. Practice words avoid é, ë and ï.
  - **Units:** show both apm and WPM.
  - **Stop on error** is the default.
  - **Diploma norm:** 120 apm at ≥ 95% accuracy.
- 2026-10-24 (after trying it):
  - The map is a game-style winding path; level 1 at the top, the trophy at the bottom.
  - More repetition: 4 rounds per lesson instead of 1 line (first 5, cut to 4 because a level took too long).
  - After a lesson, motivate to go straight on: a big "Op naar de volgende!" button and Enter, instead of going back to the map.
  - The intro and the exercise always fill exactly one screen height; nothing may fall off the bottom (Chromebook leaves about 650px).
- 2026-10-24 (after all keys were in): the next steps are repetition and speed, built as four parts:
  - **Daily practice (L6, M2):** an "Oefen vandaag" button beside the map drills her 3 weakest letters, based on the rolling average time and miss rate per key. It earns no stars. A ring around the button fills to a **daily goal of 5 minutes of typing** **(A)**: typing time only, so about two lessons with intros and results. A **streak** of practice days sits next to the star counter, and missing one day doesn't break it.
  - **Balloon game (M5):** 60 seconds of typing the words on rising balloons, only with letters she knows. It speeds up with every popped balloon and keeps her record. It sits beside the map as a reward rather than in the lesson path **(A)**, and its time counts for the daily goal.
  - **Island test (L8):** the review at the end of each island became the island test: a longer text (3 rounds of 12 groups). Two stars need 90% accuracy *and* 70% of the island's speed goal.
  - **Island 9, Snelheid (D1–D3):** speed lessons for 75, 100 and 120 apm, where two stars need 90% accuracy and the goal, then the diploma exam: 5 rounds of sentences, passed at 120 apm with 95% accuracy (three stars from 150 apm). The exam is shorter than the 8 minutes of D2 **(A)**, because 8 minutes is long for her age. Certificates at 75 and 100 apm and the diploma (with band 120/150/175+) can be printed or saved as PDF, with her name on them.
