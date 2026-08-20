import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { customSession, username } from 'better-auth/plugins'
import { prisma } from '@/lib/prisma'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  advanced: {
    database: {
      generateId: false,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    username({
      displayUsername: false,
    }),
    customSession(async ({ user, session }) => {
      const extra = await prisma.user.findUnique({
        where: { id: user.id },
        include: { avatar: { include: { file: true } } },
      })

      if (!extra) {
        throw new Error('User not found')
      }

      return {
        user: {
          ...user,
          image: extra.avatar?.file?.path || null,
          bio: extra.bio || null,
        },
        session,
      }
    }),
  ],
})
