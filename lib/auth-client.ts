import { createAuthClient } from 'better-auth/react'
import { usernameClient } from 'better-auth/client/plugins'
import type { CustomSession } from '@/types/Session.type'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [
    usernameClient({
      displayUsername: false,
    }),
  ],
})

export const useSession = () => {
  const session = authClient.useSession()
  return session as {
    data: CustomSession | null
    error: Error | null
    isPending: boolean
  }
}

export const { signIn, signUp, signOut } = authClient
