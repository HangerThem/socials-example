'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginSchema } from '@/schema/Login.schema'
import { signIn } from '@/lib/auth-client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function LoginPage() {
  const router = useRouter()
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
        })
      : await signIn.username({
          username: data.emailOrUsername,
          password: data.password,
        })

    if (error) {
      setServerError(error.message ?? 'Invalid email/username or password')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
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
        {serverError && <p className="text-red-500 text-sm">{serverError}</p>}
        <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Login'}
        </Button>
      </form>
    </div>
  )
}
