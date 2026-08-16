'use client'

import { cn } from '@/utils/cn'
import { motion, AnimatePresence } from 'framer-motion'
import { ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

type FileInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type'
> & {
  label?: string
  error?: string
  value?: File | null
  onChange?: (file: File | null) => void
}

export const FileInput = ({ label, error, value, onChange, ...props }: FileInputProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null)
      return
    }

    const url = URL.createObjectURL(value)
    setPreviewUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    onChange?.(file)
  }

  return (
    <div className="flex flex-col">
      {label && (
        <label htmlFor={props.id}>
          <span className="text-sm font-medium">{label}</span>
          <div
            className={cn(
              'relative mt-1 flex items-center justify-center w-full max-w-48 rounded-lg aspect-square cursor-pointer overflow-hidden mx-auto border',
              error ? 'border-red-500' : 'border-border',
              !previewUrl && 'bg-background',
            )}
          >
            {previewUrl ? (
              <Image src={previewUrl} alt="Preview" className="object-cover" fill sizes="192px" />
            ) : (
              <ImageIcon className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
        </label>
      )}
      {previewUrl && (
        <button
          type="button"
          onClick={() => onChange?.(null)}
          className="text-sm text-accent hover:underline w-fit cursor-pointer mx-auto mt-1"
        >
          Remove
        </button>
      )}
      <input type="file" className="hidden" onChange={handleChange} {...props} />
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
