'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, RegisterSchema } from '@/schema/Register.schema'
import { signUp } from '@/lib/auth-client'

export default function RegisterPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterSchema) => {
    setServerError(null)

    const { error } = await signUp.email({
      email: data.email,
      password: data.password,
      name: data.displayUsername || data.username,
      username: data.username,
    })

    if (error) {
      // better-auth surfaces things like "email already exists" here
      setServerError(error.message ?? 'Something went wrong. Please try again.')
      return
    }

    // emailVerified defaults to false — send them to a "check your inbox"
    // step if you enable email verification, otherwise straight to onboarding
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Create an account</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-80">
        <div>
          <label htmlFor="username" className="block mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            {...register('username')}
            className={`w-full px-3 py-2 border rounded ${
              errors.username ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className={`w-full px-3 py-2 border rounded ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="displayUsername" className="block mb-1">
            Display username <span className="text-gray-400">(optional)</span>
          </label>
          <input
            id="displayUsername"
            type="text"
            {...register('displayUsername')}
            className={`w-full px-3 py-2 border rounded ${
              errors.displayUsername ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.displayUsername && (
            <p className="text-red-500 text-sm mt-1">{errors.displayUsername.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register('password')}
            className={`w-full px-3 py-2 border rounded ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block mb-1">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword')}
            className={`w-full px-3 py-2 border rounded ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {serverError && <p className="text-red-500 text-sm">{serverError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </div>
  )
}
