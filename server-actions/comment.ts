'use server'

import { commentPagination } from '@/const/pagination'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

export async function createComment(postId: string, content: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

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
      author: true,
      commentLikes: true,
      _count: {
        select: {
          commentLikes: true,
        },
      },
    },
  })

  return Object.assign(comment, { liked: false })
}

export async function triggerCommentLike(commentId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

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

export async function deleteComment(commentId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

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
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    throw new Error('User not authenticated')
  }

  const comments = await prisma.comment.findMany({
    where: {
      postId,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      author: true,
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

  return comments.map((comment) =>
    Object.assign(comment, {
      liked: comment.commentLikes.some((like) => like.userId === session.user.id),
    }),
  )
}
