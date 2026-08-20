'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, RegisterSchema } from '@/schema/Register.schema'
import { signUp } from '@/lib/auth-client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { passwordStrength } from 'check-password-strength'
import { motion } from 'framer-motion'
import { getSafeCallbackUrl } from '@/utils/safe-redirect'

type RegisterFormProps = {
  callbackUrl?: string | null
}

export function RegisterForm({ callbackUrl }: RegisterFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  })

  const password = watch('password')
  const strengthLevel = passwordStrength(password).id
  const strengthPercent = (strengthLevel / 3) * 100

  const onSubmit = async (data: RegisterSchema) => {
    setServerError(null)

    const { error: signupError } = await signUp.email({
      email: data.email,
      password: data.password,
      name: data.username,
      username: data.username,
      callbackURL: getSafeCallbackUrl(callbackUrl),
    })

    if (signupError) {
      setServerError(signupError.message ?? 'Something went wrong. Please try again.')
      return
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Create an account</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-80">
        <Input
          label="Username"
          id="username"
          type="text"
          {...register('username')}
          error={errors.username?.message}
        />

        <Input
          label="Email"
          id="email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
        />

        <Input
          label="Password"
          id="password"
          type="password"
          {...register('password')}
          error={errors.password?.message}
        />
        <div className="h-2 w-full rounded-full bg-foreground">
          <motion.div
            className="h-2 rounded-full bg-accent"
            initial={{ width: 0 }}
            animate={{
              width: `${strengthPercent}%`,
            }}
          />
        </div>

        <Input
          label="Confirm password"
          id="confirmPassword"
          type="password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />

        <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>

        {serverError && <p className="text-like text-sm">{serverError}</p>}
      </form>

      <p className="text-sm text-muted mt-4 text-center">
        Already have an account?{' '}
        <Link href="/login" className="text-accent hover:underline">
          Log in
        </Link>
      </p>
    </>
  )
}
