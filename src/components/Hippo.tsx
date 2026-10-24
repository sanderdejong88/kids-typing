// Our own mascot: a chubby pastel hippo with a duckling on its head.
// Drawn as separate SVG parts so each can move (styles in index.css under "Mascot").
export type Mood = 'idle' | 'happy' | 'oops'

type Props = {
  size?: number
  mood?: Mood
  duck?: boolean
  // No idle animation, for small spots like the header
  still?: boolean
  className?: string
}

export function Hippo({ size = 160, mood = 'idle', duck = true, still = false, className = '' }: Props) {
  const classes = ['hippo', `mood-${mood}`, still ? 'still' : '', className]
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={classes.join(' ')}
      role="img"
      aria-label="Nijlpaard"
    >
      <defs>
        <linearGradient id="hippo-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a6b8f7" />
          <stop offset="0.6" stopColor="#bcb3ef" />
          <stop offset="1" stopColor="#efadc9" />
        </linearGradient>
        <radialGradient id="hippo-snout" cx="0.5" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#fdd3df" />
          <stop offset="1" stopColor="#f3a3bd" />
        </radialGradient>
      </defs>

      <g className="hippo-figure">
        <ellipse className="hippo-shadow" cx="100" cy="192" rx="70" ry="6" />

        <g className="hippo-body">
          <ellipse cx="100" cy="140" rx="80" ry="50" fill="url(#hippo-skin)" stroke="#8d8fdc" strokeWidth="3" />
          <ellipse cx="60" cy="184" rx="20" ry="11" fill="#c4b4ee" stroke="#8d8fdc" strokeWidth="3" />
          <ellipse cx="140" cy="184" rx="20" ry="11" fill="#c4b4ee" stroke="#8d8fdc" strokeWidth="3" />
        </g>

        <g className="hippo-head">
          <g className="hippo-ear left">
            <ellipse cx="58" cy="44" rx="14" ry="12" fill="#a6b8f7" stroke="#8d8fdc" strokeWidth="3" />
            <ellipse cx="58" cy="46" rx="7" ry="6" fill="#f3a3bd" />
          </g>
          <g className="hippo-ear right">
            <ellipse cx="142" cy="44" rx="14" ry="12" fill="#a6b8f7" stroke="#8d8fdc" strokeWidth="3" />
            <ellipse cx="142" cy="46" rx="7" ry="6" fill="#f3a3bd" />
          </g>

          <ellipse cx="100" cy="80" rx="60" ry="47" fill="#a9b9f6" stroke="#8d8fdc" strokeWidth="3" />
          <ellipse cx="50" cy="92" rx="10" ry="6" fill="#f48fb1" opacity="0.45" />
          <ellipse cx="150" cy="92" rx="10" ry="6" fill="#f48fb1" opacity="0.45" />

          <g className="hippo-eyes open">
            <circle cx="78" cy="68" r="7.5" fill="#2b2340" />
            <circle cx="122" cy="68" r="7.5" fill="#2b2340" />
            <circle cx="80.5" cy="65.5" r="2.5" fill="#fff" />
            <circle cx="124.5" cy="65.5" r="2.5" fill="#fff" />
          </g>
          <g className="hippo-eyes happy" fill="none" stroke="#2b2340" strokeWidth="4" strokeLinecap="round">
            <path d="M70 71 q8 -10 16 0" />
            <path d="M114 71 q8 -10 16 0" />
          </g>
          <g className="hippo-eyes oops" fill="none" stroke="#2b2340" strokeWidth="4" strokeLinecap="round">
            <path d="M71 62 l13 6 l-13 6" />
            <path d="M129 62 l-13 6 l13 6" />
          </g>

          <ellipse cx="100" cy="120" rx="56" ry="34" fill="url(#hippo-snout)" stroke="#e58aaa" strokeWidth="3" />
          <ellipse cx="82" cy="106" rx="5" ry="4" fill="#9c5a77" />
          <ellipse cx="118" cy="106" rx="5" ry="4" fill="#9c5a77" />

          <g className="hippo-mouth smile">
            <path d="M78 127 q22 15 44 0" fill="none" stroke="#b5587d" strokeWidth="3.5" strokeLinecap="round" />
            <rect x="89" y="132" width="9" height="8" rx="2.5" fill="#fff" />
            <rect x="102" y="132" width="9" height="8" rx="2.5" fill="#fff" />
          </g>
          <ellipse className="hippo-mouth round" cx="100" cy="132" rx="8" ry="7" fill="#b5587d" />
        </g>

        {duck && (
          <g className="hippo-duck">
            <ellipse cx="108" cy="30" rx="16" ry="11" fill="#ffd233" />
            <path d="M120 26 q8 -4 6 4" fill="#ffd233" />
            <circle cx="96" cy="17" r="10" fill="#ffd233" />
            <path d="M86 17 q-8 1 -9 4 q5 2 10 0 z" fill="#ff9b26" />
            <circle cx="93" cy="15" r="1.8" fill="#2b2340" />
            <path d="M104 30 q6 5 12 0" fill="none" stroke="#e8b400" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}
      </g>
    </svg>
  )
}
