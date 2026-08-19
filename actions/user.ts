'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/helper/auth'
import type { Follow, User, UserSimple } from '@/types/User.type'

export async function usernameIsUnique(username: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { username },
  })
  return !user
}

export async function emailIsUnique(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
  })
  return !user
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const session = await getSession()

  if (!session) {
    throw new Error('User not authenticated')
  }

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      avatar: {
        include: {
          file: true,
        },
      },
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  })

  if (!user) {
    return null
  }

  const { avatar, ...userProps } = user

  if (session.user.username === username) {
    return Object.assign(userProps, {
      image: avatar?.file.path ?? null,
      isFollowing: false,
      isFollower: false,
    })
  }

  const [isFollowing, isFollower] = await Promise.all([
    prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: user.id,
        },
      },
    }),
    prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: user.id,
        },
      },
    }),
  ])

  return Object.assign(userProps, {
    image: avatar?.file.path ?? null,
    isFollowing: !!isFollowing,
    isFollower: !!isFollower,
  })
}

export async function triggerFollow(username: string): Promise<void> {
  const session = await getSession()

  if (!session) {
    throw new Error('User not authenticated')
  }

  if (session.user.username === username) {
    throw new Error('You cannot follow yourself')
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

export async function getFollowers(username: string): Promise<Follow[]> {
  const session = await getSession()

  if (!session) {
    throw new Error('User not authenticated')
  }

  const userWithFollowers = await prisma.user.findUnique({
    where: { username },
    select: { followers: true },
  })

  if (!userWithFollowers) {
    throw new Error('User not found')
  }

  return userWithFollowers.followers
}

export async function getFollowing(username: string): Promise<Follow[]> {
  const session = await getSession()

  if (!session) {
    throw new Error('User not authenticated')
  }

  const userWithFollowing = await prisma.user.findUnique({
    where: { username },
    select: { following: true },
  })

  if (!userWithFollowing) {
    throw new Error('User not found')
  }

  return userWithFollowing.following
}

export async function searchUsers(query: string): Promise<UserSimple[]> {
  const session = await getSession()

  if (!session) {
    throw new Error('User not authenticated')
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [{ username: { contains: query } }, { name: { contains: query } }],
    },
    include: {
      avatar: {
        include: {
          file: true,
        },
      },
    },
    take: 10,
  })

  if (!users) {
    return []
  }

  return users.map((user) => {
    const { avatar, ...userProps } = user
    return Object.assign(userProps, {
      image: avatar?.file.path ?? null,
    })
  })
}
