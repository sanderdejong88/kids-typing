import { readJson, writeJson } from './storage'

// Typing needs a real keyboard. A phone or tablet without a mouse or touchpad most likely has none,
// so it gets a screen of its own (Phone.tsx). Whoever has a keyboard after all says so once.
const STORAGE_KEY = 'typen-maar:keyboard'

export function noKeyboard(): boolean {
  if (readJson(STORAGE_KEY, false)) return false
  try {
    return !window.matchMedia('(any-pointer: fine)').matches
  } catch {
    return false
  }
}

export const saveKeyboard = () => writeJson(STORAGE_KEY, true)
