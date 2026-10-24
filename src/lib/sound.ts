// Little game sounds, made on the spot with Web Audio: no sound files and no external
// requests (REQUIREMENTS T5). Sound can be switched off and the choice is remembered (A2).
const STORAGE_KEY = 'typen-maar:sound'

export type Sound = 'key' | 'wrong' | 'combo' | 'round' | 'star' | 'complete' | 'unlock' | 'tap'

let context: AudioContext | undefined
let muted = loadMuted()

function loadMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'off'
  } catch {
    return false
  }
}

export function isMuted(): boolean {
  return muted
}

export function setMuted(value: boolean): void {
  muted = value
  try {
    localStorage.setItem(STORAGE_KEY, value ? 'off' : 'on')
  } catch {
    // The choice just isn't remembered this time
  }
}

function audio(): AudioContext | undefined {
  if (typeof AudioContext === 'undefined') return undefined
  context ??= new AudioContext()
  // Browsers start audio suspended until the first click or key press
  if (context.state === 'suspended') void context.resume()
  return context
}

// One soft note: a sine or triangle with a quick attack and a gentle fade
function note(ctx: AudioContext, frequency: number, at: number, length: number, volume = 0.18, type: OscillatorType = 'triangle') {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(frequency, at)
  gain.gain.setValueAtTime(0, at)
  gain.gain.linearRampToValueAtTime(volume, at + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length)
  osc.connect(gain).connect(ctx.destination)
  osc.start(at)
  osc.stop(at + length + 0.05)
}

// Notes of a C major scale, so everything sounds happy together
const C5 = 523.25
const SCALE = [1, 9 / 8, 5 / 4, 4 / 3, 3 / 2, 5 / 3, 15 / 8, 2, 9 / 4, 5 / 2, 8 / 3, 3].map((r) => C5 * r)

// `step` lets a series climb: the first star is lower than the third
export function play(sound: Sound, step = 0): void {
  if (muted) return
  const ctx = audio()
  if (!ctx) return
  const t = ctx.currentTime + 0.01
  switch (sound) {
    case 'key':
      note(ctx, 1400 + step * 30, t, 0.04, 0.03, 'sine')
      break
    case 'tap':
      note(ctx, 880, t, 0.08, 0.08, 'sine')
      break
    case 'wrong':
      // A soft "bonk", not a harsh buzzer
      note(ctx, 220, t, 0.18, 0.14, 'sine')
      note(ctx, 185, t + 0.07, 0.2, 0.1, 'sine')
      break
    case 'combo':
      ;[0, 2, 4, 7].forEach((n, i) => note(ctx, SCALE[n], t + i * 0.06, 0.18, 0.1))
      break
    case 'round':
      ;[0, 4, 7].forEach((n, i) => note(ctx, SCALE[n], t + i * 0.09, 0.3, 0.14))
      break
    case 'star': {
      const base = [2, 4, 7][Math.min(step, 2)]
      note(ctx, SCALE[base], t, 0.35, 0.16)
      note(ctx, SCALE[base + 2], t + 0.08, 0.5, 0.12)
      note(ctx, SCALE[base] * 2, t + 0.08, 0.6, 0.05, 'sine')
      break
    }
    case 'complete':
      ;[0, 2, 4, 7, 9, 11].forEach((n, i) => note(ctx, SCALE[n], t + i * 0.08, 0.45, 0.12))
      note(ctx, SCALE[7], t + 0.5, 0.9, 0.1)
      note(ctx, SCALE[11], t + 0.5, 0.9, 0.08)
      break
    case 'unlock':
      note(ctx, 330, t, 0.08, 0.12, 'square')
      ;[4, 7, 11].forEach((n, i) => note(ctx, SCALE[n], t + 0.12 + i * 0.07, 0.35, 0.12))
      break
  }
}
