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

  return Object.assign(userProps, {
    image: avatar?.file.path ?? null,
    isFollowing: !!isFollowing,
    isFollower: !!isFollower,
  })
}

export async function triggerFollow(username: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

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

export async function searchUsers(query: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    throw new Error('User not authenticated')
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [{ username: { contains: query } }, { displayUsername: { contains: query } }],
    },
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
    take: 10,
  })

  if (!users) {
    return []
  }

  const [isFollowing, isFollower] = await Promise.all([
    prisma.follow.findMany({
      where: {
        followerId: session.user.id,
        followingId: { in: users.map((user) => user.id) },
      },
    }),
    prisma.follow.findMany({
      where: {
        followerId: { in: users.map((user) => user.id) },
        followingId: session.user.id,
      },
    }),
  ])

  return users.map((user) => {
    const following = isFollowing.some((follow) => follow.followingId === user.id)
    const follower = isFollower.some((follow) => follow.followerId === user.id)
    const { avatar, ...userProps } = user
    return Object.assign(userProps, {
      image: avatar?.file.path ?? null,
      isFollowing: following,
      isFollower: follower,
    })
  })
}
