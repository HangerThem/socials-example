import { z } from 'zod'
import { usernameIsUnique, emailIsUnique } from '@/actions/user'
import { usernameRegex } from '@/const/usernameRegex'

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must be at most 20 characters')
      .regex(usernameRegex, 'Username can only contain letters, numbers, and underscores')
      .refine(async (username) => await usernameIsUnique(username), {
        message: 'Username is already taken',
      }),
    email: z.email('Enter a valid email').refine(async (email) => await emailIsUnique(email), {
      message: 'Email is already registered',
    }),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password must be at most 100 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type RegisterSchema = z.infer<typeof registerSchema>
