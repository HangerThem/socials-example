import { Prisma } from '@/generated/prisma/client'

export type Post = Prisma.PostGetPayload<{
  include: {
    postFiles: {
      include: {
        file: true
      }
    }
    author: true
    _count: {
      select: {
        comments: true
        likes: true
      }
    }
  }
}> & {
  liked: boolean
  author: {
    image: string | null
  }
}
