'use client'

import { Button } from '../ui/Button'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profilePictureSchema, ProfilePictureSchema } from '@/schema/ProfilePicture.schema'
import { FileInput } from '../ui/FileInput'

type UpdateProfilePictureFormProps = {
  onCancel?: () => void
}

export function UpdateProfilePictureForm({ onCancel }: UpdateProfilePictureFormProps) {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProfilePictureSchema>({
    defaultValues: {
      file: undefined,
    },
    resolver: zodResolver(profilePictureSchema),
  })

  const onSubmit = (data: ProfilePictureSchema) => {
    console.log('Profile picture submitted:', data.file)
  }

  return (
    <>
      <h3 className="text-lg font-semibold mb-2">Update Profile Picture</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="file"
          control={control}
          render={({ field }) => (
            <FileInput
              {...field}
              error={errors.file?.message}
              id="profilePicture"
              accept="image/*"
            />
          )}
        />
        <div className="flex gap-2 mt-2">
          <Button type="submit" size="small" variant="primary">
            Submit
          </Button>
          {onCancel && (
            <Button size="small" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </>
  )
}
