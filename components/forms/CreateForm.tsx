'use client'

import { postSchema, PostSchema } from '@/schema/Post.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { FileInput } from '../ui/FileInput'
import { createPost } from '@/actions/post'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/Button'
import { handleBatchUpload } from '@/helper/file'
import { MentionTextarea } from '../ui/MentionTextarea'

export function CreateForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const router = useRouter()
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PostSchema>({
    resolver: zodResolver(postSchema),
  })

  const content = useWatch({ control, name: 'content' })
  const contentLength = content ? content.length : 0

  const onSubmit = async (data: PostSchema) => {
    let fileIds: string[] = []
    if (data.files && data.files.length > 0) {
      const formData = new FormData()
      data.files.forEach((fileItem) => {
        formData.append('files', fileItem.file)
        formData.append('alts', fileItem.alt ?? '')
      })

      try {
        const uploadResponse = await handleBatchUpload(data.files)
        if (Array.isArray(uploadResponse)) {
          fileIds = uploadResponse
            .filter((file) => 'fileId' in file)
            .map((file) => (file as { fileId: string }).fileId)
        } else {
          setServerError(uploadResponse || 'File upload failed')
          return
        }
      } catch (error) {
        setServerError(error instanceof Error ? error.message : 'File upload failed')
        return
      }
    }

    try {
      const res = await createPost(data.content, fileIds)
      router.push(`/post/${res.id}`)
      // oxlint-disable-next-line typescript/no-explicit-any
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Failed to create post')
    }
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Controller
        name="content"
        control={control}
        render={({ field }) => (
          <MentionTextarea
            label={`Content (${contentLength}/280)`}
            error={errors.content?.message}
            placeholder="What's on your mind?"
            maxLength={280}
            onUpdate={(html, text) => {
              field.onChange(text)
            }}
            {...field}
          />
        )}
      />

      <Controller
        name="files"
        control={control}
        render={({ field }) => (
          <FileInput
            label="Upload an image"
            error={errors.files?.message}
            multiple
            id="files"
            setAlt={(index, alt) => {
              const currentFiles = field.value || []
              const updatedFiles = [...currentFiles]
              if (updatedFiles[index]) {
                updatedFiles[index] = { ...updatedFiles[index], alt }
                field.onChange(updatedFiles)
              }
            }}
            {...field}
          />
        )}
      />

      {serverError && <span className="text-like">{serverError}</span>}

      <Button type="submit" isLoading={isSubmitting}>
        {isSubmitting ? 'Posting...' : 'Post'}
      </Button>
    </form>
  )
}
