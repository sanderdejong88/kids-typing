import { useCallback, useEffect, useState } from 'react'
import { Art } from './components/Art'
import { BallGame, BallRound } from './components/Ball'
import { FishGame, FishRound } from './components/Fish'
import { BalloonRound, Balloons } from './components/Balloons'
import { Certificate } from './components/Certificate'
import { Dock } from './components/Dock'
import { LessonIntro } from './components/LessonIntro'
import { LevelMap } from './components/LevelMap'
import { Logo } from './components/Logo'
import { ReadyCheck } from './components/Ready'
import { Results, type News } from './components/Results'
import { StreakMoment } from './components/StreakMoment'
import { Today } from './components/Today'
import { TypingExercise } from './components/TypingExercise'
import { Welcome } from './components/Welcome'
import { combine, resultFor, type Attempt } from './lib/attempt'
import { award, loadCertificates, saveCertificates, type Certificates } from './lib/awards'
import {
  DAY_GOAL_MS,
  addTime,
  forgetStreakShown,
  loadDays,
  saveDays,
  saveStreakShown,
  streak,
  streakShownToday,
  todayMs,
  type Days,
} from './lib/days'
import { addSamples, loadKeyStats, saveKeyStats, weakKeys } from './lib/keystats'
import { LESSONS, dailyLesson, furthestPlayed, isGame, makeRounds, roundKinds, type Lesson } from './lib/lessons'
import { loadStars, saveStars, type BestStars } from './lib/progress'
import { forgetReady, loadReadyDay, readyToday, saveReadyDay } from './lib/ready'
import { canFullscreen, fullscreenOnFirstInput, isFullscreen, toggleFullscreen } from './lib/fullscreen'
import { isMuted, play as playSound, setMuted } from './lib/sound'

type Screen =
  // After a lesson the map remembers the stars from before, to show what changed
  | { name: 'home'; before?: BestStars }
  | { name: 'welcome' | 'intro'; lesson: Lesson }
  // The days and certificates from before the lesson, to tell what it added
  | { name: 'exercise'; lesson: Lesson; rounds: string[]; attempts: Attempt[]; key: number; days: Days }
  | { name: 'results'; lesson: Lesson; attempts: Attempt[]; before: BestStars; news: News[]; certificate?: number }
  | { name: 'game'; game: 'balloons' | 'ball' | 'fish' }
  // The certificate goes back to where she opened it
  | { name: 'certificate'; level: number; back: Screen }
  // Sitting ready comes first, once a day, then on to where she was going
  | { name: 'ready'; then: Screen }
  // The flame of the day, after her first lesson of the day, then on to the results
  | { name: 'streak'; then: Screen }

// The lesson after this one, if her best result opened it
function nextLesson(lesson: Lesson, best: Record<string, number>): Lesson | undefined {
  if (lesson.kind === 'daily') return undefined
  const next = LESSONS[lesson.number]
  return next && (best[lesson.id] ?? 0) >= 2 ? next : undefined
}

// What a lesson added besides stars: the daily goal, a longer streak or a certificate.
// The streak is left out when the streak screen already celebrated it.
function newsFor(before: Days, after: Days, certificate?: number, flame = false): News[] {
  const news: News[] = []
  if (todayMs(before) < DAY_GOAL_MS && todayMs(after) >= DAY_GOAL_MS) news.push({ art: 'sun', text: 'Dagdoel gehaald!' })
  const days = streak(after)
  if (!flame && days > streak(before) && days > 1) news.push({ art: 'fire', text: `${days} dagen op rij!` })
  if (certificate === 120) news.push({ art: 'trophy', text: 'Je typediploma!' })
  else if (certificate) news.push({ art: 'medal', text: `Oorkonde: ${certificate} apm!` })
  return news
}

function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const [best, setBest] = useState(loadStars)
  const [keyStats, setKeyStats] = useState(loadKeyStats)
  const [days, setDays] = useState(loadDays)
  const [certificates, setCertificates] = useState<Certificates>(loadCertificates)
  const [sound, setSound] = useState(() => !isMuted())
  const toggleSound = () => {
    setMuted(sound)
    setSound(!sound)
    if (!sound) playSound('tap')
  }
  const [fullscreen, setFullscreen] = useState(isFullscreen)
  useEffect(() => {
    const changed = () => setFullscreen(isFullscreen())
    document.addEventListener('fullscreenchange', changed)
    const stop = fullscreenOnFirstInput()
    return () => {
      document.removeEventListener('fullscreenchange', changed)
      stop()
    }
  }, [])

  // Until she has finished one lesson she gets the full explanation everywhere,
  // starting with a welcome before lesson 1
  const beginner = Object.keys(best).length === 0
  const [readyDay, setReadyDay] = useState(loadReadyDay)
  const sat = () => {
    saveReadyDay()
    setReadyDay(loadReadyDay())
  }
  // The welcome explains how to sit, so it counts as sitting ready
  const ready = (next: Screen) => setScreen(readyToday(readyDay) ? next : { name: 'ready', then: next })
  const intro = (lesson: Lesson) =>
    beginner && lesson.number === 1 ? setScreen({ name: 'welcome', lesson }) : ready({ name: 'intro', lesson })
  const play = (lesson: Lesson) =>
    setScreen({ name: 'exercise', lesson, rounds: makeRounds(lesson), attempts: [], key: Date.now(), days })
  const home = useCallback(() => setScreen({ name: 'home' }), [])
  // Mostly for testing: back to a fresh start, as if she opens the game for the first time
  const reset = () => {
    if (!window.confirm('Alle sterren en voortgang wissen?')) return
    saveStars({})
    setBest({})
    saveKeyStats({})
    setKeyStats({})
    saveDays({})
    setDays({})
    saveCertificates({})
    setCertificates({})
    forgetStreakShown()
    forgetReady()
    setReadyDay(undefined)
  }

  // Every round and every game counts for the daily goal and the streak, also when she stops halfway
  const practised = (ms: number) => {
    const next = addTime(days, ms)
    saveDays(next)
    setDays(next)
    return next
  }

  const finish = (lesson: Lesson, attempts: Attempt[], daysNow: Days, daysBefore: Days) => {
    const result = resultFor(lesson, combine(attempts))
    // The daily practice is not on the map, so it earns no stars to keep
    if (lesson.kind !== 'daily') {
      setBest((previous) => {
        if ((previous[lesson.id] ?? 0) >= result.stars) return previous
        const next = { ...previous, [lesson.id]: result.stars }
        saveStars(next)
        return next
      })
    }
    // A certificate needs what two stars need: for the diploma 120 apm at 95% (REQUIREMENTS D2)
    const certified = lesson.certificate && result.stars >= 2 ? lesson.certificate : undefined
    if (certified) {
      const next = award(certificates, certified, { apm: result.apm, accuracy: result.accuracy, date: new Date().toISOString() })
      saveCertificates(next)
      setCertificates(next)
    }
    const fresh = certified && !certificates[certified] ? certified : undefined
    // Once a day, after the first lesson, the flame gets a screen of its own first
    const flame = !streakShownToday()
    if (flame) saveStreakShown()
    const results: Screen = {
      name: 'results',
      lesson,
      attempts,
      before: best,
      news: newsFor(daysBefore, daysNow, fresh, flame),
      certificate: certified,
    }
    setScreen(flame ? { name: 'streak', then: results } : results)
  }

  const roundDone = (attempt: Attempt) => {
    if (screen.name !== 'exercise') return
    const stats = addSamples(keyStats, attempt.samples ?? [])
    saveKeyStats(stats)
    setKeyStats(stats)
    const daysNow = practised(attempt.elapsedMs)
    const attempts = [...screen.attempts, attempt]
    if (attempts.length === screen.rounds.length) finish(screen.lesson, attempts, daysNow, screen.days)
    else setScreen({ ...screen, attempts })
  }

  // The daily practice drills her three weakest letters
  const daily = dailyLesson(best, (keys) => weakKeys(keyStats, keys))
  const gameKeys = furthestPlayed(best)?.keys ?? []

  // Lets the page background follow the screen (the map is all water)
  useEffect(() => {
    document.body.dataset.screen = screen.name
  }, [screen.name])

  const next = screen.name === 'results' ? nextLesson(screen.lesson, best) : undefined

  return (
    // Welcome, intro and exercise always fit on one screen; the map scrolls on purpose
    <main className={['welcome', 'ready', 'intro', 'exercise', 'game'].includes(screen.name) ? 'app fit' : 'app'}>
      {/* Esc stops a game or lesson too, but not everyone knows that */}
      {(screen.name === 'game' || screen.name === 'exercise') && (
        <button className="back-button" onClick={home} aria-label="Terug naar de kaart">
          <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" className="icon-line" />
          </svg>
        </button>
      )}
      <header className="top">
        <button
          className={sound ? 'sound-toggle' : 'sound-toggle off'}
          onClick={toggleSound}
          aria-label={sound ? 'Geluid uit' : 'Geluid aan'}
          aria-pressed={sound}
        >
          <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
            <path d="M4 9h4l5-4v14l-5-4H4z" className="icon-fill" />
            {sound ? (
              <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" className="icon-line" />
            ) : (
              <path d="M16 9l5 6M21 9l-5 6" className="icon-line" />
            )}
          </svg>
        </button>
        {canFullscreen() && (
          <button
            className="fullscreen-toggle"
            onClick={toggleFullscreen}
            aria-label={fullscreen ? 'Klein scherm' : 'Groot scherm'}
            aria-pressed={fullscreen}
          >
            <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
              {fullscreen ? (
                <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" className="icon-line" />
              ) : (
                <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" className="icon-line" />
              )}
            </svg>
          </button>
        )}
        {screen.name === 'home' && <Today days={days} />}
        <StarTotal total={Object.values(best).reduce((sum, n) => sum + n, 0)} />
      </header>

      {screen.name === 'home' && (
        <>
          <Home
            best={best}
            before={screen.before}
            onStart={intro}
            onReset={reset}
            onTrophy={certificates[120] ? () => setScreen({ name: 'certificate', level: 120, back: screen }) : undefined}
          />
          {daily && (
            <Dock
              daily={daily}
              todayMs={todayMs(days)}
              onDaily={() => intro(daily)}
              onGame={(game) => ready({ name: 'game', game })}
              certificates={certificates}
              onCertificate={(level) => setScreen({ name: 'certificate', level, back: screen })}
            />
          )}
        </>
      )}
      {screen.name === 'welcome' && (
        <Welcome
          onDone={() => {
            sat()
            setScreen({ name: 'intro', lesson: screen.lesson })
          }}
          onBack={home}
        />
      )}
      {screen.name === 'ready' && (
        <ReadyCheck
          full={!readyDay}
          onDone={() => {
            sat()
            setScreen(screen.then)
          }}
          onBack={home}
        />
      )}
      {screen.name === 'streak' && <StreakMoment days={days} onDone={() => setScreen(screen.then)} />}
      {screen.name === 'intro' && (
        <LessonIntro
          lesson={screen.lesson}
          beginner={beginner}
          onStart={() => play(screen.lesson)}
          onBack={home}
        />
      )}
      {screen.name === 'exercise' && roundKinds(screen.lesson)[screen.attempts.length] === 'balloons' && (
        <BalloonRound
          key={`${screen.key}-${screen.attempts.length}`}
          lesson={screen.lesson}
          text={screen.rounds[screen.attempts.length]}
          round={screen.attempts.length}
          rounds={screen.rounds.length}
          beginner={beginner}
          onDone={roundDone}
          onStop={home}
        />
      )}
      {screen.name === 'exercise' && roundKinds(screen.lesson)[screen.attempts.length] === 'ball' && (
        <BallRound
          key={`${screen.key}-${screen.attempts.length}`}
          lesson={screen.lesson}
          text={screen.rounds[screen.attempts.length]}
          round={screen.attempts.length}
          rounds={screen.rounds.length}
          beginner={beginner}
          onDone={roundDone}
          onStop={home}
        />
      )}
      {screen.name === 'exercise' && roundKinds(screen.lesson)[screen.attempts.length] === 'fish' && (
        <FishRound
          key={`${screen.key}-${screen.attempts.length}`}
          lesson={screen.lesson}
          text={screen.rounds[screen.attempts.length]}
          round={screen.attempts.length}
          rounds={screen.rounds.length}
          beginner={beginner}
          onDone={roundDone}
          onStop={home}
        />
      )}
      {screen.name === 'exercise' && !isGame(roundKinds(screen.lesson)[screen.attempts.length]) && (
        <TypingExercise
          key={`${screen.key}-${screen.attempts.length}`}
          lesson={screen.lesson}
          text={screen.rounds[screen.attempts.length]}
          round={screen.attempts.length}
          rounds={screen.rounds.length}
          beginner={beginner}
          onDone={roundDone}
          onStop={home}
        />
      )}
      {screen.name === 'results' && (
        <Results
          lesson={screen.lesson}
          attempts={screen.attempts}
          onAgain={() => play(screen.lesson)}
          next={next}
          onNext={next && (() => intro(next))}
          onHome={() => setScreen({ name: 'home', before: screen.before })}
          news={screen.news}
          onCertificate={
            screen.certificate ? () => setScreen({ name: 'certificate', level: screen.certificate!, back: screen }) : undefined
          }
        />
      )}
      {screen.name === 'game' && screen.game === 'balloons' && <Balloons keys={gameKeys} onPlayed={practised} onHome={home} />}
      {screen.name === 'game' && screen.game === 'ball' && <BallGame keys={gameKeys} onPlayed={practised} onHome={home} />}
      {screen.name === 'game' && screen.game === 'fish' && <FishGame keys={gameKeys} onPlayed={practised} onHome={home} />}
      {screen.name === 'certificate' && certificates[screen.level] && (
        <Certificate level={screen.level} earned={certificates[screen.level]} onBack={() => setScreen(screen.back)} />
      )}

      <footer className="build">versie {__BUILD_SHA__}</footer>
    </main>
  )
}

// The star counter counts up to a new total and gives a little bounce
function StarTotal({ total }: { total: number }) {
  const [counted, setCounted] = useState(total)
  // Going down (after wiping the progress) needs no counting
  const shown = Math.min(counted, total)
  useEffect(() => {
    if (shown >= total) return
    // One star at a time, roughly in step with the stars landing on the results card
    const timer = setTimeout(() => setCounted(shown + 1), 550)
    return () => clearTimeout(timer)
  }, [total, shown])
  return (
    <span className="star-total" key={shown}>
      <Art name="star" size={28} />
      {shown}
    </span>
  )
}

function Home({
  best,
  before,
  onStart,
  onReset,
  onTrophy,
}: {
  best: BestStars
  before?: BestStars
  onStart: (lesson: Lesson) => void
  onReset: () => void
  onTrophy?: () => void
}) {
  // The logo stays outside the section: while the section slides in, a fixed logo inside it
  // would slide along and then jump to its place
  return (
    <>
      <Logo />
      <section className="home">
        <LevelMap best={best} before={before} onStart={onStart} onTrophy={onTrophy} />
        <button className="reset" onClick={onReset}>
          Voortgang wissen
        </button>
        <About />
      </section>
    </>
  )
}

// A few lines for the parent or teacher who scrolls past the map, and text that search
// engines can read (docs/SEO-PLAN.md)
function About() {
  return (
    <footer className="about">
      <h2>Voor ouders en leerkrachten</h2>
      <p>
        Met Snuf leert je kind blind typen met tien vingers. Elke les brengt twee nieuwe toetsen, in vier korte
        rondjes. Wie netjes typt, verdient sterren en vaart naar het volgende eiland. Aan het eind wacht het
        typediploma: 120 aanslagen per minuut met 95% goed.
      </p>
      <ul>
        <li>Helemaal gratis, zonder account, abonnement of reclame</li>
        <li>Voor kinderen vanaf groep 6, elke dag een paar minuten werkt het best</li>
        <li>Werkt in de browser, ook op een Chromebook</li>
        <li>De voortgang blijft op dit apparaat bewaard</li>
      </ul>
    </footer>
  )
}

export default App
