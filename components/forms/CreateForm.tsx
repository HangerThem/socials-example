'use client'

import { postSchema, PostSchema } from '@/schema/Post.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { FileInput } from '../ui/FileInput'
import { Textarea } from '../ui/Textarea'
import { batchUploadFiles } from '@/server-actions/file'
import { createPost } from '@/server-actions/post'
import { useRouter } from 'next/navigation'

export function CreateForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const router = useRouter()
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PostSchema>({
    resolver: zodResolver(postSchema),
  })

  const onSubmit = async (data: PostSchema) => {
    let fileIds: string[] = []
    if (data.files && data.files.length > 0) {
      const formData = new FormData()
      data.files.forEach((fileItem) => {
        formData.append('files', fileItem.file)
        formData.append('alts', fileItem.alt ?? '')
      })

      const uploadResponse = await batchUploadFiles(formData)
      if (Array.isArray(uploadResponse)) {
        fileIds = uploadResponse
          .filter((file) => 'id' in file)
          .map((file) => (file as { id: string }).id)
      } else {
        setServerError(uploadResponse.error || 'File upload failed')
        return
      }
    }

    try {
      const res = await createPost(data.content, fileIds)
      router.push(`/post/${res.id}`)
      // oxlint-disable-next-line typescript/no-explicit-any
    } catch (error: any) {
      setServerError(error.message || 'Failed to create post')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Textarea
        label={`Content (${watch('content')?.length ?? 0}/280)`}
        error={errors.content?.message}
        maxLength={280}
        {...register('content')}
      />

      {errors.content && <span className="text-red-500">{errors.content.message}</span>}

      <Controller
        name="files"
        control={control}
        render={({ field }) => (
          <FileInput
            label="Upload an image"
            error={errors.files?.message}
            multiple
            allowAlt
            id="files"
            {...field}
          />
        )}
      />

      {serverError && <span className="text-red-500">{serverError}</span>}

      <button type="submit" disabled={isSubmitting} className="bg-blue-500 text-white p-2 rounded">
        {isSubmitting ? 'Posting...' : 'Post'}
      </button>
    </form>
  )
}
