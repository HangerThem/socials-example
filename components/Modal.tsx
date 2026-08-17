'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'

export function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const overlayRef = useRef<HTMLDivElement>(null)

  const onDismiss = useCallback(() => router.back(), [router])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onDismiss])

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onDismiss()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div className="bg-background rounded-lg p-6 max-w-md w-full">{children}</div>
    </div>
  )
}
