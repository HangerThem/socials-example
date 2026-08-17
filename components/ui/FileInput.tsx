'use client'

import { cn } from '@/utils/cn'
import { motion, AnimatePresence } from 'framer-motion'
import { ImageIcon, X } from 'lucide-react'
import Image from 'next/image'
import { forwardRef, useEffect, useState } from 'react'

export type FileItem = { file: File; alt?: string }

type BaseProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type' | 'multiple'
> & {
  label?: string
  error?: string
}

type FileInputProps = BaseProps &
  (
    | {
        multiple: true
        value?: FileItem[] | null
        onChange?: (files: FileItem[]) => void
      }
    | {
        multiple?: false
        value?: File | null
        onChange?: (file: File | null) => void
      }
  )

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  ({ label, error, value, onChange, multiple, ...props }, ref) => {
    const [previewUrls, setPreviewUrls] = useState<string[]>([])

    const items: FileItem[] = multiple
      ? ((value as FileItem[] | null) ?? [])
      : value
        ? [{ file: value as File }]
        : []

    useEffect(() => {
      if (items.length === 0) {
        setPreviewUrls([])
        return
      }

      const urls = items.map(({ file }) => URL.createObjectURL(file))
      setPreviewUrls(urls)

      return () => {
        urls.forEach((url) => URL.revokeObjectURL(url))
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files
      e.target.value = '' // allow re-selecting the same file later

      if (!selected || selected.length === 0) return

      if (multiple) {
        const next = [...items, ...Array.from(selected).map((file) => ({ file }))]
        onChange?.(next)
      } else {
        onChange?.(selected[0])
      }
    }

    const handleRemove = (index: number) => {
      if (multiple) {
        onChange?.(items.filter((_, i) => i !== index))
      } else {
        onChange?.(null)
      }
    }

    return (
      <div className="flex flex-col">
        {label && (
          <label htmlFor={props.id}>
            <span className="text-sm font-medium">{label}</span>
            <div
              className={cn(
                'relative mt-1 flex flex-wrap items-center justify-center gap-2 rounded-lg cursor-pointer border p-2',
                error ? 'border-red-500' : 'border-border',
                !multiple && 'w-full max-w-48 aspect-square mx-auto overflow-hidden',
                multiple && 'w-full min-h-24',
                previewUrls.length === 0 && 'bg-background',
              )}
            >
              {previewUrls.length === 0 && <ImageIcon className="w-6 h-6 text-muted-foreground" />}

              {!multiple && previewUrls[0] && (
                <Image
                  src={previewUrls[0]}
                  alt="Preview"
                  className="object-cover"
                  fill
                  sizes="192px"
                />
              )}

              {multiple &&
                previewUrls.map((url, i) => (
                  <div
                    key={url}
                    className="relative w-20 h-20 rounded-md overflow-hidden border border-border shrink-0"
                  >
                    <Image
                      src={url}
                      alt={items[i]?.alt ?? `Preview ${i + 1}`}
                      className="object-cover"
                      fill
                      sizes="80px"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleRemove(i)
                      }}
                      className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
            </div>
          </label>
        )}

        {!multiple && previewUrls[0] && (
          <button
            type="button"
            onClick={() => handleRemove(0)}
            className="text-sm text-accent hover:underline w-fit cursor-pointer mx-auto mt-1"
          >
            Remove
          </button>
        )}

        <input
          ref={ref}
          type="file"
          multiple={multiple}
          className="hidden"
          onChange={handleChange}
          {...props}
        />

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
  },
)

FileInput.displayName = 'FileInput'
