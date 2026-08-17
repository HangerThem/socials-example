'use client'

import { postSchema, PostSchema } from '@/schema/Post.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { FileInput } from '../ui/FileInput'

export function CreateForm() {
  const [serverError, setServerError] = useState<string | null>(null)
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
    setServerError(null)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <textarea
        placeholder="What's on your mind?"
        {...register('content')}
        className="border border-gray-300 rounded p-2"
        maxLength={280}
      />

      <span className="text-gray-500">Characters: {watch('content')?.length ?? 0}/280</span>
      {errors.content && <span className="text-red-500">{errors.content.message}</span>}

      <Controller
        name="files"
        control={control}
        render={({ field }) => (
          <FileInput
            label="Upload an image"
            error={errors.files?.message}
            multiple
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
