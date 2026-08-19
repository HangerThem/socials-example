'use client'

import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, RegisterSchema } from '@/schema/Register.schema'
import { signUp } from '@/lib/auth-client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { uploadFile } from '@/server-actions/file'
import { passwordStrength } from 'check-password-strength'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { FileInput } from '@/components/ui/FileInput'
import { getSafeCallbackUrl } from '@/utils/safe-redirect'
import { Textarea } from '../ui/Textarea'

type RegisterFormProps = {
  callbackUrl?: string | null
}

export function RegisterForm({ callbackUrl }: RegisterFormProps) {
  const [onboardingStep, setOnboardingStep] = useState<'main' | 'profile'>('main')
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    trigger,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterSchema) => {
    setServerError(null)

    let profilePicture: string | undefined = undefined

    if (data.profilePicture) {
      try {
        const formData = new FormData()
        formData.append('avatar', data.profilePicture)
        const uploadedFile = await uploadFile(formData)
        if ('error' in uploadedFile) {
          setServerError(uploadedFile.error)
          return
        }
        profilePicture = uploadedFile.url
      } catch (error) {
        console.error('Error uploading profile picture:', error)
        setServerError('Failed to upload profile picture. Please try again.')
        return
      }
    }

    const { error } = await signUp.email({
      email: data.email,
      password: data.password,
      name: data.displayUsername || data.username,
      username: data.username,
      image: profilePicture,
      bio: data.bio,
      callbackURL: getSafeCallbackUrl(callbackUrl),
    })

    if (error) {
      setServerError(error.message ?? 'Something went wrong. Please try again.')
      return
    }
  }

  const moveToProfileStep = () => {
    trigger(['username', 'email', 'password', 'confirmPassword']).then((isValid) => {
      if (isValid) {
        setOnboardingStep('profile')
      }
    })
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Create an account</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-80">
        {onboardingStep === 'main' && (
          <>
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
                  width: `${(passwordStrength(watch('password')).id / 3) * 100}%`,
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

            <Button type="button" onClick={moveToProfileStep}>
              Next
            </Button>
          </>
        )}
        {onboardingStep === 'profile' && (
          <>
            <button
              type="button"
              onClick={() => setOnboardingStep('main')}
              className="flex items-center gap-1 text-sm text-accent hover:underline w-fit cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>

            <Controller
              name="profilePicture"
              control={control}
              render={({ field }) => (
                <FileInput
                  label="Profile picture (optional)"
                  error={errors.profilePicture?.message}
                  id="profilePicture"
                  accept="image/*"
                  {...field}
                />
              )}
            />

            <Input
              label="Display username (optional)"
              id="displayUsername"
              type="text"
              {...register('displayUsername')}
              error={errors.displayUsername?.message}
            />

            <Textarea
              label="Bio (optional)"
              id="bio"
              {...register('bio')}
              error={errors.bio?.message}
            />

            <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </Button>
          </>
        )}

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
