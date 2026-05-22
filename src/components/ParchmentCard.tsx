import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/cn'

type ParchmentCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function ParchmentCard({
  children,
  className,
  ...props
}: ParchmentCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-burgundy/20 bg-cream/82 p-6 text-ink shadow-parchment backdrop-blur-[1px]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
