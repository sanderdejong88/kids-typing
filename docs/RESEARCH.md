# Research: existing typing apps for kids

**TL;DR:** The good kids' apps (TypingClub, Typesy, Typetuin) lock their best parts (stories, games, no ads, progress reports) behind roughly $35–100 a year or a paid course. Free options are either ad-heavy, built for adults (keybr, Monkeytype), or games that assume you can already type (Nitro Type). There is room for a free app with **a structured course + kid-friendly game layer + Dutch practice text**.

_Researched 2026-10-24 using web search. Prices come from blogs and aggregators, and they conflict, so treat them as rough. Verify on vendor sites before quoting them._

## Landscape

| App | Model / price (approx.) | Strengths | Weaknesses for us |
|---|---|---|---|
| **TypingClub** (edclub) | Free with ads; premium ~$35–78/yr (sources conflict) | Very structured (hundreds of short lessons), stars and badges, on-screen hand guide, voice-over | Ads; stories, games, themes and replays are premium; English only |
| **Typing.com** | Free with ads; ad-free paid | Small steps for beginners, ages 7+, many games | Ads; school-oriented; English |
| **Typesy** | ~$67 family (4 kids) / ~$97 (10); 7-day trial | Polished, video coaching, games | Paid, subscription-like |
| **Ratatype** | Free + premium (limits on exercises, ads) | Games, certificates, multilingual | Daily exercise cap on free plan |
| **Nitro Type** | Free (ads, cosmetic purchases) | Very motivating racing, social | Not a course; needs basic skill first; competitive pressure |
| **Dance Mat Typing** (BBC Bitesize) | Free | Fun characters, home row first, ages 6+ | Only 4 levels, short. One source says it's still Flash; I believe the BBC rebuilt it in HTML5, but that's **unverified** |
| **keybr** | Free | Smart adaptive lessons (new letters unlock as you master them), focus on weak keys | Abstract nonsense words, adult look, not kid-friendly |
| **Monkeytype** | Free, open source | Great stats, themes | Speed test, not a tutor |
| **Tux Typing / Klavaro** | Free, open source | Kid theme (Tux), many layouts (Klavaro) | Desktop apps; Tux looks dated or discontinued |
| **Typetuin / TypeMission / Type-Uniek** (NL) | Paid courses, price not public (Typetuin: 8 lessons with a coach + 1 yr online + diploma) | Dutch, diploma, coaching, practice schedule (2× 15 min/day) | Expensive, schedule-bound |

## Patterns worth copying

1. **Home row first, then 2–4 new keys at a time** (TypingClub, Dance Mat, practitioner guidance).
2. **Adaptive unlocking**: a new letter appears only once current keys are accurate enough (keybr). This is the strongest learning mechanic found.
3. **Accuracy before speed.** Small studies with young kids show touch typing without looking down after about 2 weeks of short daily sessions, when accuracy is stressed. Evidence is thin (n=18 study, no age-9-specific trials).
4. **On-screen keyboard plus hand/finger colours** showing which finger to use. This matters for not looking down.
5. **Short sessions** (10–15 min) and **daily streaks**. Typetuin recommends 2× 15 min/day.
6. **Visible rewards**: stars per lesson, badges, unlockable themes or avatars, a "diploma" at the end (big in the Dutch course market).
7. **Real words and stories** after the basics. This is a premium feature everywhere, so it's a differentiator for us.
8. **Games as a reward or practice mode**, not the core: falling words, racing, balloons.

## Gaps we can fill

- **Free and ad-free, with no account needed.**
- **Dutch words and sentences** suited to a 9-year-old (and English as an option).
- **Personalisation**: her name, her interests (animals, horses, space…) in the practice texts.
- **Parent view**: simple progress (accuracy, WPM, time practised, weak keys) without a teacher dashboard.

## Course details (feature level)

_Added 2026-10-24 as the basis for [REQUIREMENTS.md](REQUIREMENTS.md) v0.3. Most facts come from vendor handbooks, help pages and FAQs. Third-party or unverified facts are marked._

### International

- **TypingClub "Typing Jungle".** Source: the teacher handbook, the best primary source found.
  - Size: about 684 lessons.
  - Key order:
    - Home row: `f j k d s l`, `a ; g h`
    - Top row: `r u e i w o`, `q y p t`
    - Bottom row: `v m c ,`, `z / b n`
    - Then sentences, Tricky Words and Shift (opposite hand, row by row), followed by numbers (`4 7` first) and symbols.
  - Lesson types:
    - Unscored key intro with finger instructions
    - Practice
    - Dynamic (built from weak keys)
    - Anchoring (hold F/J with one hand)
    - Travel diagonals
    - Common Patterns
    - Story lessons
    - Games in the path
    - Short videos on posture and breaks
  - Stars: 0–5. Five stars need the speed goal and 100% accuracy. The default pass is 1 star, and beginner goals are min 3 / goal 10 WPM.
  - Error setting: "Block on errors" stops at the 1st, 2nd or 3rd error.
  - Badges: WPM milestones, streaks (5–120 days), minutes per session, perfect lessons.
  - Stats: weak keys and fingers, a practice calendar, attempt replay.
  - Accessibility: 5 font sizes, high contrast, voice-over.
  - Jungle Junior (younger kids): each letter gets a song video, a "Finger Gym" and typing. Finger colours are mirrored on both hands: red index, yellow middle, green ring, blue pinky.
- **Typing.com.**
  - Key order: starts from `f j space`, 3 keys per lesson (`u r k`, `d e i`, `c g n` …), with review lessons in between.
  - Stars depend on accuracy only: 1 for finishing, 2 at ≥ 90%, 3 at ≥ 95%.
  - The K–1 version hides WPM and streaks for young kids, accepts letters without Shift and adds read-aloud.
  - Accessibility: dyslexic font, low-vision theme, one-hand modes.
- **Dance Mat Typing** (third-party sources only): 4 levels × 3 stages. Order: home row → `e i` → `r u` → `t y` → `w o` → `p q` → `v m` → `n b` → `c ,` → `x z` → `/` → Shift.
- **keybr.** Letters come in order of letter frequency, and Dutch is supported. A new letter unlocks when every active key reaches confidence ≥ 1 against a 35 WPM target (an exponential moving average of the time per keystroke, counting only error-free keystrokes). That rule comes from a second-hand reading of its code. Exercises are pseudo-words weighted toward weak keys.
- **Ratatype.** 15 lessons ordered by finger rather than row, with "cryptograms" (nonsense strings). The certificate test won't continue past a typo.
- **Nitro Type.** The car only moves on correct keys, and a typo must be fixed by typing the right key (no Backspace). Points buy cosmetics.
- **Mavis Beacon Kidz.** Settings for Backspace on/off, guide hands, WPM goal and hiding the WPM gauge.
- **Speed norms** (vendor guidance, not official): about grade 3 12–15 WPM, grade 4 18–20 WPM at 85–90% accuracy (Typesy). One measured sample of grades 5–6 averaged 16.9 WPM (AJOT 2020).

### Dutch and Flemish

| Course | Structure | Schedule | Diploma / exam | Notable features |
|---|---|---|---|---|
| **Typetuin** | 8 levels + bonus level. Each level: letters → sequences → words → lines → practice exam. Level thresholds rise from 25 apm / 50% to 100 apm / 90%. | 2× 15 min/day, 5 days/week, about 14 weeks | 8-minute text, ≥ 100 correct apm (75 under adjusted norm), 3 attempts | Finger colours, hearts as error budget, Backspace off in some exercises, diamonds → avatar, weekly report to parents, dyslexia mode |
| **Typetopia** | 20 modules × 5 missions. Letters → `, .` → capitals → `; : ? !` → numbers | 20 min, 3–5×/week, 20–33 weeks | 120 apm at ≥ 95% accuracy, 3 practice exams | Physical "Blindbox" over the hands, blind-typing score, parent account, "Parent Challenge" |
| **TypeMission** (LOI Kidzz) | 20 weeks: letters in weeks 1–11, then speed | 10–15 min, 5×/week | "Blind and error-free", ≥ 120 apm | Spy story, games, shop, weekly parent email |
| **Typeworld** (Type-Uniek) | 20 islands, each with an intro video, exercises, games and a test that unlocks the next island | 10–12 weeks, 20–40 hours | 100 apm at 98% | Duels with other kids, dyslexia options |
| **Gigakids** | 12 group lessons + 15 min/day at home | — | > 100 apm | Teacher checks posture |

- **Common NL patterns:**
  - Short daily sessions.
  - A world or level map with unlock tests.
  - Weak keys come back more often.
  - A diploma at 100–120 apm with practice exams first.
  - A theme with a guide character.
  - Weekly reports for parents.
  - Dyslexia modes.
  - Posture before every session.
  - Blind typing is encouraged but rarely enforced.
- **Not published anywhere:** the exact key order of the Dutch courses, and how they handle `ij`, é/ë and apostrophes.
- **Age:** Dutch courses start around group 6 (age 9–10). Van der Meijden (*Typ jij blind?*, 2023) places real blind-typing courses in groups 6–8. SLO's draft core goals don't mention blind typing.
- **apm vs WPM:** apm counts characters including spaces. 100 apm ≈ 20 WPM at 5 characters per word (our assumption; no course publishes a conversion).

## Sources

- [iD Tech – 11 best typing apps & games for kids](https://www.idtech.com/blog/best-typing-apps-and-games-for-kids)
- [WeAreTeachers – 25+ typing apps for students](https://www.weareteachers.com/typing-apps-for-students/)
- [Teaching Ideas – typing resources for schools](https://www.teachingideas.co.uk/computing/typing-resources-for-schools)
- [Gitnux – best kids typing software 2026](https://gitnux.org/best/kids-typing-software/)
- [Everyday Reading – TypingClub pricing](https://everyday-reading.com/typing-practice/)
- [FitGap – TypingClub](https://us.fitgap.com/products/typingclub)
- [Typesy community – pricing changes](https://community.typesy.com/t/changes-in-pricing/1106)
- [Ratatype – parent's checklist](https://ratatype.fr/faq/key-considerations-for-choosing-a-typing-program-a-parents-checklist)
- [Typetuin – parent info sheet](https://www.typetuin.nl/informatiebrief-typetuin)
- [AlternativeTo – Tux Typing alternatives](https://alternativeto.net/software/tux-typing)
- [Valdosta State – touch typing for first graders (thesis)](https://vtext.valdosta.edu/items/a2c304a0-25d5-4920-b70a-05591eaa68d3)
- [Macquarie – intensive keyboard training field study](https://researchers.mq.edu.au/en/publications/a-field-study-report-of-intensive-computer-keyboard-training-with/)
- [Keyboarding research (Newport News PS)](https://sbo.nn.k12.va.us/assistivetech/doc/keyboarding_research.pdf)
- [TypingClub – Typing Jungle teacher handbook (PDF)](https://login.typingclub.com/m/edclubdocs/media/pdf/typing-jungle-handbook.pdf)
- [TypingClub – Jungle Junior handbook (PDF)](https://static.typingclub.com/m//edclubdocs/media/pdf/jungle-junior-handbook.pdf)
- [edclub – glossary (stars)](https://edclub.com/help/faq/glossary.html)
- [edclub – on-error behaviour](https://edclub.com/help/class-management/class-settings/on-error-behavior.html)
- [Typing.com – keyboarding curriculum](https://www.typing.com/curriculum/keyboarding)
- [Typing.com – how stars work](https://support.typing.com/en/articles/9049793)
- [Kidztype – Dance Mat Typing overview](https://kidztype.com/blog/?p=302)
- [keybr.com source (GitHub)](https://github.com/aradzie/keybr.com)
- [Ratatype – curriculum](https://ratatype.com/faq/ratatype-curriculum/)
- [Typesy – typing speed benchmarks K-12](https://typesy.com/reasonable-typing-speed-benchmarks-k-12/)
- [Typetuin – FAQ](https://www.typetuin.nl/veelgestelde-vragen/)
- [Typetopia – FAQ](https://www.typetopia.com/veel-gestelde-vragen/)
- [Typetopia – typediploma](https://www.typetopia.com/typecursus/typediploma/)
- [TypeMission – how it works](https://www.typemission.be/hoe-werkt-het/)
- [Type-Uniek – Typeworld](https://www.type-uniek.nl/typeworld/)
- [Gigakids – flyer (PDF)](https://www.gigakids.nl/wp-content/uploads/Flyer-GigaKids-achterkant.pdf)
- [Van der Meijden – Typ jij blind? (preview PDF)](https://www.nt2.nl/media/42/inkijk_typ_jij_blind1.pdf)
