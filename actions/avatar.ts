'use server'

import { prisma } from '@/lib/prisma'

export async function setAvatarFile(fileId: string, userId: string): Promise<{ success: boolean }> {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
  })

  if (!file) {
    throw new Error('File not found')
  }

  if (file.authorId !== userId) {
    throw new Error('You do not have permission to use this file as avatar')
  }

  const existingAvatar = await prisma.avatarFile.findUnique({
    where: { userId },
  })

  if (existingAvatar) {
    await prisma.avatarFile.update({
      where: { userId },
      data: { fileId },
    })
  } else {
    await prisma.avatarFile.create({
      data: { userId, fileId },
    })
  }

  return { success: true }
}