'use client'

import { cn } from '@/utils/cn'
import { motion, AnimatePresence } from 'framer-motion'

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
}

export const Textarea = ({ label, error, ...props }: TextareaProps) => {
  return (
    <div className="flex flex-col">
      {label && (
        <label htmlFor={props.id} className="text-sm font-medium">
          {label}
        </label>
      )}
      <div>
        <textarea
          className={cn(
            'w-full px-3 py-2 border rounded-md outline-none border-border focus:border-accent my-1 bg-background field-sizing-content resize-none max-h-48 min-h-24',
            {
              'border-like': error,
            },
          )}
          {...props}
        />
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-like text-sm"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
