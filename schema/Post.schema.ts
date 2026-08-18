import { z } from 'zod'

export const postSchema = z.object({
  content: z.string().max(280, 'Post content must be at most 280 characters long'),
  files: z
    .array(
      z.object({
        file: z.instanceof(File),
        alt: z.string().max(100, 'Alt text must be at most 100 characters long').optional(),
      }),
    )
    .optional(),
})

export type PostSchema = z.infer<typeof postSchema>
