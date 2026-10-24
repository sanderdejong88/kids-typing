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

type Props = {
  name: ArtName
  size?: number
  className?: string
  alt?: string
}

export function Art({ name, size = 48, className, alt = '' }: Props) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}art/${name}.svg`}
      width={size}
      height={size}
      className={className}
      alt={alt}
      draggable={false}
    />
  )
}
