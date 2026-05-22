import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/cn'

type DecorativeFrameProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function DecorativeFrame({
  children,
  className,
  ...props
}: DecorativeFrameProps) {
  return (
    <div
      className={cn(
        'relative rounded-xl border border-burgundy/25 bg-parchment/35 p-3 shadow-soft',
        'before:absolute before:inset-2 before:rounded-lg before:border before:border-cream/45 before:content-[""]',
        className,
      )}
      {...props}
    >
      <div className="relative">{children}</div>
    </div>
  )
}
