import { z } from 'zod'

import { validateEmailOrUsername } from '@/helper/emailOrUsername'

export const loginSchema = z.object({
  emailOrUsername: z.string().superRefine(validateEmailOrUsername),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

export type LoginSchema = z.infer<typeof loginSchema>
