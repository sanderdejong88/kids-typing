import { useCallback, useEffect, useState } from 'react'
import { Art } from './components/Art'
import { Hippo } from './components/Hippo'
import { LevelMap } from './components/LevelMap'
import { Results } from './components/Results'
import { TypingExercise } from './components/TypingExercise'
import { resultFor, type Attempt } from './lib/attempt'
import { LESSONS, makeDrill, type Lesson } from './lib/lessons'
import { loadStars, saveStars } from './lib/progress'

type Screen =
  | { name: 'home' }
  | { name: 'exercise'; lesson: Lesson; text: string; round: number }
  | { name: 'results'; lesson: Lesson; attempt: Attempt }

// The lesson after this one, if her best result opened it
function nextLesson(lesson: Lesson, best: Record<string, number>): Lesson | undefined {
  const next = LESSONS[lesson.number]
  return next && (best[lesson.id] ?? 0) >= 2 ? next : undefined
}

function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const [best, setBest] = useState(loadStars)

  const start = (lesson: Lesson) =>
    setScreen({ name: 'exercise', lesson, text: makeDrill(lesson), round: Date.now() })
  const home = useCallback(() => setScreen({ name: 'home' }), [])

  const finish = useCallback((lesson: Lesson, attempt: Attempt) => {
    const earned = resultFor(lesson, attempt).stars
    setBest((previous) => {
      if ((previous[lesson.id] ?? 0) >= earned) return previous
      const next = { ...previous, [lesson.id]: earned }
      saveStars(next)
      return next
    })
    setScreen({ name: 'results', lesson, attempt })
  }, [])

  // Lets the page background follow the screen (the map is all water)
  useEffect(() => {
    document.body.dataset.screen = screen.name
  }, [screen.name])

  const next = screen.name === 'results' ? nextLesson(screen.lesson, best) : undefined

  return (
    <main className="app">
      <header className="top">
        <button className="logo" onClick={home}>
          <Hippo size={48} still />
          <span>Typen maar!</span>
        </button>
        <span className="star-total">
          <Art name="star" size={28} />
          {Object.values(best).reduce((sum, n) => sum + n, 0)}
        </span>
      </header>

      {screen.name === 'home' && <Home best={best} onStart={start} />}
      {screen.name === 'exercise' && (
        <TypingExercise
          key={screen.round}
          lesson={screen.lesson}
          text={screen.text}
          onDone={(attempt) => finish(screen.lesson, attempt)}
          onStop={home}
        />
      )}
      {screen.name === 'results' && (
        <Results
          lesson={screen.lesson}
          attempt={screen.attempt}
          onAgain={() => start(screen.lesson)}
          onNext={next && (() => start(next))}
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
