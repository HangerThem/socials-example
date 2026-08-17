import { z } from 'zod'

export const commentSchema = z.object({
  content: z.string().max(280, 'Comment content must be at most 280 characters long'),
})

export type CommentSchema = z.infer<typeof commentSchema>
