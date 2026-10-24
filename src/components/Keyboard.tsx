import { ROWS, baseKey, shiftFor } from '../lib/keyboard'

type Props = {
  // The character she has to type next
  next?: string
  // Keys taught so far; the rest is shown faded
  keys: string[]
  // Keys to point out, such as the new ones in a lesson intro
  highlight?: string[]
  // The key she pressed last: it goes down, green when right and red when wrong.
  // n changes with every key press, so the same key can go down twice in a row.
  pressed?: { key: string; ok: boolean; n: number }
}

export function Keyboard({ next, keys, highlight = [], pressed }: Props) {
  const down = pressed && baseKey(pressed.key)
  // A capital or a symbol like ? lights up its key and the Shift key on the other side
  const targets = [next, ...highlight].flatMap((char) => (char ? [baseKey(char), shiftFor(char)?.key] : []))
  const known = new Set(keys.flatMap((key) => [baseKey(key), shiftFor(key)?.key]))
  return (
    <div className="keyboard" aria-hidden="true">
      {ROWS.map((row, i) => (
        <div className="keyboard-row" key={i}>
          {row.map((key) => {
            const classes = [
              'key',
              `finger-${key.finger}`,
              known.has(key.key) || key.key === ' ' ? 'known' : 'unknown',
              targets.includes(key.key) ? 'target' : '',
              key.key === 'f' || key.key === 'j' ? 'bump' : '',
              key.key === down ? (pressed?.ok ? 'hit' : 'miss') : '',
            ]
            return (
              <div
                key={key.key === down ? `${key.key}-${pressed?.n}` : key.key}
                className={classes.join(' ')}
                style={{ flexGrow: key.width ?? 1 }}
              >
                {key.label}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
