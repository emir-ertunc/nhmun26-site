import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import type { NhmunImage } from '../assets/nhmun'
import { cn } from '../lib/cn'

type SectionProps = HTMLAttributes<HTMLElement> & {
  background?: NhmunImage
  children: ReactNode
  tone?: 'light' | 'dark'
}

export function Section({
  background,
  children,
  className,
  tone = 'light',
  style,
  ...props
}: SectionProps) {
  const backgroundStyle: CSSProperties | undefined = background
    ? {
        backgroundImage: `linear-gradient(rgba(246, 234, 213, 0.78), rgba(217, 185, 138, 0.88)), url(${background.webp})`,
        ...style,
      }
    : style

  return (
    <section
      className={cn(
        'relative overflow-hidden bg-cover bg-center px-5 py-20 md:px-8 md:py-28',
        tone === 'dark' && 'bg-cedar text-cream',
        tone === 'light' && 'bg-parchment text-ink',
        className,
      )}
      style={backgroundStyle}
      {...props}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  )
}
