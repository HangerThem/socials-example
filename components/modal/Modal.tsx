'use client'

import { cn } from '@/utils/cn'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

type ModalProps = {
  open: boolean
  onClose: () => void
  transparent?: boolean
  children: React.ReactNode
}

export function Modal({ open, onClose, transparent, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const canUseDOM = typeof document !== 'undefined'

  return (
    canUseDOM &&
    createPortal(
      <AnimatePresence>
        {open && (
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => {
              e.stopPropagation()
              if (e.target === overlayRef.current) onClose()
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <div
              className={cn('rounded-lg p-6 max-w-md w-full', {
                'bg-background': !transparent,
              })}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body,
    )
  )
}
