import { useCallback, useEffect, useState } from 'react'
import { Art } from './components/Art'
import { LessonIntro } from './components/LessonIntro'
import { LevelMap } from './components/LevelMap'
import { Results } from './components/Results'
import { TypingExercise } from './components/TypingExercise'
import { Welcome } from './components/Welcome'
import { combine, resultFor, type Attempt } from './lib/attempt'
import { LESSONS, makeRounds, type Lesson } from './lib/lessons'
import { loadStars, saveStars, type BestStars } from './lib/progress'
import { isMuted, play as playSound, setMuted } from './lib/sound'

type Screen =
  // After a lesson the map remembers the stars from before, to show what changed
  | { name: 'home'; before?: BestStars }
  | { name: 'welcome' | 'intro'; lesson: Lesson }
  | { name: 'exercise'; lesson: Lesson; rounds: string[]; attempts: Attempt[]; key: number }
  | { name: 'results'; lesson: Lesson; attempts: Attempt[]; before: BestStars }

// The lesson after this one, if her best result opened it
function nextLesson(lesson: Lesson, best: Record<string, number>): Lesson | undefined {
  const next = LESSONS[lesson.number]
  return next && (best[lesson.id] ?? 0) >= 2 ? next : undefined
}

function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const [best, setBest] = useState(loadStars)
  const [sound, setSound] = useState(() => !isMuted())
  const toggleSound = () => {
    setMuted(sound)
    setSound(!sound)
    if (!sound) playSound('tap')
  }

  // Until she has finished one lesson she gets the full explanation everywhere,
  // starting with a welcome before lesson 1
  const beginner = Object.keys(best).length === 0
  const intro = (lesson: Lesson) =>
    setScreen({ name: beginner && lesson.number === 1 ? 'welcome' : 'intro', lesson })
  const play = (lesson: Lesson) =>
    setScreen({ name: 'exercise', lesson, rounds: makeRounds(lesson), attempts: [], key: Date.now() })
  const home = useCallback(() => setScreen({ name: 'home' }), [])
  // Mostly for testing: back to a fresh start, as if she opens the game for the first time
  const reset = () => {
    if (!window.confirm('Alle sterren en voortgang wissen?')) return
    saveStars({})
    setBest({})
  }

  const finish = (lesson: Lesson, attempts: Attempt[]) => {
    const earned = resultFor(lesson, combine(attempts)).stars
    setBest((previous) => {
      if ((previous[lesson.id] ?? 0) >= earned) return previous
      const next = { ...previous, [lesson.id]: earned }
      saveStars(next)
      return next
    })
    setScreen({ name: 'results', lesson, attempts, before: best })
  }

  const roundDone = (attempt: Attempt) => {
    if (screen.name !== 'exercise') return
    const attempts = [...screen.attempts, attempt]
    if (attempts.length === screen.rounds.length) finish(screen.lesson, attempts)
    else setScreen({ ...screen, attempts })
  }

  // Lets the page background follow the screen (the map is all water)
  useEffect(() => {
    document.body.dataset.screen = screen.name
  }, [screen.name])

  const next = screen.name === 'results' ? nextLesson(screen.lesson, best) : undefined

  return (
    // Welcome, intro and exercise always fit on one screen; the map scrolls on purpose
    <main className={['welcome', 'intro', 'exercise'].includes(screen.name) ? 'app fit' : 'app'}>
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
        <StarTotal total={Object.values(best).reduce((sum, n) => sum + n, 0)} />
      </header>

      {screen.name === 'home' && <Home best={best} before={screen.before} onStart={intro} onReset={reset} />}
      {screen.name === 'welcome' && (
        <Welcome onDone={() => setScreen({ name: 'intro', lesson: screen.lesson })} onBack={home} />
      )}
      {screen.name === 'intro' && (
        <LessonIntro
          lesson={screen.lesson}
          beginner={beginner}
          onStart={() => play(screen.lesson)}
          onBack={home}
        />
      )}
      {screen.name === 'exercise' && (
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
        />
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
}: {
  best: BestStars
  before?: BestStars
  onStart: (lesson: Lesson) => void
  onReset: () => void
}) {
  return (
    <section className="home">
      <LevelMap best={best} before={before} onStart={onStart} />
      <button className="reset" onClick={onReset}>
        Voortgang wissen
      </button>
    </section>
  )
}

export default App
