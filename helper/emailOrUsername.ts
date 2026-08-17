import { emailRegex } from '@/const/emailRegex'
import { usernameRegex } from '@/const/usernameRegex'
import { z } from 'zod'

/**
 * Validates an email or username string.
 * @param value - The email or username string to validate.
 * @param ctx - The Zod refinement context for adding issues.
 */
export const validateEmailOrUsername = (value: string, ctx: z.RefinementCtx) => {
  if (value.includes('@')) {
    if (!emailRegex.test(value)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Invalid email format',
      })
    }
    return
  }

  if (value.length < 3) {
    ctx.addIssue({
      code: 'too_small',
      minimum: 3,
      type: 'string',
      inclusive: true,
      message: 'Username must be at least 3 characters',
      origin: 'custom',
    })
  } else if (value.length > 20) {
    ctx.addIssue({
      code: 'too_big',
      maximum: 20,
      type: 'string',
      inclusive: true,
      message: 'Username must be at most 20 characters',
      origin: 'custom',
    })
  } else if (!usernameRegex.test(value)) {
    ctx.addIssue({
      code: 'custom',
      message: 'Username can only contain letters, numbers, and underscores',
    })
  }
}
