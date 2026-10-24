import type { CSSProperties } from 'react'

// Illustrations live in public/art (Twemoji, CC BY 4.0, see CREDITS.md)
export type ArtName =
  | 'star'
  | 'glowing-star'
  | 'trophy'
  | 'balloon'
  | 'party-popper'
  | 'sparkles'
  | 'crown'
  | 'water-wave'
  | 'sun'
  | 'rainbow'
  | 'fire'
  | 'medal'
  | 'gem'
  | 'lotus'
  | 'yellow-heart'
  | 'blue-heart'
  | 'palm-tree'
  | 'diploma'
  | 'flag'
  | 'lock'
  | 'dolphin'
  | 'fish'
  | 'shell'
  | 'island'
  | 'gift'

type Props = {
  name: ArtName
  size?: number
  className?: string
  alt?: string
  style?: CSSProperties
}

export function Art({ name, size = 48, className, alt = '', style }: Props) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}art/${name}.svg`}
      width={size}
      height={size}
      className={className}
      alt={alt}
      style={style}
      draggable={false}
    />
  )
}
