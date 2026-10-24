// Our own mascot: a fluffy white seal pup, chosen by its biggest fan.
// Drawn as separate SVG parts, each turning around its own joint (styles in index.css under "Mascot").
import { useId } from 'react'

export type Mood = 'idle' | 'happy' | 'oops'
// Sitting on land, or swimming with only the head and shoulders above the water
export type Pose = 'sit' | 'swim'

type Props = {
  size?: number
  mood?: Mood
  pose?: Pose
  // No idle animation, for small spots like the header
  still?: boolean
  className?: string
}

const LINE = '#b3a797'
const FLIPPER = '#e9e2d8'
const NOSE = '#4a3d3a'
const EYE = 11.5

export function Seal({ size = 160, mood = 'idle', pose = 'sit', still = false, className = '' }: Props) {
  const id = useId()
  const fur = `url(#${id}-fur)`
  const swim = pose === 'swim'
  const classes = ['seal', `mood-${mood}`, `pose-${pose}`, still ? 'still' : '', className]

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={classes.join(' ')}
      role="img"
      aria-label="Zeehond"
    >
      <defs>
        <linearGradient id={`${id}-fur`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#fbf8f3" />
          <stop offset="1" stopColor={FLIPPER} />
        </linearGradient>
        {/* Everything under the water line disappears while swimming */}
        <clipPath id={`${id}-water`}>
          <rect x="-40" y="-40" width="280" height="225" />
        </clipPath>
      </defs>

      {!swim && <ellipse className="seal-shadow" cx="100" cy="191" rx="72" ry="6" />}

      {swim && (
        <g className="seal-ripples">
          <ellipse className="seal-ripple" cx="100" cy="185" rx="62" ry="11" />
          <ellipse className="seal-ripple late" cx="100" cy="185" rx="62" ry="11" />
        </g>
      )}

      <g clipPath={swim ? `url(#${id}-water)` : undefined}>
        <g className="seal-swimmer">
          <g className="seal-figure">
            <g className="seal-tail">
              <path
                d="M148 176 Q172 172 185 155 Q183 170 177 178 Q188 180 194 189 Q170 193 146 186 Z"
                fill={FLIPPER}
                stroke={LINE}
                strokeWidth="3"
                strokeLinejoin="round"
              />
            </g>

            <g className="seal-body">
              <path
                d="M40 170 C30 130 55 100 100 98 C145 100 170 130 160 170 C156 190 44 190 40 170 Z"
                fill={fur}
                stroke={LINE}
                strokeWidth="3"
              />
              <ellipse cx="100" cy="152" rx="38" ry="28" fill="#fffdf8" />
              <g fill="none" stroke={LINE} strokeWidth="2" strokeLinecap="round" opacity="0.6">
                <path d="M46 150 q-4 4 0 8" />
                <path d="M154 150 q4 4 0 8" />
                <path d="M90 182 q4 3 8 0" />
              </g>
            </g>

            <g className="seal-flipper left">
              <path
                d="M66 122 C48 128 36 150 40 168 C44 175 55 171 58 161 C62 149 71 137 72 129 Z"
                fill={FLIPPER}
                stroke={LINE}
                strokeWidth="3"
                strokeLinejoin="round"
              />
            </g>
            <g className="seal-flipper right">
              <path
                d="M134 122 C152 128 164 150 160 168 C156 175 145 171 142 161 C138 149 129 137 128 129 Z"
                fill={FLIPPER}
                stroke={LINE}
                strokeWidth="3"
                strokeLinejoin="round"
              />
            </g>

            <g className="seal-head">
              <ellipse cx="100" cy="70" rx="53" ry="45" fill={fur} stroke={LINE} strokeWidth="3" />
              <path
                d="M86 29 q5 -9 9 -1 q5 -10 10 0 q5 -9 9 1"
                fill="none"
                stroke={LINE}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <ellipse cx="64" cy="84" rx="10" ry="6" fill="#f48fb1" opacity="0.4" />
              <ellipse cx="136" cy="84" rx="10" ry="6" fill="#f48fb1" opacity="0.4" />

              <g className="seal-eyes open">
                <circle cx="80" cy="63" r={EYE} fill="#2b2340" />
                <circle cx="120" cy="63" r={EYE} fill="#2b2340" />
                <circle cx={80 + EYE * 0.35} cy={63 - EYE * 0.35} r={EYE * 0.36} fill="#fff" />
                <circle cx={120 + EYE * 0.35} cy={63 - EYE * 0.35} r={EYE * 0.36} fill="#fff" />
                <circle cx={80 - EYE * 0.3} cy={63 + EYE * 0.4} r="1.6" fill="#fff" />
                <circle cx={120 - EYE * 0.3} cy={63 + EYE * 0.4} r="1.6" fill="#fff" />
              </g>
              <g className="seal-eyes happy" fill="none" stroke="#2b2340" strokeWidth="4" strokeLinecap="round">
                <path d="M70 66 q10 -12 20 0" />
                <path d="M110 66 q10 -12 20 0" />
              </g>
              <g className="seal-eyes oops" fill="none" stroke="#2b2340" strokeWidth="4" strokeLinecap="round">
                <path d="M73 56 l13 7 l-13 7" />
                <path d="M127 56 l-13 7 l13 7" />
                <path d="M70 46 l14 -5" />
                <path d="M130 46 l-14 -5" />
              </g>

              <g className="seal-whiskers left" stroke={LINE} strokeWidth="2" strokeLinecap="round" opacity="0.7">
                <path d="M79 86 L52 80" />
                <path d="M79 90 L50 91" />
                <path d="M79 94 L54 102" />
              </g>
              <g className="seal-whiskers right" stroke={LINE} strokeWidth="2" strokeLinecap="round" opacity="0.7">
                <path d="M121 86 L148 80" />
                <path d="M121 90 L150 91" />
                <path d="M121 94 L146 102" />
              </g>

              <ellipse cx="90" cy="89" rx="13" ry="10" fill="#fff" stroke={LINE} strokeWidth="2" />
              <ellipse cx="110" cy="89" rx="13" ry="10" fill="#fff" stroke={LINE} strokeWidth="2" />
              <g fill={LINE} opacity="0.45">
                <circle cx="84" cy="88" r="1.4" />
                <circle cx="88" cy="93" r="1.4" />
                <circle cx="81" cy="93" r="1.4" />
                <circle cx="116" cy="88" r="1.4" />
                <circle cx="112" cy="93" r="1.4" />
                <circle cx="119" cy="93" r="1.4" />
              </g>
              <path d="M92 79 Q100 73 108 79 Q106 87 100 88 Q94 87 92 79 Z" fill={NOSE} />
              <ellipse cx="97" cy="78" rx="2.5" ry="1.5" fill="#fff" opacity="0.6" />

              <path
                className="seal-mouth smile"
                d="M94 100 Q100 105 106 100"
                fill="none"
                stroke={NOSE}
                strokeWidth="3"
                strokeLinecap="round"
              />
              <g className="seal-mouth open">
                <path d="M91 99 Q100 114 109 99 Z" fill="#b5587d" />
                <ellipse cx="100" cy="106" rx="5" ry="3" fill="#f48fb1" />
              </g>
              <ellipse className="seal-mouth round" cx="100" cy="103" rx="5" ry="4.5" fill="#b5587d" />
            </g>
          </g>
        </g>
      </g>

      {swim && (
        <g className="seal-waterline">
          <path d="M34 185 Q100 200 166 185" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
          <path d="M44 184 q8 -6 16 0 M140 184 q8 -6 16 0" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
        </g>
      )}
    </svg>
  )
}
