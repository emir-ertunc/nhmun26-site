import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/cn'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: 'primary' | 'secondary'
}

export function Button({
  children,
  className,
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex min-h-12 items-center justify-center rounded-[1.35rem_0.9rem_1.45rem_0.85rem] px-6 py-3 text-sm font-extrabold uppercase tracking-[0.16em] shadow-parchment transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy',
        variant === 'primary' &&
          'bg-cream text-burgundy hover:-translate-y-0.5 hover:bg-white',
        variant === 'secondary' &&
          'border border-cream/45 bg-burgundy/20 text-cream hover:bg-burgundy/35',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
