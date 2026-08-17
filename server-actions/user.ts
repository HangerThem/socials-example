'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

export async function usernameIsUnique(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
  })
  return !user
}

export async function emailIsUnique(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  })
  return !user
}

export async function getUserByUsername(username: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    throw new Error('User not authenticated')
  }

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  })

  if (!user) {
    return null
  }

  if (session.user.username === username) {
    return Object.assign(user, { isFollowing: false, isFollower: false })
  }

  const [isFollowing, isFollower] = await Promise.all([
    prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: user.id,
        },
      },
    }),
    prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: session.user.id,
        },
      },
    }),
  ])

  return Object.assign(user, { isFollowing: !!isFollowing, isFollower: !!isFollower })
}

export async function triggerFollow(username: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    throw new Error('User not authenticated')
  }

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const isFollowing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: user.id,
      },
    },
  })

  if (isFollowing) {
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: user.id,
        },
      },
    })
  } else {
    await prisma.follow.create({
      data: {
        follower: { connect: { id: session.user.id } },
        following: { connect: { id: user.id } },
      },
    })
  }
}

export async function getFollowers(username: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    throw new Error('User not authenticated')
  }

  const user = await prisma.user.findUnique({
    where: { username },
    select: { followers: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  return user.followers
}

export async function getFollowing(username: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    throw new Error('User not authenticated')
  }

  const user = await prisma.user.findUnique({
    where: { username },
    select: { following: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  return user.following
}
