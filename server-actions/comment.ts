'use server'

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
  })

  return comment
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
