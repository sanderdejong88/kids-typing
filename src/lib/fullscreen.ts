// A button in the header lets the game fill the whole screen, and switches it off again.

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
