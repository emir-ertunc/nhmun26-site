import type { ImgHTMLAttributes } from 'react'
import type { NhmunImage } from '../assets/nhmun'
import { cn } from '../lib/cn'

type ResponsiveImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'alt' | 'src'
> & {
  image: NhmunImage
}

export function ResponsiveImage({
  className,
  image,
  ...props
}: ResponsiveImageProps) {
  return (
    <picture>
      <source srcSet={image.avif} type="image/avif" />
      <source srcSet={image.webp} type="image/webp" />
      <img
        alt={image.alt}
        className={cn('block h-full w-full object-cover', className)}
        src={image.webp}
        {...props}
      />
    </picture>
  )
}
