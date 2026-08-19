'use server'

import { getSession } from '@/helper/auth'
import { prisma } from '@/lib/prisma'

export async function setAvatarFile(fileId: string): Promise<{ success: boolean }> {
  const session = await getSession()

  if (!session?.user?.id) {
    throw new Error('User not authenticated')
  }

  let avatarFile

  try {
    avatarFile = await prisma.avatarFile.upsert({
      where: { userId: session.user.id },
      update: { fileId },
      create: {
        userId: session.user.id,
        fileId,
      },
    })
  } catch (error) {
    console.error('Error setting avatar file:', error)
  }

  if (!avatarFile) {
    throw new Error('Failed to create avatar file')
  }

  return { success: true }
}
