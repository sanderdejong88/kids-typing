// Everything is kept in this browser only (REQUIREMENTS T4). Storage can be blocked or wiped,
// so every access is guarded: without it the game still works, it just forgets.
export function readJson<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key)
    return stored === null ? fallback : (JSON.parse(stored) as T)
  } catch {
    return fallback
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Not remembered this time
  }
}
