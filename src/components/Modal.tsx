import type { MouseEvent, ReactNode } from 'react'
import { useEffect } from 'react'
import { cn } from '../lib/cn'
import { Button } from './Button'
import { ParchmentCard } from './ParchmentCard'

type ModalProps = {
  children: ReactNode
  isOpen: boolean
  onClose: () => void
  title: string
}

export function Modal({ children, isOpen, onClose, title }: ModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      aria-labelledby="modal-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-ink/70 px-4 py-8"
      onMouseDown={handleBackdropClick}
      role="dialog"
    >
      <ParchmentCard className="max-h-[90vh] w-full max-w-2xl overflow-auto">
        <div className="flex items-start justify-between gap-6">
          <h2 className="font-serif text-3xl font-bold" id="modal-title">
            {title}
          </h2>
          <Button
            aria-label="Close modal"
            className={cn('min-h-10 px-4 py-2 text-xs')}
            onClick={onClose}
            type="button"
          >
            Close
          </Button>
        </div>
        <div className="mt-5">{children}</div>
      </ParchmentCard>
    </div>
  )
}
