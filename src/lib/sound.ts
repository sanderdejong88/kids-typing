// Little game sounds, made on the spot with Web Audio: no sound files and no external
// requests (REQUIREMENTS T5). Sound can be switched off and the choice is remembered (A2).
const STORAGE_KEY = 'typen-maar:sound'

export type Sound = 'key' | 'wrong' | 'combo' | 'round' | 'star' | 'complete' | 'unlock' | 'tap' | 'pop' | 'splash' | 'bounce' | 'gulp' | 'flame' | 'tick'

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
    case 'pop': {
      // A quick drop in pitch sounds like a pop; each balloon a note higher, up to an octave
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(900, t)
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.09)
      gain.gain.setValueAtTime(0.25, t)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.12)
      note(ctx, SCALE[step % 8], t + 0.05, 0.25, 0.1)
      break
    }
    case 'splash': {
      // Noise through a closing low-pass filter sounds like water, with a rising "bloop" on top
      const length = 0.5
      const buffer = ctx.createBuffer(1, Math.round(ctx.sampleRate * length), ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
      const noise = ctx.createBufferSource()
      noise.buffer = buffer
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(2600, t)
      filter.frequency.exponentialRampToValueAtTime(250, t + length)
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.2, t)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + length)
      noise.connect(filter).connect(gain).connect(ctx.destination)
      noise.start(t)
      const bloop = ctx.createOscillator()
      const bloopGain = ctx.createGain()
      bloop.type = 'sine'
      bloop.frequency.setValueAtTime(280, t)
      bloop.frequency.exponentialRampToValueAtTime(900, t + 0.12)
      bloopGain.gain.setValueAtTime(0.12, t)
      bloopGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14)
      bloop.connect(bloopGain).connect(ctx.destination)
      bloop.start(t)
      bloop.stop(t + 0.16)
      break
    }
    case 'flame': {
      // A warm whoosh as the flame catches, then a bright chord on top
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(110, t)
      osc.frequency.exponentialRampToValueAtTime(440, t + 0.35)
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(400, t)
      filter.frequency.exponentialRampToValueAtTime(2400, t + 0.35)
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.08, t + 0.15)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45)
      osc.connect(filter).connect(gain).connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.5)
      ;[0, 4, 7].forEach((n) => note(ctx, SCALE[n], t + 0.35, 0.8, 0.1))
      note(ctx, SCALE[11], t + 0.45, 0.9, 0.06, 'sine')
      break
    }
    case 'tick':
      // The count going up, a step higher each time
      note(ctx, SCALE[Math.min(step, 11)], t, 0.12, 0.1, 'sine')
      break
    case 'bounce':
      // A soft "tock" against the ball, a little higher the longer she keeps it up
      note(ctx, 330 + Math.min(step, 30) * 12, t, 0.09, 0.14, 'sine')
      note(ctx, 660 + Math.min(step, 30) * 24, t, 0.04, 0.03, 'sine')
      break
    case 'gulp': {
      // Snuf snaps up a fish: a quick sliding "hap", then a note that climbs with every fish
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(520, t)
      osc.frequency.exponentialRampToValueAtTime(190, t + 0.1)
      gain.gain.setValueAtTime(0.2, t)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.14)
      note(ctx, SCALE[step % 8], t + 0.08, 0.2, 0.08)
      break
    }
    case 'unlock':
      note(ctx, 330, t, 0.08, 0.12, 'square')
      ;[4, 7, 11].forEach((n, i) => note(ctx, SCALE[n], t + 0.12 + i * 0.07, 0.35, 0.12))
      break
  }
}
