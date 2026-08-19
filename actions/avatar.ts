'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

export async function createAvatarFile(fileId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.id) {
    throw new Error('User not authenticated')
  }

  return await prisma.avatarFile.upsert({
    where: { userId: session.user.id },
    update: { fileId },
    create: { userId: session.user.id, fileId },
  })
}
