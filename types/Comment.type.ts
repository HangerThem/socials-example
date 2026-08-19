import { Prisma } from '@/generated/prisma/client'

export type Comment = Prisma.CommentGetPayload<{
  include: {
    author: {
      include: {
        avatar: {
          include: {
            file: true
          }
        }
      }
    }
    commentLikes: true
    _count: {
      select: {
        commentLikes: true
      }
    }
  }
}> & {
  author: {
    image: string | null
  }
  liked: boolean
}
