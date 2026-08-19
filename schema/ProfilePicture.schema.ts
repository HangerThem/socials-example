import { z } from 'zod'

export const profilePictureSchema = z.object({
  file: z.instanceof(File, {
    error: 'Profile picture must be a valid file',
  }),
})

export type ProfilePictureSchema = z.infer<typeof profilePictureSchema>
