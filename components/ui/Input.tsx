'use client'

import { cn } from '@/utils/cn'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export const Input = ({ label, error, ...props }: InputProps) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex flex-col">
      {label && (
        <label htmlFor={props.id} className="text-sm font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={cn(
            'w-full px-3 py-2 border rounded-md outline-none border-border focus:border-accent my-1 bg-background',
            {
              'border-red-500': error,
            },
            {
              'pr-7': props.type === 'password',
            },
          )}
          {...props}
          type={props.type === 'password' && showPassword ? 'text' : props.type}
        />
        {props.type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-ink/50 hover:text-ink transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-red-500 text-sm"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
