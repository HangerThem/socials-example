import { z } from 'zod'
import { usernameIsUnique, emailIsUnique } from '@/server-actions/user'

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must be at most 20 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed')
      .refine(async (username) => await usernameIsUnique(username), {
        message: 'Username is already taken',
      }),
    email: z.email('Enter a valid email').refine(async (email) => await emailIsUnique(email), {
      message: 'Email is already registered',
    }),
    displayUsername: z.string().max(50).optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string(),
    profilePicture: z.instanceof(File).optional(),
    bio: z.string().max(160).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type RegisterSchema = z.infer<typeof registerSchema>
