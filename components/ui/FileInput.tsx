'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ImageIcon, X } from 'lucide-react'
import Image from 'next/image'
import { forwardRef, useEffect, useRef, useState } from 'react'

export type FileItem = { file: File; alt?: string }

type BaseProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type' | 'multiple'
> & {
  label?: string
  error?: string
  allowAlt?: boolean
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
  ({ label, error, value, onChange, multiple, allowAlt, ...props }, ref) => {
    const [previewUrls, setPreviewUrls] = useState<string[]>([])
    const labelRef = useRef<HTMLLabelElement>(null)

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
          <label ref={labelRef} htmlFor={props.id}>
            <span className="text-sm font-medium">{label}</span>
            {!multiple && (
              <div
                className={
                  'relative mt-1 flex flex-wrap items-center justify-center gap-2 rounded-lg cursor-pointer p-2 w-full max-w-48 aspect-square mx-auto overflow-hidden'
                }
              >
                {previewUrls.length === 0 && (
                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
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
        )}

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

                {allowAlt && (
                  <input
                    type="text"
                    placeholder="Alt text"
                    value={items[i]?.alt ?? ''}
                    onChange={(e) => {
                      const next = [...items]
                      next[i] = { ...next[i], alt: e.target.value }
                      onChange?.(next)
                    }}
                    className="w-full mt-1 px-2 py-1 border rounded-md outline-none border-border focus:border-accent bg-background text-sm"
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
