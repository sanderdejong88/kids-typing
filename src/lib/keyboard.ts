export type Finger =
  | 'left-pinky'
  | 'left-ring'
  | 'left-middle'
  | 'left-index'
  | 'thumb'
  | 'right-index'
  | 'right-middle'
  | 'right-ring'
  | 'right-pinky'

export type Key = {
  // The character KeyboardEvent.key gives without Shift, or a name for special keys
  key: string
  label: string
  finger: Finger
  // Width in key units
  width?: number
}

const k = (key: string, finger: Finger, label = key.toUpperCase()): Key => ({ key, label, finger })
const wide = (key: string, label: string, finger: Finger, width: number): Key => ({
  key,
  label,
  finger,
  width,
})

// Chromebook US-QWERTY: no function row, and a Search/Launcher key where Caps Lock usually is (REQUIREMENTS G1).
export const ROWS: Key[][] = [
  [
    k('`', 'left-pinky', '`'),
    k('1', 'left-pinky'),
    k('2', 'left-ring'),
    k('3', 'left-middle'),
    k('4', 'left-index'),
    k('5', 'left-index'),
    k('6', 'right-index'),
    k('7', 'right-index'),
    k('8', 'right-middle'),
    k('9', 'right-ring'),
    k('0', 'right-pinky'),
    k('-', 'right-pinky'),
    k('=', 'right-pinky'),
    wide('Backspace', '⌫', 'right-pinky', 1.5),
  ],
  [
    wide('Tab', 'tab', 'left-pinky', 1.5),
    k('q', 'left-pinky'),
    k('w', 'left-ring'),
    k('e', 'left-middle'),
    k('r', 'left-index'),
    k('t', 'left-index'),
    k('y', 'right-index'),
    k('u', 'right-index'),
    k('i', 'right-middle'),
    k('o', 'right-ring'),
    k('p', 'right-pinky'),
    k('[', 'right-pinky'),
    k(']', 'right-pinky'),
    k('\\', 'right-pinky'),
  ],
  [
    wide('Search', '🔍', 'left-pinky', 1.75),
    k('a', 'left-pinky'),
    k('s', 'left-ring'),
    k('d', 'left-middle'),
    k('f', 'left-index'),
    k('g', 'left-index'),
    k('h', 'right-index'),
    k('j', 'right-index'),
    k('k', 'right-middle'),
    k('l', 'right-ring'),
    k(';', 'right-pinky'),
    k("'", 'right-pinky'),
    wide('Enter', 'enter', 'right-pinky', 1.75),
  ],
  [
    wide('ShiftLeft', 'shift', 'left-pinky', 2.25),
    k('z', 'left-pinky'),
    k('x', 'left-ring'),
    k('c', 'left-middle'),
    k('v', 'left-index'),
    k('b', 'left-index'),
    k('n', 'right-index'),
    k('m', 'right-index'),
    k(',', 'right-middle'),
    k('.', 'right-ring'),
    k('/', 'right-pinky'),
    wide('ShiftRight', 'shift', 'right-pinky', 2.25),
  ],
  [wide(' ', '', 'thumb', 6)],
]

const byKey = new Map(ROWS.flat().map((key) => [key.key, key]))

export function fingerFor(char: string): Finger | undefined {
  return byKey.get(char.toLowerCase())?.finger
}

export const FINGER_NAMES: Record<Finger, string> = {
  'left-pinky': 'linker pink',
  'left-ring': 'linker ringvinger',
  'left-middle': 'linker middelvinger',
  'left-index': 'linker wijsvinger',
  thumb: 'duim',
  'right-index': 'rechter wijsvinger',
  'right-middle': 'rechter middelvinger',
  'right-ring': 'rechter ringvinger',
  'right-pinky': 'rechter pink',
}
