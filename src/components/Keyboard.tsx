import { ROWS } from '../lib/keyboard'

type Props = {
  // The character she has to type next
  next?: string
  // Keys taught so far; the rest is shown faded
  keys: string[]
}

export function Keyboard({ next, keys }: Props) {
  const target = next?.toLowerCase()
  return (
    <div className="keyboard" aria-hidden="true">
      {ROWS.map((row, i) => (
        <div className="keyboard-row" key={i}>
          {row.map((key) => {
            const known = keys.includes(key.key) || key.key === ' '
            const classes = [
              'key',
              `finger-${key.finger}`,
              known ? 'known' : 'unknown',
              key.key === target ? 'target' : '',
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
