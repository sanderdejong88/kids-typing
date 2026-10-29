import type { ReactNode } from 'react'
import { Hands } from '../components/Hands'
import { Keyboard } from '../components/Keyboard'
import { fingerFor, FINGER_NAMES } from '../lib/keyboard'
import { ISLANDS, LESSONS, sentencesFor, wordsFor, type Lesson } from '../lib/lessons'
import type { Page } from './Layout'

// The lessons page and a page per island, built from the lessons of the game itself,
// so the keys, words and speed goals are always the ones a child really types

// A key in a sentence, in the colour of the finger that types it
export function K({ children }: { children: string }) {
  const label = children === ' ' ? 'spatie' : children.toUpperCase()
  return <span className={`site-key finger-${fingerFor(children) ?? 'thumb'}`}>{label}</span>
}

export const Keys = ({ keys }: { keys: string[] }) => (
  <span className="site-keys">
    {keys.map((key) => (
      <K key={key}>{key}</K>
    ))}
  </span>
)

type About = {
  slug: string
  // What the island is about, for parents, in a few sentences
  intro: ReactNode
  // Whether the drawn hands help here; with many keys per finger they get too full
  hands?: boolean
}

const ABOUT: About[] = [
  {
    slug: 'thuisrij',
    hands: true,
    intro: (
      <>
        <p>
          Hier begint het. De thuisrij is de rij waar de vingers altijd op liggen: <Keys keys={['a', 's', 'd', 'f']} />{' '}
          voor de linkerhand en <Keys keys={['j', 'k', 'l', ';']} /> voor de rechterhand. Vanaf hier gaat elke vinger
          naar zijn eigen toetsen, en daarna weer terug.
        </p>
        <p>
          Je kind begint met <K>f</K> en <K>j</K>. Die toetsen hebben een klein streepje, zodat je ze zonder te kijken
          kunt voelen. Daarna komen er steeds twee toetsen bij, telkens een vinger verder naar buiten.
        </p>
      </>
    ),
  },
  {
    slug: 'bovenrij',
    hands: true,
    intro: (
      <p>
        Nu strekken de vingers zich naar boven en komen ze daarna terug naar de thuisrij. Met <K>e</K>, <K>i</K>,{' '}
        <K>r</K>, <K>u</K>, <K>t</K> en <K>o</K> kan je kind ineens veel echte woorden typen, zoals <em>de</em>,{' '}
        <em>het</em>, <em>ster</em> en <em>tafel</em>. Dat voelt als een grote stap.
      </p>
    ),
  },
  {
    slug: 'onderrij',
    hands: true,
    intro: (
      <p>
        De vingers buigen nu naar beneden. Met de <K>n</K> erbij worden de woorden pas echt Nederlands (<em>naar</em>,{' '}
        <em>maan</em>, <em>kind</em>). De komma en de punt komen hier al, zodat er straks hele zinnetjes in passen.
      </p>
    ),
  },
  {
    slug: 'laatste-letters',
    hands: true,
    intro: (
      <p>
        De laatste letters van het alfabet. De apostrof komt hier al, want die heb je in het Nederlands vaak nodig:{' '}
        <em>auto's</em>, <em>foto's</em>, <em>oma's</em>. Daarna kent je kind alle letters en typt het woorden als{' '}
        <em>zebra</em>, <em>pizza</em> en <em>pyjama</em>.
      </p>
    ),
  },
  {
    slug: 'hoofdletters',
    intro: (
      <>
        <p>
          Een hoofdletter maak je met shift, en dan altijd met de pink van de <strong>andere</strong> hand. Voor een{' '}
          <K>F</K> houdt de rechterpink shift vast, voor een <K>J</K> de linkerpink. Zo hoeft geen enkele hand zich te
          verdraaien.
        </p>
        <p>
          Je kind oefent met namen en plaatsen, zoals <em>Anna</em>, <em>Utrecht</em> en <em>IJsland</em>. Bij die
          laatste zijn het twee hoofdletters: de IJ is in het Nederlands één letter.
        </p>
      </>
    ),
  },
  {
    slug: 'zinnetjes',
    intro: (
      <p>
        Er komen geen nieuwe toetsen bij. Alles wat je kind tot nu toe geleerd heeft, komt samen in echte zinnetjes:
        eerst korte, dan langere en daarna zinnen met een komma. Elke zin begint met een hoofdletter en eindigt met
        een punt.
      </p>
    ),
  },
  {
    slug: 'leestekens',
    intro: (
      <p>
        Het vraagteken, het uitroepteken, de dubbele punt en het streepje. De eerste drie typ je met shift, net als
        een hoofdletter. De zinnen worden levendiger: <em>Waar is de kat?</em> en <em>Pas op, een slak!</em>
      </p>
    ),
  },
  {
    slug: 'cijfers',
    hands: true,
    intro: (
      <p>
        De cijfers staan op de bovenste rij, het verst weg van de thuisrij. Je kind leert ze vanaf de wijsvingers naar
        buiten: eerst <K>4</K> en <K>7</K>, als laatste <K>5</K> en <K>6</K>. Na elk cijfer gaat de vinger terug naar
        de thuisrij. Er wordt geoefend met korte stukjes zoals <em>7 dagen</em> en <em>10 vingers</em>.
      </p>
    ),
  },
  {
    slug: 'snelheid',
    intro: (
      <>
        <p>
          Je kind kent nu alle toetsen. Op dit laatste eiland gaat het om snelheid, in drie stappen: 75, 100 en 120
          aanslagen per minuut. Bij 75 en 100 krijgt je kind een certificaat. Daarna volgt het examen voor het{' '}
          <a href="/typediploma/">typediploma</a>.
        </p>
        <p>
          De regel blijft: eerst goed, dan snel. Wie net onder de 95% goed zit, krijgt geen extra sterren voor snelheid.
        </p>
      </>
    ),
  },
]

const islandPath = (i: number) => `/lessen/${ABOUT[i].slug}/`

const lessonsOf = (island: number) => LESSONS.filter((lesson) => lesson.island === island)

// The keys an island adds, in the order they come
const newKeysOf = (island: number) => ISLANDS[island].steps.flat()

function lessonLine(lesson: Lesson): string {
  switch (lesson.kind) {
    case 'test':
      return `Eilandtoets: alle toetsen van dit eiland in een langere tekst`
    case 'exam':
      return `Diploma-examen: ${lesson.bars[0].apm} aanslagen per minuut met ${lesson.bars[0].accuracy}% goed`
    case 'speed':
      return `Snelheid: ${lesson.goalApm} aanslagen per minuut`
    default:
      return `${lesson.name}: ${lesson.label}`
  }
}

// A few words or sentences a child types on this island, the way the game picks them
function examples(island: number): string[] {
  const lessons = lessonsOf(island)
  const keys = lessons[lessons.length - 1].keys
  const fresh = newKeysOf(island)
  const practice = ISLANDS[island].practice ?? 'letters'
  if (practice === 'numbers' || ISLANDS[island].goals) return []
  if (practice === 'sentences') {
    const sentences = sentencesFor(keys)
    const withNew = sentences.filter((sentence) => fresh.some((key) => sentence.includes(key)))
    return (fresh.length > 0 ? withNew : sentences).slice(0, 6)
  }
  const words = wordsFor(keys).filter((word) => fresh.some((key) => word.includes(key)))
  return [...new Set(words)].slice(0, 14)
}

function IslandBody({ island }: { island: number }) {
  const lessons = lessonsOf(island)
  const fresh = newKeysOf(island)
  const keys = lessons[lessons.length - 1].keys
  const goal = ISLANDS[island].goalApm
  const words = examples(island)
  const fingers = [...new Set(fresh.map((key) => fingerFor(key)).filter((finger) => finger !== undefined))]
  return (
    <>
      {ABOUT[island].intro}

      <figure className="site-figure">
        {ABOUT[island].hands && <Hands keys={fresh} />}
        <Keyboard keys={keys} highlight={fresh} />
        <figcaption>
          {fresh.length > 0
            ? 'De nieuwe toetsen van dit eiland lichten op. De kleur laat zien welke vinger ze typt.'
            : 'Op dit eiland komen geen nieuwe toetsen bij. Alle gekleurde toetsen kent je kind al.'}
        </figcaption>
      </figure>

      <h2>De lessen op dit eiland</h2>
      <ol>
        {lessons.map((lesson) => (
          <li key={lesson.id}>{lessonLine(lesson)}</li>
        ))}
      </ol>
      {fingers.length > 0 && fingers.length <= 6 && (
        <p>
          Vingers die hier aan het werk zijn: {fingers.map((finger) => FINGER_NAMES[finger]).join(', ')}.
        </p>
      )}

      {words.length > 0 && (
        <>
          <h2>Wat je kind hier typt</h2>
          <p>
            Elke oefening gebruikt alleen toetsen die je kind al kent. Een paar voorbeelden van dit eiland:{' '}
            {words.map((word, i) => (
              <span key={word}>
                <em>{word}</em>
                {i < words.length - 1 ? ', ' : '.'}
              </span>
            ))}
          </p>
        </>
      )}

      <h2>Wanneer mag je kind door?</h2>
      {ISLANDS[island].goals ? (
        <p>
          Elke snelheidsles heeft een eigen doel. Twee sterren haalt je kind met het doel en 90% goed, drie sterren met
          95% goed. Het examen vraagt 120 aanslagen per minuut met 95% goed.
        </p>
      ) : (
        <p>
          Elke les geeft tot drie sterren. Eén ster voor het afmaken, twee voor 90% goed en drie voor 95% goed én een
          snelheid van {goal} aanslagen per minuut. De volgende les gaat open als alle lessen ervoor minstens twee
          sterren hebben. Bij de eilandtoets telt ook de snelheid mee: wie {Math.round(goal * 0.7)} aanslagen per minuut
          haalt met 90% goed, vaart door naar het volgende eiland.
        </p>
      )}

      <nav className="site-next" aria-label="Andere eilanden">
        {island > 0 ? <a href={islandPath(island - 1)}>← {ISLANDS[island - 1].name}</a> : <span />}
        {island < ISLANDS.length - 1 ? (
          <a href={islandPath(island + 1)}>{ISLANDS[island + 1].name} →</a>
        ) : (
          <a href="/typediploma/">Het typediploma →</a>
        )}
      </nav>
    </>
  )
}

const LESSONS_PAGE = { path: '/lessen/', name: 'Lessen' }

export const ISLAND_PAGES: Page[] = ISLANDS.map((island, i) => {
  const fresh = newKeysOf(i)
  const keyList = fresh.map((key) => key.toUpperCase()).join(' ')
  const subject = fresh.length > 0 && fresh.length <= 12 ? ` (${keyList})` : ''
  return {
    path: islandPath(i),
    name: island.name,
    parent: LESSONS_PAGE,
    title: `Typeles ${island.name.toLowerCase()}: eiland ${i + 1} van ${ISLANDS.length}`,
    h1: `Eiland ${i + 1}: ${island.name}`,
    description: `Wat je kind leert op eiland ${i + 1} van de gratis typecursus: ${island.name.toLowerCase()}${subject}, met ${lessonsOf(i).length} lessen en het snelheidsdoel.`,
    lead: (
      <p>
        Eiland {i + 1} van {ISLANDS.length} in de typecursus van Snuf. {lessonsOf(i).length} lessen, met een
        snelheidsdoel van {island.goalApm} aanslagen per minuut.
      </p>
    ),
    body: <IslandBody island={i} />,
  }
})

const lessonCount = LESSONS.filter((lesson) => lesson.kind === 'lesson').length

export const LESSONS_OVERVIEW: Page = {
  ...LESSONS_PAGE,
  title: 'Alle typelessen op een rij',
  h1: 'Alle typelessen op een rij',
  description: `De gratis typecursus in ${ISLANDS.length} eilanden en ${LESSONS.length} lessen: van de thuisrij tot het typediploma. Bekijk per eiland welke toetsen je kind leert.`,
  lead: (
    <p>
      De typecursus is een reis langs {ISLANDS.length} eilanden. Elk eiland leert iets nieuws: een rij letters, de
      hoofdletters, leestekens of cijfers. Samen zijn het {LESSONS.length} stappen, waarvan {lessonCount} gewone lessen.
      De rest zijn toetsen en snelheidslessen.
    </p>
  ),
  body: (
    <>
      <ul className="site-islands">
        {ISLANDS.map((island, i) => {
          const fresh = newKeysOf(i)
          return (
            <li key={island.name}>
              <a href={islandPath(i)}>
                <strong>
                  {i + 1}. {island.name}
                </strong>
                {fresh.length > 0 && fresh.length <= 12
                  ? fresh.map((key) => key.toUpperCase()).join(' ')
                  : island.topic}
                {' · '}
                {lessonsOf(i).length} lessen
              </a>
            </li>
          )
        })}
      </ul>

      <h2>Waarom deze volgorde?</h2>
      <p>
        Alle letters komen in tweetallen, eerst op de thuisrij, dan erboven en eronder. Na elke paar lessen volgt een
        toets met alles van dat eiland. Zo leert je kind steeds een klein beetje nieuws en herhaalt het de rest
        vanzelf. Dat is ook hoe bekende cursussen als TypingClub werken.
      </p>
      <p>
        De volgorde is afgestemd op het Nederlands. De apostrof komt vroeg, omdat je die nodig hebt voor woorden als{' '}
        <em>auto's</em> en <em>foto's</em>. De <em>ij</em> oefent je kind als twee letters, zodra de i en de j bekend
        zijn. Letters met accenten (é, ë, ï) laten we weg.
      </p>

      <h2>Hoe ziet één les eruit?</h2>
      <p>
        Elke les begint met een korte uitleg: twee getekende handen waarop de juiste vingers oplichten, en het
        toetsenbord met de nieuwe toetsen. Daarna volgen vier korte rondjes. Lees er meer over op{' '}
        <a href="/hoe-werkt-het/">hoe het werkt</a>.
      </p>
    </>
  ),
}
