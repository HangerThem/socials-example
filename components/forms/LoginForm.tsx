'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginSchema } from '@/schema/Login.schema'
import { signIn } from '@/lib/auth-client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'
import { getSafeCallbackUrl } from '@/utils/safe-redirect'

type LoginFormProps = {
  callbackUrl?: string | null
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginSchema) => {
    setServerError(null)

    const isEmail = data.emailOrUsername.includes('@')

    const { error } = isEmail
      ? await signIn.email({
          email: data.emailOrUsername,
          password: data.password,
          rememberMe: data.rememberMe,
          callbackURL: getSafeCallbackUrl(callbackUrl),
        })
      : await signIn.username({
          username: data.emailOrUsername,
          password: data.password,
          rememberMe: data.rememberMe,
          callbackURL: getSafeCallbackUrl(callbackUrl),
        })

    if (error) {
      setServerError(error.message ?? 'Invalid email/username or password')
      return
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-80">
        <Input
          label="Email or Username"
          id="emailOrUsername"
          type="text"
          {...register('emailOrUsername')}
          error={errors.emailOrUsername?.message}
        />
        <Input
          label="Password"
          id="password"
          type="password"
          {...register('password')}
          error={errors.password?.message}
        />
        <div className="flex items-center gap-2">
          <input
            id="rememberMe"
            type="checkbox"
            {...register('rememberMe')}
            className="w-3 h-3 text-accent cursor-pointer"
          />
          <label htmlFor="rememberMe" className="text-sm text-muted">
            Remember me
          </label>
        </div>
        {serverError && <p className="text-like text-sm">{serverError}</p>}
        <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Login'}
        </Button>
      </form>
      <p className="text-sm text-muted mt-4 text-center">
        Don't have an account?{' '}
        <Link href="/register" className="text-accent hover:underline">
          Register
        </Link>
      </p>
    </>
  )
}
