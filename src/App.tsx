import { useCallback, useState } from 'react'
import { Art } from './components/Art'
import { Results } from './components/Results'
import { TypingExercise } from './components/TypingExercise'
import { resultFor, type Attempt } from './lib/attempt'
import { LESSONS, makeDrill, type Lesson } from './lib/lessons'
import { loadStars, saveStars } from './lib/progress'

type Screen =
  | { name: 'home' }
  | { name: 'exercise'; lesson: Lesson; text: string; round: number }
  | { name: 'results'; lesson: Lesson; attempt: Attempt }

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

  return (
    <main className="app">
      <header className="top">
        <button className="logo" onClick={home}>
          <Art name="hippo" size={44} />
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
      <div className="hero">
        <Art name="sun" size={64} className="hero-sun" />
        <Art name="hippo" size={160} className="hero-hippo flip" alt="Nijlpaard" />
        <div className="speech">
          Hoi! Ik ben <strong>Nijl</strong>. Zullen we samen leren typen?
        </div>
      </div>

      <h2 className="level-title">
        <Art name="palm-tree" size={36} /> Eiland 1: de thuisrij
      </h2>
      <ol className="lessons">
        {LESSONS.map((lesson) => (
          <li key={lesson.id}>
            <button className="lesson" onClick={() => onStart(lesson)}>
              <span className="lesson-title">{lesson.title}</span>
              <span className="lesson-keys">
                {lesson.newKeys.map((key) => (
                  <kbd key={key}>{key.toUpperCase()}</kbd>
                ))}
              </span>
              <span className="lesson-stars">
                {[1, 2, 3].map((n) => (
                  <Art
                    key={n}
                    name="star"
                    size={22}
                    className={n <= (best[lesson.id] ?? 0) ? 'star on' : 'star off'}
                  />
                ))}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default App
