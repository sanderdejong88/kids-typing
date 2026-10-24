import { ROWS, baseKey, shiftFor } from '../lib/keyboard'

type Props = {
  // The character she has to type next
  next?: string
  // Keys taught so far; the rest is shown faded
  keys: string[]
  // Keys to point out, such as the new ones in a lesson intro
  highlight?: string[]
}

export function Keyboard({ next, keys, highlight = [] }: Props) {
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
            ]
            return (
              <div
                key={key.key}
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
