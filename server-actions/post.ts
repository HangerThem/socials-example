'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { batchDeleteFiles } from './file'
import { postPagination } from '@/const/pagination'

export async function createPost(content: string, fileIds: string[]) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    throw new Error('User not authenticated')
  }

  const post = await prisma.post.create({
    data: {
      content,
      author: { connect: { id: session.user.id } },
      postFiles: {
        create: fileIds.map((fileId) => ({
          file: { connect: { id: fileId } },
        })),
      },
    },
  })

  return post
}

type GetPostsParams = {
  lastPostId?: string
  limit?: number
  username?: string
}

export async function getPosts({
  lastPostId,
  limit = postPagination,
  username,
}: GetPostsParams = {}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    throw new Error('User not authenticated')
  }

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    ...(username && {
      where: { author: { username } },
    }),
    include: {
      postFiles: {
        include: {
          file: true,
        },
      },
      author: true,
      likes: true,
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
    ...(lastPostId && {
      cursor: { id: lastPostId },
      skip: 1,
    }),
    take: limit,
  })

  return posts.map((post) =>
    Object.assign(post, { liked: post.likes.some((like) => like.userId === session.user.id) }),
  )
}

export async function getPost(postId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    throw new Error('User not authenticated')
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      postFiles: {
        include: {
          file: true,
        },
      },
      author: true,
      likes: true,
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
  })

  if (!post) {
    throw new Error('Post not found')
  }

  return Object.assign(post, {
    liked: post.likes.some((like) => like.userId === session.user.id),
  })
}

export async function deletePost(postId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    throw new Error('User not authenticated')
  }

  const deletedPost = await prisma.post.delete({
    where: { id: postId, authorId: session.user.id },
    include: {
      postFiles: true,
    },
  })

  if (!deletedPost) {
    throw new Error('Post not found')
  }

  await batchDeleteFiles(deletedPost.postFiles.map((postFile) => postFile.fileId))

  return { success: true }
}

export async function triggerPostLike(postId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    throw new Error('User not authenticated')
  }

  const existingLike = await prisma.like.findUnique({
    where: {
      postId_userId: {
        postId,
        userId: session.user.id,
      },
    },
  })

  if (existingLike) {
    await prisma.like.delete({
      where: { id: existingLike.id },
    })
  } else {
    await prisma.like.create({
      data: {
        post: { connect: { id: postId } },
        user: { connect: { id: session.user.id } },
      },
    })
  }
}
