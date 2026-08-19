'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ImageIcon, X } from 'lucide-react'
import Image from 'next/image'
import { forwardRef, useEffect, useRef } from 'react'
import { Input } from './Input'

export type FileItem = { file: File; alt?: string }

type BaseProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type' | 'multiple'
> & {
  label?: string
  error?: string
  setAlt?: (index: number, alt: string) => void
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
  ({ label, error, value, onChange, multiple, setAlt, ...props }, ref) => {
    const labelRef = useRef<HTMLLabelElement>(null)
    const urlCacheRef = useRef<Map<File, string>>(new Map())

    const items: FileItem[] = multiple
      ? ((value as FileItem[] | null) ?? [])
      : value
        ? [{ file: value as File }]
        : []

    const previewUrls = items.map(({ file }) => {
      let url = urlCacheRef.current.get(file)
      if (!url) {
        url = URL.createObjectURL(file)
        urlCacheRef.current.set(file, url)
      }
      return url
    })

    useEffect(() => {
      const cache = urlCacheRef.current
      const currentFiles = new Set(items.map((i) => i.file))
      for (const [file, url] of cache) {
        if (!currentFiles.has(file)) {
          URL.revokeObjectURL(url)
          cache.delete(file)
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    })

    useEffect(() => {
      const cache = urlCacheRef.current
      return () => {
        cache.forEach((url) => URL.revokeObjectURL(url))
        cache.clear()
      }
    }, [])

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
        <label ref={labelRef} htmlFor={props.id}>
          {label && <span className="text-sm font-medium">{label}</span>}
          {!multiple && (
            <div
              className={
                'border border-border relative mt-1 flex flex-wrap items-center justify-center gap-2 rounded-lg cursor-pointer p-2 w-full max-w-48 aspect-square mx-auto overflow-hidden'
              }
            >
              {previewUrls.length === 0 && (
                <ImageIcon className="w-12 h-12 text-muted-foreground" />
              )}

              {previewUrls[0] && (
                <Image
                  src={previewUrls[0]}
                  alt="Preview"
                  className="object-cover"
                  fill
                  sizes="192px"
                />
              )}
            </div>
          )}
        </label>

        {multiple && (
          <div className="mt-1 grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2">
            <button
              className="w-full h-auto aspect-square rounded-lg border border-dashed border-border hover:border-accent flex flex-col items-center justify-center gap-2 cursor-pointer text-muted hover:text-accent hover:bg-accent/10 transition-colors"
              onClick={(e) => {
                e.preventDefault()
                labelRef.current?.click()
              }}
            >
              <ImageIcon className="w-6 h-6" />
              <span className="text-sm">Add files</span>
            </button>
            {previewUrls.map((url, i) => (
              <div key={url}>
                <div className="group relative w-full h-auto aspect-square rounded-lg overflow-hidden border border-border">
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
                    className="opacity-0 group-hover:opacity-100 absolute top-1 right-1 rounded-full bg-black/20 hover:bg-black/80 p-1 cursor-pointer transition-all"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                {setAlt && (
                  <Input
                    type="text"
                    placeholder="Alt text"
                    size="small"
                    value={items[i]?.alt ?? ''}
                    onChange={(e) => setAlt(i, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
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
              className="text-like text-sm"
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
