'use client'

import { useSession } from '@/helper/auth-client'
import { AnimatePresence, motion } from 'framer-motion'

export function LoadingScreen() {
  const { isPending } = useSession()

  return (
    <AnimatePresence>
      {isPending && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background"
        >
          <motion.span
            initial={{ scale: 1 }}
            exit={{ scale: 1.2 }}
            className="text-6xl font-bold text-accent"
          >
            @handle
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
