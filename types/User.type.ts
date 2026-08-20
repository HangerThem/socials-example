import { Prisma } from '@/generated/prisma/client'

export type UserSimple = Prisma.UserGetPayload<{}> & {
  image: string | null
}

export type User = Prisma.UserGetPayload<{
  include: {
    _count: {
      select: {
        followers: true
        following: true
        posts: true
      }
    }
  }
}> & {
  image: string | null
  isFollowing: boolean
  isFollower: boolean
}