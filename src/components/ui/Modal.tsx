import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative z-10 w-full max-w-lg mx-4 bg-white rounded-xl shadow-xl',
          'transition-all duration-300',
          className
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
