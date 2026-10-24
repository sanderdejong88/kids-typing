import { useCallback, useEffect, useState } from 'react'
import { Art } from './components/Art'
import { LessonIntro } from './components/LessonIntro'
import { LevelMap } from './components/LevelMap'
import { Results } from './components/Results'
import { TypingExercise } from './components/TypingExercise'
import { combine, resultFor, type Attempt } from './lib/attempt'
import { LESSONS, makeRounds, type Lesson } from './lib/lessons'
import { loadStars, saveStars } from './lib/progress'

type Screen =
  | { name: 'home' }
  | { name: 'intro'; lesson: Lesson }
  | { name: 'exercise'; lesson: Lesson; rounds: string[]; attempts: Attempt[]; key: number }
  | { name: 'results'; lesson: Lesson; attempts: Attempt[] }

// The lesson after this one, if her best result opened it
function nextLesson(lesson: Lesson, best: Record<string, number>): Lesson | undefined {
  const next = LESSONS[lesson.number]
  return next && (best[lesson.id] ?? 0) >= 2 ? next : undefined
}

function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const [best, setBest] = useState(loadStars)

  const intro = (lesson: Lesson) => setScreen({ name: 'intro', lesson })
  const play = (lesson: Lesson) =>
    setScreen({ name: 'exercise', lesson, rounds: makeRounds(lesson), attempts: [], key: Date.now() })
  const home = useCallback(() => setScreen({ name: 'home' }), [])

  const finish = (lesson: Lesson, attempts: Attempt[]) => {
    const earned = resultFor(lesson, combine(attempts)).stars
    setBest((previous) => {
      if ((previous[lesson.id] ?? 0) >= earned) return previous
      const next = { ...previous, [lesson.id]: earned }
      saveStars(next)
      return next
    })
    setScreen({ name: 'results', lesson, attempts })
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
    // Intro and exercise always fit on one screen; the map scrolls on purpose
    <main className={screen.name === 'intro' || screen.name === 'exercise' ? 'app fit' : 'app'}>
      <header className="top">
        <span className="star-total">
          <Art name="star" size={28} />
          {Object.values(best).reduce((sum, n) => sum + n, 0)}
        </span>
      </header>

      {screen.name === 'home' && <Home best={best} onStart={intro} />}
      {screen.name === 'intro' && (
        <LessonIntro lesson={screen.lesson} onStart={() => play(screen.lesson)} onBack={home} />
      )}
      {screen.name === 'exercise' && (
        <TypingExercise
          key={`${screen.key}-${screen.attempts.length}`}
          lesson={screen.lesson}
          text={screen.rounds[screen.attempts.length]}
          round={screen.attempts.length}
          rounds={screen.rounds.length}
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
          onHome={home}
        />
      )}

      <footer className="build">versie {__BUILD_SHA__}</footer>
    </main>
  )
}

function Home({ best, onStart }: { best: Record<string, number>; onStart: (lesson: Lesson) => void }) {
  return (
    <section className="home">
      <p className="speech">
        Hoi! Ik ben <strong>Nijl</strong>. Klik op het gouden rondje, dan gaan we verder!
      </p>
      <LevelMap best={best} onStart={onStart} />
    </section>
  )
}

export default App
