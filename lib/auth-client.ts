import { createAuthClient } from 'better-auth/react'
import { inferAdditionalFields, usernameClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [
    inferAdditionalFields({
      user: {
        bio: { type: 'string', required: false },
      },
    }),
    usernameClient(),
  ],
})

export const { signIn, signUp, signOut, useSession } = authClient
