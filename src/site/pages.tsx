import type { ReactNode } from 'react'
import { Hands } from '../components/Hands'
import { Keyboard } from '../components/Keyboard'
import { Seal } from '../components/Seal'
import { FINGER_NAMES, ROWS, type Finger } from '../lib/keyboard'
import { ISLANDS, LESSONS } from '../lib/lessons'
import type { Page, Question } from './Layout'
import { ISLAND_PAGES, K, Keys, LESSONS_OVERVIEW } from './levels'

// The pages for parents and teachers (docs/SEO-PLAN.md, phase 2). Written for the grown-up
// who searches, not for the child who plays; every fact here matches the game.

const ALL_KEYS = ROWS.flat().map((key) => key.key)
const HOME_ROW = ['a', 's', 'd', 'f', 'j', 'k', 'l', ';']

// What Snuf says beside a few lines, like in the game
function Snuf({ children }: { children: ReactNode }) {
  return (
    <div className="site-snuf">
      <Seal size={72} mood="happy" still />
      <p>{children}</p>
    </div>
  )
}

// A screenshot of the game, from public/screenshots/ (taken in the browser at 800 × 537)
function Shot({ file, alt, caption, lazy = true }: { file: string; alt: string; caption: string; lazy?: boolean }) {
  return (
    <figure className="site-figure site-shot">
      <img src={`/screenshots/${file}.jpg`} alt={alt} width={800} height={537} loading={lazy ? 'lazy' : undefined} />
      <figcaption>{caption}</figcaption>
    </figure>
  )
}

const HOW: Page = {
  path: '/hoe-werkt-het/',
  name: 'Hoe werkt het?',
  title: 'Hoe werkt het typespel met Snuf?',
  h1: 'Hoe werkt het typespel?',
  description:
    'Uitleg van de gratis typecursus: een kaart met eilanden, korte lessen met spelletjes, sterren, een dagelijkse oefening en een typediploma.',
  lead: (
    <p>
      Je kind leert typen op een kaart met {ISLANDS.length} eilanden. Elk eiland is een groepje lessen. Snuf, een witte
      zeehond, gaat mee, legt uit en juicht als het goed gaat.
    </p>
  ),
  body: (
    <>
      <Shot
        file="kaart"
        alt="De kaart van het typespel: een eiland met genummerde lessen, sterren, Snuf de zeehond en knoppen voor de spelletjes"
        caption="De kaart. Snuf staat bij de volgende les, links staan de dagelijkse oefening en de spelletjes."
        lazy={false}
      />

      <h2>De eerste keer: goed zitten</h2>
      <p>
        Voor de eerste les legt Snuf uit hoe je zit: rug recht, voeten plat op de grond, je buik voor het midden van
        het toetsenbord. Daarna zet je kind beide wijsvingers op <K>f</K> en <K>j</K> en drukt ze tegelijk in. Pas dan
        gaat het verder. Elke dag komt die check nog één keer kort terug, voor de eerste les van die dag.
      </p>

      <h2>Een les in vier rondjes</h2>
      <p>
        Elke les begint met een korte uitleg. Twee getekende handen laten zien welke vinger de nieuwe toetsen typt, en
        op het toetsenbord lichten die toetsen op. Je kind mag ze eerst uitproberen. Daarna volgen vier korte rondjes:
      </p>
      <ol>
        <li>Twee rondjes met alleen de nieuwe toetsen.</li>
        <li>Een rondje waarin de nieuwe toetsen gemengd worden met toetsen die je kind al kent.</li>
        <li>
          Een spelletje met echte woorden: ballonnen laten knallen, een bal hooghouden met Snuf of vissen vangen.
        </li>
      </ol>
      <Shot
        file="uitleg"
        alt="De uitleg van les 12: twee getekende handen en een toetsenbord waarop de V en de M oplichten"
        caption="De uitleg van les 12: de V met de linker wijsvinger, de M met de rechter."
      />
      <p>
        Typt je kind een verkeerde toets, dan wacht de cursor tot de goede toets komt. Zo raakt niemand de draad kwijt,
        en je kind leert de juiste vinger te zoeken in plaats van door te ratelen.
      </p>

      <Shot
        file="typen"
        alt="Een typerondje: getypte letters worden groen, de volgende letter is geel en het toetsenbord wijst de toets aan"
        caption="Een rondje typen. Wat goed is wordt groen, en het toetsenbord laat zien welke vinger nu moet."
      />

      <h2>Sterren en de volgende les</h2>
      <p>Na elke les krijgt je kind tot drie sterren. Netjes typen telt zwaarder dan snel typen:</p>
      <ul>
        <li>★ voor het afmaken van de les</li>
        <li>★★ bij 90% goed</li>
        <li>★★★ bij 95% goed én het snelheidsdoel van dat eiland</li>
      </ul>
      <p>
        De volgende les gaat open als alle lessen ervoor minstens twee sterren hebben. Opnieuw proberen mag altijd, en
        de beste score telt. Aan het eind van elk eiland wacht een eilandtoets met alles van dat eiland.
      </p>

      <h2>Elke dag even oefenen</h2>
      <p>
        Naast de kaart staat de knop <strong>Oefen vandaag</strong>. Die maakt een oefening van de letters die je kind
        nog lastig vindt: de letters waar het het langzaamst is of de meeste fouten maakt. Het dagdoel is vijf minuten
        typen. Een vlammetje telt hoeveel dagen op rij je kind geoefend heeft. Eén dag overslaan mag, pas bij twee dagen
        gaat de teller terug.
      </p>

      <h2>Spelletjes en certificaten</h2>
      <p>
        De drie spelletjes staan ook los naast de kaart, met de letters die je kind al kent. Wie snel genoeg wordt,
        verdient certificaten bij 75 en 100 aanslagen per minuut, en aan het eind het{' '}
        <a href="/typediploma/">typediploma</a>. Die kun je printen of als pdf bewaren, met de naam van je kind erop.
      </p>

      <Shot
        file="ballonnen"
        alt="Het spelletje ballonnen knallen: ballonnen met korte woorden zweven omhoog"
        caption="Ballonnen knallen: typ het woord voordat de ballon wegvliegt."
      />

      <Snuf>Kijk niet naar je handen, kijk naar het scherm. Daar staat het toetsenbord al, in kleuren!</Snuf>
    </>
  ),
}

const PARENTS: Page = {
  path: '/voor-ouders/',
  name: 'Voor ouders',
  title: 'Typen leren voor kinderen: informatie voor ouders',
  h1: 'Typen leren: wat je als ouder wilt weten',
  description:
    'Waarom blind typen, vanaf welke leeftijd, hoe lang per dag en wat het kost (niets). Alles wat ouders willen weten over de gratis typecursus.',
  lead: (
    <p>
      Kinderen typen steeds meer: werkstukken, presentaties en toetsen op de Chromebook. Wie dat met twee vingers doet
      en steeds naar het toetsenbord kijkt, verliest veel tijd en aandacht. Blind typen met tien vingers lost dat op,
      voor de rest van hun leven.
    </p>
  ),
  body: (
    <>
      <h2>Wat kost het?</h2>
      <p>
        Niets. Er is geen abonnement, geen proefperiode en geen betaalde versie. Je hoeft geen account te maken en er is
        geen reclame. We plaatsen geen cookies en verzamelen geen persoonsgegevens.
      </p>

      <h2>Vanaf welke leeftijd?</h2>
      <p>
        De cursus is gemaakt voor kinderen vanaf groep 6, als ze een jaar of negen zijn. Dan lezen ze vlot genoeg en
        zijn hun handen groot genoeg voor het toetsenbord. Oudere kinderen, tieners en volwassenen kunnen er net zo
        goed mee leren.
      </p>

      <h2>Hoe lang per dag?</h2>
      <p>
        Kort en vaak werkt het best. Het dagdoel in het spel is vijf minuten echt typen, dat is een les of twee. Vier of
        vijf dagen per week oefenen helpt meer dan één lange middag in het weekend.
      </p>

      <h2>Hoe lang duurt het tot het diploma?</h2>
      <p>
        Dat verschilt per kind. Er zijn {LESSONS.length} stappen tot het examen. Met een paar minuten per dag is een
        paar maanden een redelijke verwachting. Snelheid komt pas aan het eind: eerst leert je kind de toetsen
        goed vinden.
      </p>

      <h2>Mijn kind typt al, maar met twee vingers</h2>
      <p>
        Dat is heel normaal, en het afleren is het moeilijkste deel. In het begin gaat typen met tien vingers trager
        dan het oude kijk-en-tik. Dat is precies goed. De cursus helpt daarbij: elke dag zetten de wijsvingers zich
        eerst op F en J, en de sterren belonen netjes typen, niet haasten.
      </p>

      <h2>Hoe kun je helpen?</h2>
      <ul>
        <li>Zorg voor een vaste, korte oefentijd, bijvoorbeeld na het eten.</li>
        <li>Let op de houding: rug recht, voeten op de grond, laptop niet te dichtbij.</li>
        <li>Moedig netjes typen aan, niet snel typen. Snelheid komt vanzelf.</li>
        <li>Kijk samen naar het vlammetje en de sterren. Dat motiveert meer dan een herinnering.</li>
      </ul>

      <h2>Waar blijft de voortgang?</h2>
      <p>
        In de browser, op het apparaat waarop je kind oefent. Zonder account kunnen we de voortgang niet tussen
        apparaten delen. Oefen dus steeds op dezelfde computer en in dezelfde browser. Wis je de browsergegevens, dan
        begint de cursus opnieuw.
      </p>

      <p>
        Lees ook <a href="/blind-typen-leren/">tips om blind te leren typen</a>,{' '}
        <a href="/typecursussen-vergelijken/">hoe we ons verhouden tot betaalde typecursussen</a> en de{' '}
        <a href="/veelgestelde-vragen/">veelgestelde vragen</a>.
      </p>
    </>
  ),
}

const TEACHERS: Page = {
  path: '/voor-leerkrachten/',
  name: 'Voor leerkrachten',
  title: 'Gratis typen leren in de klas',
  h1: 'Typen leren in de klas',
  description:
    'Gebruik de gratis typecursus in groep 6, 7 en 8: geen accounts, geen licentie en het werkt op de Chromebooks van school.',
  lead: (
    <p>
      Een typecursus voor de hele klas, zonder licentie, zonder leerlingaccounts en zonder gedoe met privacy. Leerlingen
      openen gratistypenleren.nl en beginnen meteen.
    </p>
  ),
  body: (
    <>
      <h2>Waarom het past in de klas</h2>
      <ul>
        <li>Gratis voor iedereen, zonder licentie of abonnement.</li>
        <li>Geen accounts: je hoeft geen leerlinggegevens in te voeren of te delen.</li>
        <li>Geen reclame, geen cookies en geen persoonsgegevens.</li>
        <li>Het werkt in de browser en is gemaakt voor de Chromebook, met dezelfde toetsenbordindeling.</li>
        <li>Korte lessen van een paar minuten, goed in te passen tussen andere taken.</li>
      </ul>

      <h2>Waar staat de voortgang?</h2>
      <p>
        In de browser van het apparaat. Op Chromebooks waar elke leerling met een eigen schoolaccount inlogt, heeft dus
        elke leerling een eigen voortgang. In gastmodus of op een gedeeld profiel wordt de voortgang gewist of gedeeld.
        Dat is goed om vooraf te weten.
      </p>

      <h2>Hoe zet je het in?</h2>
      <ol>
        <li>Laat leerlingen elke dag vijf tot tien minuten oefenen, bijvoorbeeld bij de start van de dag.</li>
        <li>De eerste les begint met een uitleg over houding en vingers. Neem die de eerste keer samen door.</li>
        <li>
          Laat leerlingen met een koptelefoon werken, of zet het geluid uit met de knop rechtsboven. Het spel geeft
          geluidjes bij elke goede toets.
        </li>
        <li>Een geprint certificaat of diploma is een mooi moment om in de klas te vieren.</li>
      </ol>

      <h2>Wat leerlingen leren</h2>
      <p>
        Alle letters, hoofdletters, leestekens en cijfers, verdeeld over {ISLANDS.length} eilanden. Aan het eind kunnen
        ze het examen doen voor het typediploma: 120 aanslagen per minuut met 95% goed. Bekijk{' '}
        <a href="/lessen/">alle lessen</a>.
      </p>
    </>
  ),
}

const DIPLOMA: Page = {
  path: '/typediploma/',
  name: 'Typediploma',
  title: 'Gratis typediploma halen',
  h1: 'Het typediploma',
  description:
    'Haal gratis een typediploma: 120 aanslagen per minuut met 95% goed. Met certificaten bij 75 en 100 aanslagen per minuut, om te printen.',
  lead: (
    <p>
      Aan het eind van de cursus doet je kind examen. Wie 120 aanslagen per minuut typt met 95% goed, krijgt het
      typediploma, met de eigen naam en de datum erop. Het diploma is gratis, net als de rest van de cursus.
    </p>
  ),
  body: (
    <>
      <h2>Wat is een aanslag per minuut?</h2>
      <p>
        Een aanslag is één getypt teken, en een spatie telt ook mee. Nederlandse typediploma's rekenen in aanslagen per
        minuut, afgekort apm. 120 apm is ongeveer 24 woorden per minuut.
      </p>

      <h2>Op weg naar het diploma</h2>
      <table className="site-table">
        <thead>
          <tr>
            <th>Snelheid</th>
            <th>Wat je kind krijgt</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>75 apm</td>
            <td>Certificaat: de eerste mijlpaal</td>
          </tr>
          <tr>
            <td>100 apm</td>
            <td>Certificaat</td>
          </tr>
          <tr>
            <td>120 apm met 95% goed</td>
            <td>Het typediploma</td>
          </tr>
        </tbody>
      </table>
      <p>
        Wie bij het examen nog sneller is, ziet dat op het diploma terug: 120, 150 of 175+ aanslagen per minuut.
        Opnieuw proberen mag altijd. Een sneller resultaat vervangt het oude certificaat.
      </p>

      <h2>Printen of bewaren</h2>
      <p>
        Je kind typt zijn of haar naam op het certificaat. Daarna kun je het printen, of in het printvenster kiezen voor
        'Opslaan als pdf'.
      </p>

      <h2>Is het een officieel diploma?</h2>
      <p>
        Het is een diploma van gratistypenleren.nl. Het laat zien wat je kind kan, met dezelfde norm die veel
        Nederlandse typecursussen gebruiken: 100 tot 120 aanslagen per minuut met weinig fouten.
      </p>

      <p>
        Benieuwd hoe je kind daar komt? Bekijk het laatste eiland, <a href="/lessen/snelheid/">Snelheid</a>.
      </p>
    </>
  ),
}

// Which finger types which key, from the keyboard of the game
const FINGERS: Finger[] = [
  'left-pinky',
  'left-ring',
  'left-middle',
  'left-index',
  'right-index',
  'right-middle',
  'right-ring',
  'right-pinky',
  'thumb',
]

const keysOf = (finger: Finger) =>
  ROWS.flat()
    .filter((key) => key.finger === finger && (key.key.length === 1 || key.key.startsWith('Shift')))
    .map((key) => (key.key.startsWith('Shift') ? 'shift' : key.key))

const FINGERING: Page = {
  path: '/vingerzetting/',
  name: 'Vingerzetting',
  title: 'Vingerzetting: welke vinger typt welke toets?',
  h1: 'Welke vinger typt welke toets?',
  description:
    'De vingerzetting voor blind typen met tien vingers: per vinger alle toetsen, met de thuisrij ASDF JKL; als vertrekpunt.',
  lead: (
    <p>
      Bij blind typen heeft elke vinger zijn eigen toetsen. Je vingers rusten op de thuisrij en gaan vanaf daar naar
      boven of naar beneden. In het spel heeft elke vinger een eigen kleur. Die kleuren zie je hieronder ook.
    </p>
  ),
  body: (
    <>
      <h2>De thuisrij</h2>
      <p>
        De vingers van je linkerhand liggen op <Keys keys={['a', 's', 'd', 'f']} />, die van je rechterhand op{' '}
        <Keys keys={['j', 'k', 'l', ';']} />. Op <K>f</K> en <K>j</K> zit een klein streepje. Daarmee vind je de
        thuisrij zonder te kijken. Je duimen rusten op de spatiebalk.
      </p>

      <figure className="site-figure">
        <Hands keys={HOME_ROW} />
        <Keyboard keys={ALL_KEYS} />
        <figcaption>Dezelfde kleur betekent dezelfde vinger, op beide handen.</figcaption>
      </figure>

      <h2>Alle toetsen per vinger</h2>
      <table className="site-table">
        <thead>
          <tr>
            <th>Vinger</th>
            <th>Toetsen</th>
          </tr>
        </thead>
        <tbody>
          {FINGERS.map((finger) => (
            <tr key={finger}>
              <td>{finger === 'thumb' ? 'duimen' : FINGER_NAMES[finger]}</td>
              <td>
                <Keys keys={keysOf(finger)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Hoofdletters en shift</h2>
      <p>
        Voor een hoofdletter houd je shift vast met de pink van de <strong>andere</strong> hand. De <K>A</K> typ je met
        links, dus de rechterpink houdt shift vast. Voor een <K>K</K> is het andersom. Hetzelfde geldt voor{' '}
        <K>?</K>, <K>!</K> en <K>:</K>.
      </p>

      <h2>Na elke toets terug</h2>
      <p>
        Na elke toets gaat je vinger terug naar de thuisrij. Daardoor weet je altijd waar je bent, ook zonder te kijken.
        Bij de cijfers op de bovenste rij is dat extra belangrijk. Dit toetsenbord is de Amerikaanse indeling
        (US-QWERTY), die op bijna alle laptops en Chromebooks in Nederland zit.
      </p>
    </>
  ),
}

const TOUCH_TYPING: Page = {
  path: '/blind-typen-leren/',
  name: 'Blind typen leren',
  title: 'Blind typen leren: 8 tips voor kinderen',
  h1: 'Blind typen leren: 8 tips',
  description:
    'Zo leert je kind blind typen met tien vingers: de thuisrij, goede houding, eerst nauwkeurig en dan snel, en elke dag een paar minuten.',
  lead: (
    <p>
      Blind typen betekent typen zonder naar het toetsenbord te kijken. Je ogen blijven op het scherm, je vingers weten
      de weg. Iedereen kan het leren. Deze tips helpen daarbij, en ze zitten allemaal in de cursus van Snuf.
    </p>
  ),
  body: (
    <>
      <h2>1. Begin op de thuisrij</h2>
      <p>
        Wijsvingers op <K>f</K> en <K>j</K>, de andere vingers ernaast. Vanaf daar gaat elke vinger naar zijn eigen
        toetsen. Zie de <a href="/vingerzetting/">vingerzetting</a>.
      </p>

      <h2>2. Zit goed</h2>
      <p>
        Rug recht, voeten plat op de grond en je buik voor het midden van het toetsenbord. Schuif de laptop een stukje
        naar achteren, zodat je ellebogen ontspannen hangen en je handen recht voor de toetsen liggen.
      </p>

      <h2>3. Kijk naar het scherm</h2>
      <p>
        Naar je handen kijken is de grootste valkuil. In het spel staat een toetsenbord op het scherm, in de kleuren
        van de vingers. Kijk daarnaar als je een toets zoekt.
      </p>

      <h2>4. Eerst goed, dan snel</h2>
      <p>
        Fouten die je inslijt, krijg je er moeilijk weer uit. Typ dus rustig en precies. In het spel geven de sterren
        daarom eerst punten voor nauwkeurigheid. Snelheid telt pas bij de derde ster.
      </p>

      <h2>5. Weinig nieuwe toetsen tegelijk</h2>
      <p>
        Twee nieuwe toetsen per les is genoeg. Herhaal ze vaak voordat er nieuwe bijkomen. Zo zijn alle{' '}
        <a href="/lessen/">lessen</a> opgebouwd.
      </p>

      <h2>6. Elke dag een paar minuten</h2>
      <p>
        Vijf minuten per dag werkt beter dan een uur per week. Je vingers onthouden de weg door herhaling, en die
        heeft tijd nodig.
      </p>

      <h2>7. Oefen je lastige letters</h2>
      <p>
        Iedereen heeft een paar letters die steeds misgaan. De knop <strong>Oefen vandaag</strong> in het spel houdt
        bij welke dat zijn en maakt er een oefening van.
      </p>

      <h2>8. Hou het leuk</h2>
      <p>
        Spelletjes, sterren en een vlammetje voor elke dag dat je oefent: het helpt om vol te houden. Typen leren gaat
        niet in een week, maar een paar maanden is het meer dan waard.
      </p>

      <Snuf>Ik heb geen vingers, alleen flippers. Jij hebt er tien!</Snuf>
    </>
  ),
}

const CHROMEBOOK: Page = {
  path: '/typen-leren-op-chromebook/',
  name: 'Typen leren op een Chromebook',
  title: 'Typen leren op een Chromebook',
  h1: 'Typen leren op een Chromebook',
  description:
    'Een gratis typecursus die gemaakt is voor de Chromebook: in de browser, zonder installatie, met het toetsenbord van de Chromebook op het scherm.',
  lead: (
    <p>
      Veel kinderen typen op school op een Chromebook. Deze cursus is daarvoor gemaakt. Hij werkt in de browser, je
      hoeft niets te installeren en het toetsenbord op het scherm is dat van een Chromebook.
    </p>
  ),
  body: (
    <>
      <h2>Wat is er anders aan een Chromebook?</h2>
      <p>
        Een Chromebook heeft geen F1 tot en met F12, maar een eigen bovenste rij met knoppen voor bijvoorbeeld geluid
        en helderheid. En waar op andere laptops de Caps Lock zit, zit de zoektoets. Het toetsenbord in het spel heeft
        dezelfde indeling, zodat je kind herkent wat het ziet.
      </p>
      <figure className="site-figure">
        <Keyboard keys={ALL_KEYS} />
        <figcaption>Het toetsenbord in het spel: de indeling van een Chromebook.</figcaption>
      </figure>

      <h2>Op de Chromebook van school</h2>
      <p>
        Open gratistypenleren.nl in Chrome. Logt je kind met een eigen account in, dan wordt de voortgang in dat profiel
        bewaard. In gastmodus begint het na het uitloggen weer opnieuw. Zie ook de informatie{' '}
        <a href="/voor-leerkrachten/">voor leerkrachten</a>.
      </p>

      <h2>Werkt het ook op andere computers?</h2>
      <p>
        Ja, op elke laptop of computer met een gewone browser en een toetsenbord met de Amerikaanse indeling, zoals de
        meeste laptops in Nederland. Op een tablet of telefoon heb je een los toetsenbord nodig. Blind typen leer je op
        echte toetsen.
      </p>
    </>
  ),
}

// Prices and terms of the paid courses, as on their own sites on 30 October 2026. They change
// often, so check them again before changing this page, and keep the date in the text current.
const CHECKED = '30 oktober 2026'

const COMPARISON: Page = {
  path: '/typecursussen-vergelijken/',
  name: 'Typecursussen vergeleken',
  title: 'Typecursussen voor kinderen vergeleken: gratis en betaald',
  h1: 'Typecursussen voor kinderen vergeleken',
  description:
    'Typetuin, TypeTopia, TypeWorld en gratistypenleren.nl naast elkaar: prijs, leeftijd, diploma en begeleiding. Eerlijk, ook over wanneer betaald beter past.',
  lead: (
    <p>
      Een typecursus voor je kind kost al snel 70 tot 140 euro. Moet dat? Niet altijd. Hieronder staan de bekendste
      Nederlandse typecursussen naast onze gratis cursus, met wat je voor je geld krijgt en wanneer een betaalde cursus
      echt beter past.
    </p>
  ),
  body: (
    <>
      <h2>De cursussen naast elkaar</h2>
      <div className="site-table-scroll">
        <table className="site-table">
          <thead>
            <tr>
              <th>Cursus</th>
              <th>Prijs</th>
              <th>Vanaf</th>
              <th>Diploma</th>
              <th>Account nodig</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Gratistypenleren.nl</strong>
              </td>
              <td>Gratis</td>
              <td>Groep 6</td>
              <td>Eigen diploma bij 120 apm, om te printen</td>
              <td>Nee</td>
            </tr>
            <tr>
              <td>Typetuin</td>
              <td>€ 120 online</td>
              <td>Groep 5</td>
              <td>Ja, met diplomagarantie</td>
              <td>Ja</td>
            </tr>
            <tr>
              <td>TypeTopia</td>
              <td>€ 139 (actieprijs, normaal € 159)</td>
              <td>Ongeveer 8 jaar</td>
              <td>Ja, met geld-terug-garantie</td>
              <td>Ja</td>
            </tr>
            <tr>
              <td>TypeWorld Kids</td>
              <td>€ 71,95 per jaar</td>
              <td>Ongeveer 10 jaar</td>
              <td>Certificaat na het examen</td>
              <td>Ja</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        <small>
          Prijzen en voorwaarden zoals op de eigen websites van de cursussen op {CHECKED}. Ze veranderen geregeld,
          kijk dus altijd even op de site zelf.
        </small>
      </p>

      <h2>Wat je krijgt bij een betaalde cursus</h2>
      <p>
        Betaalde cursussen bieden meer dan alleen de lessen. Voor je geld krijg je meestal:
      </p>
      <ul>
        <li>Een diploma met garantie: haalt je kind het niet, dan krijg je je geld terug of mag het langer oefenen.</li>
        <li>Een account, zodat de voortgang op elk apparaat bewaard blijft.</li>
        <li>Bij sommige cursussen begeleiding door een docent, online of in een klaslokaal.</li>
        <li>
          Aanpassingen voor kinderen met dyslexie. Bij Typetuin kan de norm voor het diploma dan omlaag naar 75 aanslagen
          per minuut.
        </li>
      </ul>

      <h2>Wat je krijgt bij gratistypenleren.nl</h2>
      <ul>
        <li>De hele cursus, gratis: {LESSONS.length} stappen over {ISLANDS.length} eilanden, van F en J tot het examen.</li>
        <li>Geen account, geen reclame, geen cookies. Je kind kan binnen een minuut beginnen.</li>
        <li>Spelletjes, sterren en een dagelijkse oefening met de letters die je kind nog lastig vindt.</li>
        <li>
          Certificaten bij 75 en 100 aanslagen per minuut en een <a href="/typediploma/">typediploma</a> bij 120, met de
          naam van je kind erop.
        </li>
      </ul>

      <h2>Wanneer kies je voor betaald?</h2>
      <p>We zijn eerlijk: in deze gevallen past een betaalde cursus beter.</p>
      <ul>
        <li>Je wilt een diploma met de naam van een bekende cursus, bijvoorbeeld voor een cv of de middelbare school.</li>
        <li>Je kind werkt beter met een docent of in een groep die meekijkt.</li>
        <li>Je kind oefent op verschillende computers en de voortgang moet meegaan.</li>
        <li>Je kind heeft dyslexie of een andere leerbehoefte en heeft een aangepaste norm nodig.</li>
      </ul>

      <h2>Wanneer is gratis genoeg?</h2>
      <ul>
        <li>Je wilt eerst zien of je kind het leuk vindt en volhoudt.</li>
        <li>Je kind oefent thuis, steeds op dezelfde computer of Chromebook.</li>
        <li>Het gaat om goed leren typen, niet om een officieel papiertje.</li>
        <li>
          Je bent leerkracht en zoekt iets voor de hele klas, zonder licenties en leerlinggegevens. Zie{' '}
          <a href="/voor-leerkrachten/">voor leerkrachten</a>.
        </li>
      </ul>
      <p>
        Je kunt ook allebei doen: begin gratis, en kies later alsnog een betaalde cursus als je kind meer begeleiding of
        een diploma met garantie nodig heeft. Wat je kind bij ons leert, neemt het gewoon mee.
      </p>

      <Snuf>Probeer gerust eerst een paar lessen met mij. Kost niks, alleen een beetje oefenen!</Snuf>
    </>
  ),
}

const FAQ: Question[] = [
  {
    q: 'Is het echt helemaal gratis?',
    text: 'Ja. Er is geen abonnement, geen betaalde versie en geen reclame.',
    a: <p>Ja. Er is geen abonnement, geen betaalde versie en geen reclame.</p>,
  },
  {
    q: 'Moet ik een account maken?',
    text: 'Nee. Je kind kan meteen beginnen. De voortgang wordt in de browser op het apparaat bewaard.',
    a: <p>Nee. Je kind kan meteen beginnen. De voortgang wordt in de browser op het apparaat bewaard.</p>,
  },
  {
    q: 'Waar wordt de voortgang bewaard?',
    text: 'In de browser, op het apparaat waarop je kind oefent. Op een ander apparaat of na het wissen van de browsergegevens begint de cursus opnieuw.',
    a: (
      <p>
        In de browser, op het apparaat waarop je kind oefent. Op een ander apparaat of na het wissen van de
        browsergegevens begint de cursus opnieuw. Oefen dus steeds op dezelfde computer.
      </p>
    ),
  },
  {
    q: 'Vanaf welke leeftijd kan mijn kind beginnen?',
    text: 'Vanaf groep 6, als je kind een jaar of negen is en vlot leest. Oudere kinderen en volwassenen kunnen er ook mee leren.',
    a: (
      <p>
        Vanaf groep 6, als je kind een jaar of negen is en vlot leest. Oudere kinderen en volwassenen kunnen er ook mee
        leren. Zie <a href="/voor-ouders/">voor ouders</a>.
      </p>
    ),
  },
  {
    q: 'Hoe lang moet mijn kind per dag oefenen?',
    text: 'Een paar minuten per dag is genoeg. Het dagdoel in het spel is vijf minuten typen, en vaak oefenen werkt beter dan lang.',
    a: <p>Een paar minuten per dag is genoeg. Het dagdoel in het spel is vijf minuten typen, en vaak oefenen werkt beter dan lang.</p>,
  },
  {
    q: 'Welk toetsenbord heb ik nodig?',
    text: 'Een gewoon toetsenbord met de Amerikaanse indeling (US-QWERTY), zoals op de meeste laptops en Chromebooks in Nederland. Op een tablet heb je een los toetsenbord nodig.',
    a: (
      <p>
        Een gewoon toetsenbord met de Amerikaanse indeling (US-QWERTY), zoals op de meeste laptops en Chromebooks in
        Nederland. Op een tablet heb je een los toetsenbord nodig. Zie ook{' '}
        <a href="/typen-leren-op-chromebook/">typen leren op een Chromebook</a>.
      </p>
    ),
  },
  {
    q: 'Krijgt mijn kind een typediploma?',
    text: 'Ja. Wie bij het examen 120 aanslagen per minuut typt met 95% goed, krijgt het typediploma. Bij 75 en 100 aanslagen per minuut zijn er certificaten.',
    a: (
      <p>
        Ja. Wie bij het examen 120 aanslagen per minuut typt met 95% goed, krijgt het{' '}
        <a href="/typediploma/">typediploma</a>. Bij 75 en 100 aanslagen per minuut zijn er certificaten.
      </p>
    ),
  },
  {
    q: 'Kan ik het geluid uitzetten?',
    text: 'Ja, met de knop rechtsboven in het spel.',
    a: <p>Ja, met de knop rechtsboven in het spel.</p>,
  },
  {
    q: 'Wat gebeurt er als mijn kind een fout typt?',
    text: 'De cursor wacht tot de goede toets is getypt. Zo leert je kind de juiste vinger te zoeken. Fouten tellen wel mee voor de sterren.',
    a: (
      <p>
        De cursor wacht tot de goede toets is getypt. Zo leert je kind de juiste vinger te zoeken. Fouten tellen wel
        mee voor de sterren: twee sterren bij 90% goed, drie bij 95% goed en het snelheidsdoel.
      </p>
    ),
  },
  {
    q: 'Zitten er letters met accenten in, zoals é en ë?',
    text: 'Nee. De oefenwoorden en zinnen hebben geen letters met accenten.',
    a: <p>Nee. De oefenwoorden en zinnen hebben geen letters met accenten.</p>,
  },
  {
    q: 'Wie heeft dit gemaakt?',
    text: 'Gratistypenleren.nl is gemaakt door een vader en dochter, die een typecursus wilden die gratis en leuk is.',
    a: <p>Gratistypenleren.nl is gemaakt door een vader en dochter, die een typecursus wilden die gratis en leuk is.</p>,
  },
]

const QUESTIONS: Page = {
  path: '/veelgestelde-vragen/',
  name: 'Veelgestelde vragen',
  title: 'Veelgestelde vragen over gratis typen leren',
  h1: 'Veelgestelde vragen',
  description:
    'Antwoorden over de gratis typecursus: kosten, account, voortgang, leeftijd, toetsenbord en het typediploma.',
  lead: <p>Staat je vraag er niet tussen? Begin gewoon: de eerste les legt alles stap voor stap uit.</p>,
  body: null,
  faq: FAQ,
}

export const PAGES: Page[] = [
  HOW,
  LESSONS_OVERVIEW,
  PARENTS,
  TEACHERS,
  DIPLOMA,
  FINGERING,
  TOUCH_TYPING,
  CHROMEBOOK,
  COMPARISON,
  QUESTIONS,
  ...ISLAND_PAGES,
]
