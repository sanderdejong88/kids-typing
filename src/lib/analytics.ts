// Anonymous counts with GoatCounter: no cookies and nothing about who plays (see /voor-ouders/).
// The script tag in index.html sets window.goatcounter. When it is blocked, offline or on localhost,
// nothing is counted and the game does not notice.
export const GOATCOUNTER = 'https://gratistypenleren.goatcounter.com/count'

// The Tally form where parents and teachers leave tips
export const FEEDBACK_URL = 'https://tally.so/r/o994EX'

declare global {
  interface Window {
    goatcounter?: { count?: (vars: { path: string; title?: string; event?: boolean }) => void }
  }
}

// An event is a path such as les-af/lesson-3/2-sterren, so the dashboard groups it by its start
export function track(path: string, title?: string): void {
  try {
    window.goatcounter?.count?.({ path, title, event: true })
  } catch {
    // Not counted this time
  }
}
