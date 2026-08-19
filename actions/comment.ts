'use server'

import { commentPagination } from '@/const/pagination'
import { getSession } from '@/helper/auth'
import { prisma } from '@/lib/prisma'
import type { Comment } from '@/types/Comment.type'

export async function createComment(postId: string, content: string): Promise<Comment> {
  const session = await getSession()

  if (!session) {
    throw new Error('User not authenticated')
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      post: { connect: { id: postId } },
      author: {
        connect: { id: session.user.id },
      },
    },
    include: {
      author: {
        include: {
          avatar: {
            include: {
              file: true,
            },
          },
        },
      },
      commentLikes: true,
      _count: {
        select: {
          commentLikes: true,
        },
      },
    },
  })

  return Object.assign(comment, {
    author: Object.assign(comment.author, {
      image: comment.author.avatar?.file.path ?? null,
    }),
    liked: false,
  })
}

export async function triggerCommentLike(commentId: string): Promise<void> {
  const session = await getSession()

  if (!session) {
    throw new Error('User not authenticated')
  }

  const existingLike = await prisma.commentLike.findFirst({
    where: {
      commentId,
      userId: session.user.id,
    },
  })

  if (existingLike) {
    await prisma.commentLike.delete({
      where: { id: existingLike.id },
    })
  } else {
    await prisma.commentLike.create({
      data: {
        commentId,
        userId: session.user.id,
      },
    })
  }
}

export async function deleteComment(commentId: string): Promise<{ success: boolean }> {
  const session = await getSession()

  if (!session) {
    throw new Error('User not authenticated')
  }

  const deletedComment = await prisma.comment.delete({
    where: { id: commentId, authorId: session.user.id },
  })

  if (!deletedComment) {
    throw new Error('Comment not found')
  }

  return { success: true }
}

type GetCommentsParams = {
  lastCommentId?: string
  limit?: number
}

export async function getComments(
  postId: string,
  { lastCommentId, limit = commentPagination }: GetCommentsParams = {},
): Promise<Comment[]> {
  const session = await getSession()

  if (!session) {
    throw new Error('User not authenticated')
  }

  const comments = await prisma.comment.findMany({
    where: {
      postId,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        include: {
          avatar: {
            include: {
              file: true,
            },
          },
        },
      },
      commentLikes: true,
      _count: {
        select: {
          commentLikes: true,
        },
      },
    },
    ...(lastCommentId && {
      cursor: { id: lastCommentId },
      skip: 1,
    }),
    take: limit,
  })

  return comments.map((comment) => {
    return Object.assign(comment, {
      author: Object.assign(comment.author, {
        image: comment.author.avatar?.file.path ?? null,
      }),
      liked: comment.commentLikes.some((like) => like.userId === session.user.id),
    })
  })
}
