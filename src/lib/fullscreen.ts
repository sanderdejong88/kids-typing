// The game fills the whole screen. A browser only allows that after a click or key press,
// so it starts on her first one, and a button in the header switches it on and off.

// Chrome can keep Esc for the page in fullscreen (holding it still leaves), so Esc
// keeps stopping a lesson instead of throwing her out of fullscreen
type KeyboardLock = { lock?: (keys: string[]) => Promise<void> }

export function canFullscreen(): boolean {
  return Boolean(document.fullscreenEnabled)
}

export function isFullscreen(): boolean {
  return Boolean(document.fullscreenElement)
}

export async function enterFullscreen(): Promise<void> {
  if (!canFullscreen() || isFullscreen()) return
  try {
    await document.documentElement.requestFullscreen({ navigationUI: 'hide' })
    await (navigator as Navigator & { keyboard?: KeyboardLock }).keyboard?.lock?.(['Escape'])
  } catch {
    // Not allowed right now: the button still works later
  }
}

export function toggleFullscreen(): void {
  if (isFullscreen()) void document.exitFullscreen()
  else void enterFullscreen()
}

// Once per visit: when she leaves fullscreen herself, it stays that way
export function fullscreenOnFirstInput(): () => void {
  const start = (event: Event) => {
    stop()
    // Esc cannot open fullscreen, and a click on the button does that itself
    if (event instanceof KeyboardEvent && event.key === 'Escape') return
    if (event.target instanceof Element && event.target.closest('.fullscreen-toggle')) return
    void enterFullscreen()
  }
  const stop = () => {
    window.removeEventListener('pointerdown', start, true)
    window.removeEventListener('keydown', start, true)
  }
  window.addEventListener('pointerdown', start, true)
  window.addEventListener('keydown', start, true)
  return stop
}
