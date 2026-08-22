'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/helper/auth'
import type { User, UserSimple } from '@/types/User.type'

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

export async function getFollowers(username: string): Promise<UserSimple[]> {
  const session = await getSession()

  if (!session) {
    throw new Error('User not authenticated')
  }

  const followers = await prisma.follow.findMany({
    where: {
      following: {
        username,
      },
    },
    include: {
      follower: {
        include: {
          avatar: {
            include: {
              file: true,
            },
          },
        },
      },
    },
  })

  return followers.map((follow) => {
    const { avatar, ...followerProps } = follow.follower
    return Object.assign(followerProps, {
      image: avatar?.file.path ?? null,
    })
  })
}

export async function getFollowing(username: string): Promise<UserSimple[]> {
  const session = await getSession()

  if (!session) {
    throw new Error('User not authenticated')
  }

  const following = await prisma.follow.findMany({
    where: {
      follower: {
        username,
      },
    },
    include: {
      following: {
        include: {
          avatar: {
            include: {
              file: true,
            },
          },
        },
      },
    },
  })

  return following.map((follow) => {
    const { avatar, ...followingProps } = follow.following
    return Object.assign(followingProps, {
      image: avatar?.file.path ?? null,
    })
  })
}

export async function searchUsers(query: string, threshold = 0.2, limit = 10): Promise<UserSimple[]> {
  const session = await getSession()

  if (!session) {
    throw new Error('User not authenticated')
  }

  const users = await prisma.$queryRaw<UserSimple[]>`
    SELECT u.id, u.name, u.username, u.email, f.path as image
    FROM "handle_social"."user" u
    LEFT JOIN "handle_social"."avatar_file" af ON u.id = af."userId"
    LEFT JOIN "handle_social"."file" f ON af."fileId" = f.id
    WHERE similarity(u.name, ${query}) > ${threshold}
    ORDER BY similarity(u.name, ${query}) DESC
    LIMIT ${limit}
  `;

  if (!users) {
    return []
  }

  return users.map((user) => {
    return Object.assign(user, {
      image: user.image ?? null,
    })
  })
}

export async function getUsersByUsernames(usernames: string[]): Promise<UserSimple[]> {
  const users = await prisma.user.findMany({
    where: { username: { in: usernames } },
    include: {
      avatar: {
        include: {
          file: true,
        },
      },
    },
  })

  return users.map((user) => {
    const { avatar, ...userProps } = user
    return Object.assign(userProps, {
      image: avatar?.file.path ?? null,
    })
  })
}
